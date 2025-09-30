"use client"

import React from 'react'
import Editor from '@monaco-editor/react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  readOnly?: boolean
  height?: string
  placeholder?: string
}

export default function CodeEditor({
  value,
  onChange,
  language = 'markdown',
  readOnly = false,
  height = '100%',
  placeholder
}: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '')
  }

  return (
    <div className="h-full p-4">
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900" style={{ height: 'calc(100% - 0px)' }}>
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={handleEditorChange}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            lineNumbers: readOnly ? 'off' : 'on',
            wordWrap: 'on',
            automaticLayout: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12,
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false
            },
            placeholder: placeholder || 'Enter your content...',
            folding: !readOnly,
            renderLineHighlight: readOnly ? 'none' : 'line',
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            contextmenu: !readOnly,
            mouseWheelZoom: false,
            links: true,
            colorDecorators: true,
            bracketPairColorization: {
              enabled: true
            },
            padding: { top: 16, bottom: 16, left: 16, right: 16 },
            lineDecorationsWidth: readOnly ? 0 : 10,
            lineNumbersMinChars: 3,
            glyphMargin: !readOnly,
            renderValidationDecorations: readOnly ? 'off' : 'on'
          }}
          theme="vs"
        />
      </div>
    </div>
  )
}