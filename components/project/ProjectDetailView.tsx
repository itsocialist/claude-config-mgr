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
  Shield
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
  onCopyTo?: (targetProject: string) => void
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

  // Select first file when tab changes
  React.useEffect(() => {
    const tabFiles = getFilesForTab(activeTab)
    if (tabFiles.length > 0 && !selectedFile) {
      setSelectedFile(tabFiles[0])
      setContent(tabFiles[0].content || '')
    }
  }, [activeTab])

  const handleSave = async () => {
    if (!selectedFile || !onSave) return

    await onSave(activeTab, content, selectedFile.path)
    setEditing(false)
  }

  const handleFileSelect = (file: any) => {
    if (editing && selectedFile?.path !== file.path) {
      if (!confirm('Discard unsaved changes?')) return
    }
    setSelectedFile(file)
    setContent(file.content || '')
    setEditing(false)
  }

  const getLanguageForFile = (file: any) => {
    if (!file) return 'plaintext'
    if (file.name?.endsWith('.json')) return 'json'
    if (file.name?.endsWith('.md')) return 'markdown'
    if (file.name?.endsWith('.yaml') || file.name?.endsWith('.yml')) return 'yaml'
    return 'plaintext'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <Button variant="outline" size="sm" onClick={() => onCopyTo(project.name)}>
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

      {/* Configuration Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ConfigType)}>
          <CardHeader>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="instructions" className="gap-2">
                <FileText className="w-4 h-4" />
                Instructions
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
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-4 gap-6 h-[600px]">
              {/* File List */}
              <div className="col-span-1 border rounded-lg p-4 overflow-y-auto">
                <h3 className="font-semibold mb-3 text-sm">Files</h3>
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
        </Tabs>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.claudeMd ? 1 : 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.settings?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.agents?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">MCP Servers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.mcpServers?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{project.hooks?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}