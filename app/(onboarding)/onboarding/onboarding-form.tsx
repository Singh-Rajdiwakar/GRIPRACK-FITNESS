"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, Check, Dumbbell, ImagePlus, Trophy } from "lucide-react"
import { createProfile } from "@/app/actions/profile"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MB, Uploader } from "@/components/uploader"
import { UserAvatar } from "@/components/user-avatar"
import { specialties } from "@/lib/specialties"

const roles = [
  { value: "client", icon: Dumbbell, title: "I want to train", text: "Find a coach, follow video programs, and book 1:1 sessions.", photo: "Teal Kettlebell Strength Session.png" },
  { value: "trainer", icon: Trophy, title: "I'm a coach", text: "Sell programs, offer paid sessions, and manage your clients.", photo: "Intense Pause in the Modern Gym.png" },
]

// Role switch is pure CSS: the form `group` reveals trainer fields when #role-trainer is checked
export function OnboardingForm() {
  const [avatar, setAvatar] = useState<string>()
  return (
    <ActionForm action={createProfile} className="group ob-form">
      <header className="ob-intro">
        <div>
          <p className="gr-label">Welcome to GRIPRACK</p>
          <h1>Choose your <em>path.</em></h1>
        </div>
        <p className="ob-description">Your fitness journey starts here. Tell us how you want to use GRIPRACK.</p>
      </header>

      <fieldset className="ob-options">
        <legend className="sr-only">Role</legend>
        {roles.map(({ value, icon: Icon, title, text, photo }) => (
          <label key={value} className="ob-choice" data-role={value}>
            <input type="radio" name="role" id={`role-${value}`} value={value} defaultChecked={value === "client"} className="sr-only" />
            <span className="ob-photo">
              <Image src={`/new%20img/${encodeURIComponent(photo)}`} alt="" width={1672} height={941}
                sizes="(max-width: 600px) 35vw, (max-width: 1360px) 44vw, 585px" />
            </span>
            <span className="ob-card-copy">
              <span className="ob-role"><Icon aria-hidden="true" />{value}</span>
              <span className="ob-indicator" aria-hidden="true"><Check /></span>
              <span className="ob-title">{title}</span>
              <span className="ob-detail">{text}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <section className="ob-profile hidden group-has-[#role-trainer:checked]:block">
        <h2 className="text-xl font-semibold">Your coach profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">This is what clients see in the directory. You can edit it anytime.</p>

        <div className="mt-6 grid gap-6">
          {/* The upload's ImageKit path rides along in the form; Google sign-ups who skip it keep their Google photo */}
          <Uploader accept="image/jpeg,image/png" maxBytes={5 * MB} folder="/avatars" onUpload={setAvatar} className="flex items-center gap-5">
            {avatar ? (
              <UserAvatar name="You" src={avatar} className="size-20" />
            ) : (
              <span className="grid size-20 place-items-center rounded-full border-2 border-dashed text-muted-foreground transition hover:border-primary hover:text-primary">
                <ImagePlus className="size-6" />
              </span>
            )}
            <span>
              <span className="block text-sm font-medium">{avatar ? "Change photo" : "Upload a profile photo"}</span>
              <span className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB</span>
            </span>
          </Uploader>
          <input type="hidden" name="avatar" value={avatar ?? ""} />

          <div className="grid gap-2">
            <Label htmlFor="headline">Headline</Label>
            <Input id="headline" name="headline" maxLength={80} placeholder="Strength & conditioning coach" className="h-10" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" rows={4} maxLength={1000} placeholder="Your experience, coaching style, and who you help best." />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Specialties</legend>
            <div className="flex flex-wrap gap-2">
              {specialties.map(({ slug, label, icon: Icon }) => (
                <label
                  key={slug}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition hover:border-primary/50 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-2 has-focus-visible:ring-ring"
                >
                  <input type="checkbox" name="specialties" value={slug} className="sr-only" />
                  <Icon className="size-4" /> {label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="price">Price per 60-min session</Label>
            <div className="flex h-10 items-center rounded-lg border border-input bg-transparent px-3 focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
              <span className="text-muted-foreground">$</span>
              <input id="price" name="price" type="number" min={10} max={1000} step={5} placeholder="80" className="w-full bg-transparent px-2 text-sm outline-none" />
              <span className="text-xs text-muted-foreground">USD</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ob-submit">
        <SubmitButton size="xl" className="group-has-[#role-trainer:checked]:hidden">
          Continue <ArrowRight />
        </SubmitButton>
        <SubmitButton size="xl" className="hidden group-has-[#role-trainer:checked]:inline-flex">
          Create coach profile <ArrowRight />
        </SubmitButton>
      </div>
    </ActionForm>
  )
}
