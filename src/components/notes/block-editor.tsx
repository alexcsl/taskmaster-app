'use client'

import { useEffect, useRef, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import type { PartialBlock } from '@blocknote/core'
import type { Json } from '@/lib/supabase/types'

interface BlockEditorProps {
  content: Json | null
  onChange: (content: Json) => void
  editable?: boolean
}

export function BlockEditor({ content, onChange, editable = true }: BlockEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: content
      ? (content as PartialBlock[])
      : undefined,
  })

  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      onChange(editor.document as unknown as Json)
    })
    return unsubscribe
  }, [editor, onChange])

  return (
    <div className="bn-custom-wrapper">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme="dark"
        className="min-h-[400px]"
      />
    </div>
  )
}
