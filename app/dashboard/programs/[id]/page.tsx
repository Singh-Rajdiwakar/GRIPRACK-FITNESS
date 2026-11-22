import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft, CircleCheck, CircleDashed, Eye, ImagePlus, Plus, Trash2, Upload } from "lucide-react"
import { addLesson, deleteLesson, deleteProgram, setCover, setLessonVideo, updateProgram } from "@/app/actions/programs"
import { ActionForm, SubmitButton } from "@/components/action-form"
import { ProgramCover } from "@/components/cards"
import { StudioHeading } from "@/app/(studio)/dashboard/studio"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DetailsFields } from "../details-fields"
import { Skeleton } from "@/components/ui/skeleton"
import { MB, Uploader } from "@/components/uploader"
import { requireTrainer } from "@/lib/auth"
import { getProgram } from "@/lib/queries"
import { money } from "@/lib/utils"

type Props = PageProps<"/dashboard/programs/[id]">
type Program = NonNullable<Awaited<ReturnType<typeof getProgram>>>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return { title: (await getProgram(id))?.title ?? "Program" }
}

const card = "mg-editor-panel"

export default function ProgramEditorPage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-[70vh] rounded-2xl" />}>
      <ProgramEditor params={params} />
    </Suspense>
  )
}

async function ProgramEditor({ params }: Pick<Props, "params">) {
  const [{ id }, me] = await Promise.all([params, requireTrainer()])
  const program = await getProgram(id)
  if (program?.trainerId !== me.userId) notFound()
  return <EditProgram program={program} />
}

function BackLink() {
  return (
    <Link href="/dashboard/programs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> All programs
    </Link>
  )
}

function EditProgram({ program }: { program: Program }) {
  return (
    <div className="mg-editor">
      <BackLink />
      <StudioHeading label="Program editor" title={program.title} description="Edit details, manage lessons, and control visibility.">
        <Link href={`/programs/${program.id}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <Eye /> Preview
        </Link>
      </StudioHeading>

      <div className="mg-editor-grid">
        <div className="space-y-6">
          <ActionForm id="program-form" action={updateProgram.bind(null, program.id)} className={card}>
            <h2 className="font-semibold">Details</h2>
            <DetailsFields program={program} />
            <SubmitButton size="lg" className="mt-6">
              Save changes
            </SubmitButton>
          </ActionForm>

          <section className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Lessons</h2>
                <p className="text-sm text-muted-foreground">The first lesson is a free preview for everyone.</p>
              </div>
              <span className="text-sm text-muted-foreground">{program.lessons.length} lessons</span>
            </div>

            {program.lessons.length > 0 && (
              <ol className="mt-5 divide-y rounded-xl border mg-lessons">
                {program.lessons.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{l.title}</span>
                    {i === 0 && <Badge variant="secondary">Free preview</Badge>}
                    <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                      {l.videoPath ? <CircleCheck className="size-3.5 text-primary" /> : <CircleDashed className="size-3.5" />}
                      {l.videoPath ? "Ready" : "No video"}
                    </span>
                    <Uploader
                      private
                      accept="video/mp4,video/quicktime"
                      maxBytes={100 * MB}
                      folder={`/lessons/${program.id}`}
                      onUpload={setLessonVideo.bind(null, l.id)}
                      className={buttonVariants({ variant: "ghost", size: "icon" })}
                    >
                      <Upload />
                      <span className="sr-only">{l.videoPath ? `Replace the video for ${l.title}` : `Upload a video for ${l.title}`}</span>
                    </Uploader>
                    <ActionForm action={deleteLesson.bind(null, l.id)}>
                      <SubmitButton variant="ghost" size="icon" aria-label={`Delete ${l.title}`} confirm={`Delete "${l.title}"?`}>
                        <Trash2 />
                      </SubmitButton>
                    </ActionForm>
                  </li>
                ))}
              </ol>
            )}

            {/* Keyed on the count so the title input clears once the lesson lands */}
            <ActionForm key={program.lessons.length} action={addLesson.bind(null, program.id)} className="mt-5">
              <div className="flex gap-2">
                <Input name="title" required minLength={2} maxLength={120} placeholder={`Lesson ${program.lessons.length + 1} title`} className="h-10" aria-label="New lesson title" />
                <SubmitButton size="lg" variant="outline" className="h-10">
                  <Plus /> Add lesson
                </SubmitButton>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Then upload its video from the lesson row: MP4 or MOV, up to 100 MB, stored privately.</p>
            </ActionForm>
          </section>
        </div>

        <div className="space-y-6">
          <section className={card}>
            <h2 className="font-semibold">Cover image</h2>
            <Uploader
              accept="image/jpeg,image/png"
              maxBytes={5 * MB}
              folder={`/covers/${program.id}`}
              onUpload={setCover.bind(null, program.id)}
              className="group mt-4 grid aspect-video place-items-center overflow-hidden rounded-xl border-2 border-dashed text-center"
            >
              <ProgramCover program={program} sizes="340px" />
              <span className="relative flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition group-hover:bg-black/60 group-hover:text-white">
                <ImagePlus className="size-5" />
                <span className="sr-only group-hover:not-sr-only">{program.coverUrl ? "Replace image" : "Upload cover"}</span>
              </span>
            </Uploader>
            <p className="mt-2 text-xs text-muted-foreground">16:9 · JPG or PNG · optimized automatically</p>
          </section>

          <section className={card}>
            <h2 className="font-semibold">Visibility <span className="mg-saved">{program.published ? "Published" : "Draft"}</span></h2>
            {/* Part of the details form via form="program-form": saved with "Save changes" */}
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">Published</span>
                <span className="text-xs text-muted-foreground">Visible on your profile and the directory. Save to apply.</span>
              </span>
              <input form="program-form" name="published" type="checkbox" defaultChecked={program.published} className="peer sr-only" aria-label="Published" />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-input transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
            </label>
            {program.sales > 0 && (
              <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                {program.sales} {program.sales === 1 ? "client owns" : "clients own"} this program, so it can be unpublished but not deleted.
              </p>
            )}
          </section>

          <section className={card}>
            <h2 className="font-semibold">Performance</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted-foreground">Sales</dt>
                <dd className="font-heading text-2xl font-bold">{program.sales}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Revenue</dt>
                <dd className="font-heading text-2xl font-bold">{money(program.revenueCents)}</dd>
              </div>
            </dl>
            <ActionForm action={deleteProgram.bind(null, program.id)}>
              <SubmitButton variant="destructive" className="mt-5 w-full" disabled={program.sales > 0} confirm={`Delete "${program.title}" and all its lessons?`}>
                <Trash2 /> Delete program
              </SubmitButton>
            </ActionForm>
          </section>
        </div>
      </div>
    </div>
  )
}
