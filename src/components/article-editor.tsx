import { useState } from "react"
import type { Content } from "@tiptap/react"
import { MinimalTiptapEditor } from "#/components/ui/minimal-tiptap"
import { useIsBreakpoint } from "#/hooks/use-is-breakpoint"

export function ArticleEditor() {
  const [content, setContent] = useState<Content>("")
  const isLargeScreen = useIsBreakpoint("min", 1024)

  return (
    <div className="flex flex-col h-full">
      <MinimalTiptapEditor
        value={content}
        onChange={setContent}
        className="flex-1 border rounded-lg shadow-sm"
        editorContentClassName="p-5 prose prose-sm max-w-none"
        output="html"
        placeholder="开始写作..."
        autofocus={true}
        editable={true}
        editorClassName="focus:outline-hidden"
        toolbarVariant={isLargeScreen ? "full" : "minimal"}
      />
    </div>
  )
}