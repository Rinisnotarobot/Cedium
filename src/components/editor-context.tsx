import { atom, useAtom, useAtomValue } from "jotai"
import type { Content } from "@tiptap/react"

const editorContentAtom = atom<Content>("")

export function useEditorContent() {
  return useAtom(editorContentAtom)
}

export function useEditorContentValue() {
  return useAtomValue(editorContentAtom)
}

export function useHasContent() {
  const content = useAtomValue(editorContentAtom)
  if (typeof content === "string") {
    return content.trim().length > 0
  }
  return false
}