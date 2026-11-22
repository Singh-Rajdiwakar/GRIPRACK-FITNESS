"use client"

import Link from "next/link"
import { useState } from "react"
import { updateTrainerProfile } from "@/app/actions/profile"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MB, Uploader } from "@/components/uploader"
import { UserAvatar } from "@/components/user-avatar"
import type { TrainerSummary } from "@/lib/queries"
import { specialties } from "@/lib/specialties"

export function ProfileEditor({ trainer }: { trainer: TrainerSummary }) {
  const [photo, setPhoto] = useState("")
  const [uploading, setUploading] = useState(false)

  return <section className="shell py-10 sm:py-16">
    <div className="mx-auto max-w-2xl">
      <p className="fx-kicker">Coach profile</p>
      <h1 className="mt-3 font-heading text-4xl font-bold">Edit profile</h1>
      <ActionForm action={updateTrainerProfile.bind(null, trainer.id)} className="mt-7 grid gap-6 rounded-lg border bg-card p-5 sm:p-8">
        <Uploader accept="image/jpeg,image/png" maxBytes={5 * MB} folder="/avatars" onUpload={setPhoto}
          onUploadingChange={setUploading} className="inline-flex items-center gap-4">
          <UserAvatar name={trainer.name} src={photo || trainer.avatarUrl} className="size-16" />
          <span><strong className="block text-primary">Change photo</strong><small>JPG or PNG, up to 5 MB</small></span>
        </Uploader>
        <input type="hidden" name="avatar" value={photo} />
        <label className="grid gap-2 text-sm font-medium">Display name
          <Input name="name" autoComplete="name" defaultValue={trainer.name} maxLength={120} required />
        </label>
        <label className="grid gap-2 text-sm font-medium">Headline
          <Input name="headline" defaultValue={trainer.headline ?? ""} minLength={3} maxLength={80} required />
        </label>
        <label className="grid gap-2 text-sm font-medium">Bio
          <Textarea name="bio" defaultValue={trainer.bio ?? ""} rows={4} minLength={20} maxLength={1000} required />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Specialties</legend>
          <div className="flex flex-wrap gap-2">{specialties.map(({ slug, label }) => (
            <label key={slug} className="flex cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm has-checked:border-primary">
              <input type="checkbox" name="specialties" value={slug} defaultChecked={trainer.specialties?.includes(slug)} className="accent-primary" />
              {label}
            </label>
          ))}</div>
        </fieldset>
        <label className="grid gap-2 text-sm font-medium">Price per 60-minute session (USD)
          <Input type="number" name="price" min={10} max={1000} step={1} required
            defaultValue={trainer.sessionPriceCents == null ? "" : trainer.sessionPriceCents / 100} />
        </label>
        <div className="flex flex-wrap gap-3">
          <SubmitButton disabled={uploading}>{uploading ? "Uploading photo…" : "Save changes"}</SubmitButton>
          <Link href={`/trainers/${trainer.id}`} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
        </div>
      </ActionForm>
    </div>
  </section>
}
