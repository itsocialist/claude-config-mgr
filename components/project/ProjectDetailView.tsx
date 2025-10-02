"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeEditor from "../CodeEditor"
import {
  FileText,
  Settings,
  Brain,
  Server,
  Code,
  ArrowLeft,
  Save,
  Edit,
  Copy,
  GitCompare,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Plus,
  Clipboard,
  Check
} from "lucide-react"

interface ProjectDetailViewProps {
  project: {
    name: string
    path: string
    claudeMd?: any
    settings: any[]
    agents: any[]
    hooks?: any[]
    mcpServers?: any[]
  }
  isGlobal?: boolean
  onBack: () => void
  onSave?: (type: string, content: string, filePath: string) => Promise<void>
  onCopyTo?: () => void
  onCompare?: () => void
}

type ConfigType = 'instructions' | 'settings' | 'agents' | 'mcp' | 'hooks'

export default function ProjectDetailView({
  project,
  isGlobal = false,
  onBack,
  onSave,
  onCopyTo,
  onCompare
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<ConfigType>('instructions')
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // Get files for active tab
  const getFilesForTab = (tab: ConfigType) => {
    switch (tab) {
      case 'instructions':
        return project.claudeMd ? [project.claudeMd] : []
      case 'settings':
        return project.settings || []
      case 'agents':
        return project.agents || []
      case 'mcp':
        // Parse MCP servers from settings files
        return project.settings?.filter((s: any) =>
          s.name?.includes('mcp') || s.content?.includes('mcpServers')
        ) || []
      case 'hooks':
        return project.hooks || []
      default:
        return []
    }
  }

  const files = getFilesForTab(activeTab)

  // Select first file when tab changes or clear if no files
  React.useEffect(() => {
    const tabFiles = getFilesForTab(activeTab)
    if (tabFiles.length > 0) {
      setSelectedFile(tabFiles[0])
      setContent(tabFiles[0].content || '')
    } else {
      setSelectedFile(null)
      setContent('')
    }
    setEditing(false) // Reset editing state on tab change
  }, [activeTab])

  const handleSave = async () => {
    if (!selectedFile || !onSave) return

    await onSave(activeTab, content, selectedFile.path)
    setEditing(false)
  }

  const handleCopyToClipboard = async () => {
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleFileSelect = (file: any) => {
    if (editing && selectedFile?.path !== file.path) {
      if (!confirm('Discard unsaved changes?')) return
    }
    setSelectedFile(file)
    setContent(file.content || '')
    setEditing(false)
  }

  const handleAddFile = () => {
    // Get appropriate file name based on active tab
    let fileName = ''
    let defaultContent = ''
    let filePath = ''

    switch (activeTab) {
      case 'instructions':
        fileName = 'CLAUDE.md'
        defaultContent = `# Claude Configuration

## Project Overview
[Brief description of this project]

## Key Conventions
- Architecture decisions
- Code style guidelines
- Important patterns

## Key Files and Commands
- Core functions
- Common scripts
- Custom commands

## Workflow Instructions
- Development process
- Branch naming conventions
- Testing requirements

## Best Practices
- Code quality standards
- Error handling approaches
- Performance considerations
`
        // Follow proper CLAUDE.md conventions:
        // Primary location should be project root for version control
        // Only use .claude/ for legacy compatibility
        if (project.claudeMd?.path) {
          // If existing CLAUDE.md is in legacy .claude location, keep it there
          if (project.claudeMd.path.includes('/.claude/')) {
            filePath = `${project.path}/.claude/${fileName}`
          } else {
            // Otherwise use project root (standard location)
            filePath = `${project.path}/${fileName}`
          }
        } else {
          // For new files, default to project root (standard location)
          filePath = `${project.path}/${fileName}`
        }
        break
      case 'settings':
        fileName = 'claude_desktop_config.json'
        defaultContent = '{\n  \n}'
        filePath = `${project.path}/.claude/${fileName}`
        break
      case 'agents':
        fileName = 'agent.json'
        defaultContent = '{\n  "name": "",\n  "description": ""\n}'
        filePath = `${project.path}/.claude/agents/${fileName}`
        break
      case 'mcp':
        fileName = '.mcp.json'
        defaultContent = '{\n  "mcpServers": {\n    \n  }\n}'
        // MCP files should be in project root, not in .claude or .mcp directory
        filePath = `${project.path}/${fileName}`
        break
      case 'hooks':
        fileName = 'hooks.json'
        defaultContent = '{\n  \n}'
        filePath = `${project.path}/.claude/hooks/${fileName}`
        break
    }

    // Create new file object
    const newFile = {
      name: fileName,
      path: filePath,
      content: defaultContent,
      size: defaultContent.length
    }

    // Select the new file and put it in edit mode
    setSelectedFile(newFile)
    setContent(defaultContent)
    setEditing(true)
  }

  const getLanguageForFile = (file: any) => {
    if (!file) return 'plaintext'
    if (file.name?.endsWith('.json')) return 'json'
    if (file.name?.endsWith('.md')) return 'markdown'
    if (file.name?.endsWith('.yaml') || file.name?.endsWith('.yml')) return 'yaml'
    return 'plaintext'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header Section */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b shadow-sm">
        {/* Navigation Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                {isGlobal ? (
                  <Shield className="w-5 h-5 text-blue-600" />
                ) : (
                  <Code className="w-5 h-5" />
                )}
                <h2 className="text-2xl font-bold">{project.name}</h2>
                {isGlobal && <Badge className="bg-blue-500">Global</Badge>}
              </div>
              <p className="text-sm text-gray-500">{project.path}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {onCopyTo && (
              <Button variant="outline" size="sm" onClick={onCopyTo}>
                <Copy className="w-4 h-4 mr-2" />
                Copy To
              </Button>
            )}
            {onCompare && (
              <Button variant="outline" size="sm" onClick={onCompare}>
                <GitCompare className="w-4 h-4 mr-2" />
                Compare
              </Button>
            )}
          </div>
        </div>

        {/* Tabs - Also Fixed */}
        <div className="px-6 pb-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigType)}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="instructions" className="gap-2">
                <FileText className="w-4 h-4" />
                Memory
                {project.claudeMd && <Badge variant="secondary" className="ml-1 px-1 text-xs">1</Badge>}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
                {project.settings?.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">{project.settings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2">
                <Brain className="w-4 h-4" />
                Agents
                {project.agents?.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">{project.agents.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="mcp" className="gap-2">
                <Server className="w-4 h-4" />
                MCP
                {project.mcpServers && project.mcpServers.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">{project.mcpServers.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="hooks" className="gap-2">
                <Code className="w-4 h-4" />
                Hooks
                {project.hooks && project.hooks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 text-xs">{project.hooks.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Configuration Content */}
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Configuration</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-4 gap-6 h-[600px]">
              {/* File List */}
              <div className="col-span-1 border rounded-lg p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Files</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddFile}
                    className="h-7 w-7 p-0"
                    title="Add new file"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {files.length === 0 ? (
                  <p className="text-sm text-gray-500">No files</p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file: any) => (
                      <div
                        key={file.path || file.name}
                        className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                          selectedFile?.path === file.path
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => handleFileSelect(file)}
                      >
                        <div className="font-medium truncate">{file.name || 'CLAUDE.md'}</div>
                        {file.size && (
                          <div className="text-xs text-gray-500">{file.size} bytes</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="col-span-3 border rounded-lg overflow-hidden">
                {selectedFile ? (
                  <div className="h-full flex flex-col">
                    {/* Editor Header */}
                    <div className="p-3 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{selectedFile.name || 'CLAUDE.md'}</h4>
                        <p className="text-xs text-gray-500">{selectedFile.path}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyToClipboard}
                          title="Copy to clipboard"
                        >
                          {copiedToClipboard ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        {editing ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditing(false)
                              setContent(selectedFile.content || '')
                            }}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1">
                      <CodeEditor
                        value={content}
                        onChange={setContent}
                        language={getLanguageForFile(selectedFile)}
                        readOnly={!editing}
                        height="100%"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Select a file to view</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}