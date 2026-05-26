import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Typography } from "@tiptap/extension-typography";
import { TextStyle } from "@tiptap/extension-text-style";
import { Selection } from "@tiptap/extensions";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import { cn } from "#/lib/utils";
import {
  Image,
  HorizontalRule,
  CodeBlockLowlight,
  Color,
  UnsetAllMarks,
  ResetMarksOnEnter,
} from "#/components/ui/minimal-tiptap/extensions";

interface ArticleContentProps {
  content: string;
  className?: string;
}

const createReadonlyExtensions = () => [
  StarterKit.configure({
    blockquote: { HTMLAttributes: { class: "block-node" } },
    bulletList: { HTMLAttributes: { class: "list-node" } },
    code: { HTMLAttributes: { class: "inline", spellcheck: "false" } },
    codeBlock: false,
    heading: { HTMLAttributes: { class: "heading-node" } },
    horizontalRule: false,
    link: {
      enableClickSelection: true,
      openOnClick: true,
      HTMLAttributes: { class: "link" },
    },
    orderedList: { HTMLAttributes: { class: "list-node" } },
    paragraph: { HTMLAttributes: { class: "text-node" } },
  }),
  Image.configure({
    allowBase64: true,
  }),
  Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  TaskList.configure({
    HTMLAttributes: { class: "task-list-node" },
  }),
  TaskItem.configure({
    nested: true,
  }),
  TableKit.configure({
    table: {
      resizable: true,
      HTMLAttributes: { class: "table-node" },
    },
  }),
];

export function ArticleContent({ content, className }: ArticleContentProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createReadonlyExtensions(),
    editable: false,
    editorProps: {
      attributes: {
        class: cn("focus:outline-hidden prose prose-lg max-w-none", className),
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      // 使用 queueMicrotask 避免 flushSync 警告
      // Tiptap dispatches transactions synchronously，需要延迟到 React render cycle 之后
      queueMicrotask(() => {
        try {
          const parsedContent = JSON.parse(content);
          editor.commands.setContent(parsedContent);
        } catch {
          editor.commands.setContent(content);
        }
      });
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContent
      editor={editor}
      className="minimal-tiptap-editor prose prose-lg dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary prose-code:bg-muted prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-img:rounded-lg prose-img:shadow-md"
    />
  );
}
