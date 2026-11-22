"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import type { ActionResult } from "@/components/action-form"
import { isFileIn } from "@/lib/access"
import { homeFor, requireTrainer, requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { specialties } from "@/lib/specialties"

const trainerFields = z.object({
  headline: z.string().trim().min(3, "Add a headline").max(80, "Keep the headline under 80 characters"),
  bio: z.string().trim().min(20, "Write a bio of at least 20 characters").max(1000),
  specialties: z.array(z.enum(specialties.map((s) => s.slug))).min(1, "Pick at least one specialty"),
  price: z.coerce.number().int().min(10, "Session price must be at least $10").max(1000, "Session price must be $1,000 or less"),
})

// The ImageKit path of an onboarding upload (hidden input); without one we keep the Google photo
const avatarPath = z
  .string()
  .refine((path) => isFileIn("/avatars", path), "Upload your photo again")
  .optional()

const editFields = trainerFields.extend({
  name: z.string().trim().min(1, "Enter your display name").max(120, "Keep your name under 120 characters"),
  experienceYears: z.preprocess(
    value => value === "" ? null : value,
    z.coerce.number().pipe(z.int32().nonnegative("Enter zero or more years")).nullish(),
  ),
  avatar: avatarPath,
})

export async function updateTrainerProfile(profileId: string, _state: ActionResult, form: FormData): Promise<ActionResult> {
  const trainer = await requireTrainer()
  if (profileId !== trainer.userId) return { error: "You can only edit your own profile." }

  const parsed = editFields.safeParse({
    name: form.get("name"), avatar: form.get("avatar") || undefined,
    experienceYears: form.get("experienceYears") ?? undefined,
    headline: form.get("headline"), bio: form.get("bio"),
    specialties: form.getAll("specialties"), price: form.get("price"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { avatar, price, ...details } = parsed.data
  const updated = await db.update(profiles)
    .set({ ...details, sessionPriceCents: price * 100, avatarUrl: avatar })
    .where(and(eq(profiles.userId, trainer.userId), eq(profiles.role, "trainer")))
    .returning({ id: profiles.userId })
  if (!updated.length) return { error: "Your trainer profile could not be updated." }

  const path = `/trainers/${trainer.userId}`
  revalidatePath(path)
  redirect(path)
}

export async function createProfile(_state: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser()
  if (user.profile) redirect(homeFor(user.profile.role))

  const role = z.enum(["client", "trainer"]).catch("client").parse(formData.get("role"))
  const avatar = avatarPath.safeParse(formData.get("avatar") || undefined)
  if (!avatar.success) return { error: avatar.error.issues[0].message }
  let trainer = {}
  if (role === "trainer") {
    const parsed = trainerFields.safeParse({
      headline: formData.get("headline"),
      bio: formData.get("bio"),
      specialties: formData.getAll("specialties"),
      price: formData.get("price"),
    })
    if (!parsed.success) return { error: parsed.error.issues[0].message }
    const { price, ...rest } = parsed.data
    trainer = { ...rest, sessionPriceCents: price * 100 }
  }

  await db
    .insert(profiles)
    .values({ userId: user.id, role, name: user.name || user.email, avatarUrl: avatar.data ?? user.image, ...trainer })
    .onConflictDoNothing()
  // New clients start by browsing coaches
  redirect(role === "trainer" ? "/dashboard" : "/trainers")
}
