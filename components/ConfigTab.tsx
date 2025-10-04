"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import CodeEditor from "./CodeEditor"
import {
  Settings,
  FolderOpen,
  Eye,
  Edit,
  Save,
  FileText,
  Brain,
  Code,
  Shield,
  Folder,
  ChevronDown,
  ChevronRight,
  Search,
  SortAsc,
  SortDesc
} from "lucide-react"

interface ConfigTabProps {
  configData: any
  selectedConfig: any
  editingConfig: boolean
  configContent: string
  onSelectConfig: (file: any) => void
  onEditConfig: () => void
  onSaveConfig: () => void
  onCancelEdit: () => void
  onContentChange: (content: string) => void
  loading: boolean
}

export default function ConfigTab({
  configData,
  selectedConfig,
  editingConfig,
  configContent,
  onSelectConfig,
  onEditConfig,
  onSaveConfig,
  onCancelEdit,
  onContentChange,
  loading
}: ConfigTabProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['global']))
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')

  // Debug log
  React.useEffect(() => {
    console.log('ConfigTab received configData:', configData)
  }, [configData])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const filteredAndSortedProjects = React.useMemo(() => {
    if (!configData?.projects) return []

    let filtered = configData.projects.filter((project: any) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.sort((a: any, b: any) => {
      const comparison = a.name.localeCompare(b.name)
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [configData?.projects, searchTerm, sortOrder])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      {/* File Browser */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="flex-shrink-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration Files
          </CardTitle>
          <CardDescription>
            Browse and edit all Claude configuration files
          </CardDescription>

          {/* Search and Sort Controls */}
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleSort}
              className="flex items-center gap-1"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto auto-hide-scrollbar space-y-4 min-h-0">
          {/* Global Configuration */}
          {configData && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="p-3 bg-blue-50 dark:bg-blue-950 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => toggleSection('global')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {expandedSections.has('global') ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Global Configuration</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {(configData.global?.settings?.length || 0) +
                       (configData.global?.claudeMd ? 1 : 0) +
                       (configData.global?.agents?.length || 0)} files
                    </Badge>
                  </div>
                </div>

                {expandedSections.has('global') && (
                  <div className="p-2 space-y-1 bg-gray-50 dark:bg-gray-900">
                    {/* Global CLAUDE.md */}
                    {configData.global?.claudeMd && (
                      <div
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedConfig?.path === configData.global.claudeMd.path
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onSelectConfig(configData.global.claudeMd)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium">CLAUDE.md</span>
                        </div>
                      </div>
                    )}

                    {/* Settings Files */}
                    {configData.global?.settings?.map((file: any) => (
                      <div
                        key={file.path}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedConfig?.path === file.path
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onSelectConfig(file)}
                      >
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      </div>
                    ))}

                    {/* Agent Files */}
                    {configData.global?.agents?.map((file: any) => (
                      <div
                        key={file.path}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedConfig?.path === file.path
                            ? 'bg-blue-100 dark:bg-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onSelectConfig(file)}
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Project Configurations */}
              {filteredAndSortedProjects.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Project Configurations
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {filteredAndSortedProjects.length} of {configData?.projects?.length || 0}
                    </Badge>
                  </div>
                  {filteredAndSortedProjects.map((project: any) => (
                    <div key={project.path} className="border rounded-lg overflow-hidden">
                      <div
                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => toggleSection(project.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {expandedSections.has(project.name) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <Folder className="w-4 h-4" />
                            <span className="text-sm font-medium truncate">{project.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(project.settings?.length || 0) +
                             (project.claudeMd ? 1 : 0) +
                             (project.hooks?.length || 0) +
                             (project.agents?.length || 0)}
                          </Badge>
                        </div>
                      </div>

                      {expandedSections.has(project.name) && (
                        <div className="p-2 space-y-1 bg-gray-50 dark:bg-gray-900 border-t">
                          {/* Project CLAUDE.md */}
                          {project.claudeMd && (
                            <div
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedConfig?.path === project.claudeMd.path
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => onSelectConfig(project.claudeMd)}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-orange-500" />
                                <span className="text-sm">CLAUDE.md</span>
                              </div>
                            </div>
                          )}

                          {/* Project Settings */}
                          {project.settings?.map((file: any) => (
                            <div
                              key={file.path}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedConfig?.path === file.path
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => onSelectConfig(file)}
                            >
                              <div className="flex items-center gap-2">
                                <Code className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                            </div>
                          ))}

                          {/* Hook Files */}
                          {project.hooks?.map((file: any) => (
                            <div
                              key={file.path}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedConfig?.path === file.path
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => onSelectConfig(file)}
                            >
                              <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                            </div>
                          ))}

                          {/* Agent Files */}
                          {project.agents?.map((file: any) => (
                            <div
                              key={file.path}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedConfig?.path === file.path
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => onSelectConfig(file)}
                            >
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* File Viewer/Editor */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {selectedConfig ? (
                  <>
                    {selectedConfig.name?.endsWith('.md') ? (
                      <FileText className="w-5 h-5" />
                    ) : selectedConfig.name?.endsWith('.json') ? (
                      <Code className="w-5 h-5" />
                    ) : (
                      <Settings className="w-5 h-5" />
                    )}
                    {selectedConfig.name || 'Configuration File'}
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-5 h-5" />
                    Select a File
                  </>
                )}
              </CardTitle>
              {selectedConfig && (
                <CardDescription className="mt-1 font-mono text-xs">
                  {selectedConfig.path}
                </CardDescription>
              )}
            </div>
            {selectedConfig && (
              <div className="flex gap-2">
                {editingConfig ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSaveConfig}
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={onEditConfig}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {selectedConfig ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0">
                {editingConfig ? (
                  <CodeEditor
                    value={configContent}
                    onChange={onContentChange}
                    language={selectedConfig?.type === 'json' ? 'json' : 'markdown'}
                    height="100%"
                    placeholder="Edit configuration..."
                  />
                ) : (
                  <CodeEditor
                    value={selectedConfig.content || 'Empty file'}
                    onChange={() => {}}
                    language={selectedConfig?.type === 'json' ? 'json' : 'markdown'}
                    readOnly={true}
                    height="100%"
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t flex-shrink-0">
                <span>
                  Last modified: {new Date(selectedConfig.lastModified).toLocaleString()}
                </span>
                <span>
                  {selectedConfig.size} bytes • {selectedConfig.type || 'text'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a configuration file</p>
                <p className="text-sm">Choose from the list on the left to view or edit</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}