import "server-only"
import { createHmac } from "node:crypto"
import { getUploadAuthParams } from "@imagekit/next/server"

// Server-only: holds the private key, which signs uploads and private-file URLs
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY!
const publicKey = process.env.IMAGEKIT_PUBLIC_KEY!
const endpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "").replace(/\/$/, "")

// One browser upload: token, expire and signature (valid 30 min) plus the public key upload() needs
export const uploadAuth = () => ({ ...getUploadAuthParams({ privateKey, publicKey }), publicKey })

// A stored file's URL, percent-encoded the same way the video player builds its URLs
export const fileUrl = (path: string) => new URL(endpoint + path).href

// ImageKit can serve the video even when its audio cannot be transcribed.
// Probe the two optional assets independently, after the page checks lesson access.
export async function getLessonTrackAvailability(path: string) {
  const src = fileUrl(path)
  async function available(asset: string) {
    try {
      const response = await fetch(signUrl(`${src}/${asset}`, 60), {
        method: "HEAD",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      })
      if (!response.ok && response.status !== 400 && response.status !== 404) {
        console.warn(`ImageKit ${asset} availability check returned HTTP ${response.status}`)
      }
      return response.ok
    } catch {
      console.warn(`ImageKit ${asset} availability check did not complete`)
      return false
    }
  }
  const [subtitles, chapters] = await Promise.all([
    available("ik-gensubtitle.transcript"),
    available("ik-genchapter.vtt"),
  ])
  return { subtitles, chapters }
}

// ImageKit's signed-URL scheme: HMAC-SHA1 over everything after "<endpoint>/" (query included) plus the expiry.
// Changing any part of the URL, or using it after `ik-t`, gets a 403.
export function signUrl(url: string, expiresIn: number) {
  // The video player derives subtitle/chapter/thumbnail URLs from the already-signed video URL; re-sign from scratch
  const [path, query = ""] = url.split("?")
  const params = query.split("&").filter((p) => p && !/^ik-[ts]=/.test(p))
  url = params.length ? `${path}?${params.join("&")}` : path
  const expire = Math.floor(Date.now() / 1000) + expiresIn
  const signature = createHmac("sha1", privateKey).update(url.replace(`${endpoint}/`, "") + expire).digest("hex")
  return `${url}${url.includes("?") ? "&" : "?"}ik-t=${expire}&ik-s=${signature}`
}
