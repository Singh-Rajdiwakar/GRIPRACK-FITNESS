import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Shared by create and edit; native attributes give instant hints, the server action validates for real
export function DetailsFields({ program }: { program?: { title: string; description: string; priceCents: number } }) {
  return (
    <div className="mt-5 grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={3} maxLength={80} defaultValue={program?.title} placeholder="e.g. 8-Week Strength Foundations" className="h-10" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required minLength={10} maxLength={2000} rows={4} defaultValue={program?.description} placeholder="What will clients achieve? Who is it for?" />
      </div>
      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="price">Price</Label>
        <div className="flex h-10 items-center rounded-lg border border-input px-3 focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
          <span className="text-muted-foreground">$</span>
          <input id="price" name="price" type="number" required min={1} max={1000} step={1} defaultValue={program && program.priceCents / 100} placeholder="49" className="w-full bg-transparent px-2 text-sm outline-none" />
          <span className="text-xs text-muted-foreground">USD</span>
        </div>
      </div>
    </div>
  )
}
