"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CodeEditor from "@/components/CodeEditor"
import CrossProjectActions from "@/components/CrossProjectActions"
import ProjectMCPServers from "@/components/ProjectMCPServers"
import {
  Settings,
  Server,
  FileText,
  Folder,
  Brain,
  Code,
  Shield,
  Globe,
  Plus,
  Copy,
  Eye,
  Edit,
  Save,
  RefreshCw,
  Search,
  GitBranch,
  Download,
  Upload,
  Archive,
  BookOpen,
  ChevronRight,
  FolderOpen,
  Check,
  AlertCircle
} from "lucide-react"

interface Project {
  name: string
  path: string
  claudeDir?: string
  claudeMd?: any
  settings?: any[]
  agents?: any[]
  hooks?: any[]
}

interface ConfigData {
  global: {
    claudeMd?: any
    settings: any[]
    agents: any[]
    hooks: any[]
  }
  projects: Project[]
}

export default function ProjectCentricDashboard() {
  const [activeProject, setActiveProject] = useState<string>("global")
  const [configData, setConfigData] = useState<ConfigData | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<boolean>(false)
  const [itemContent, setItemContent] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showProfiles, setShowProfiles] = useState(false)
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<string>("")
  const [showCrossProject, setShowCrossProject] = useState(false)
  const [showMCPServers, setShowMCPServers] = useState(false)
  const [showSensitive, setShowSensitive] = useState(false)

  useEffect(() => {
    fetchConfigData()
    fetchProfiles()
  }, [])

  const fetchConfigData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/config-files")
      const data = await res.json()
      setConfigData(data)
    } catch (error) {
      console.error("Failed to fetch config data:", error)
    }
    setLoading(false)
  }

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/profiles")
      const data = await res.json()
      setProfiles(data.profiles)
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
    }
  }

  const getCurrentProject = (): Project | null => {
    if (activeProject === "global") {
      return {
        name: "Global",
        path: "~/.claude",
        claudeMd: configData?.global?.claudeMd,
        settings: configData?.global?.settings || [],
        agents: configData?.global?.agents || [],
        hooks: configData?.global?.hooks || []
      }
    }
    return configData?.projects?.find(p => p.name === activeProject) || null
  }

  const getProjectTabs = () => {
    const tabs = [{ name: "global", displayName: "Global", isGlobal: true }]

    if (configData?.projects) {
      const filteredProjects = configData.projects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      tabs.push(...filteredProjects.map(p => ({
        name: p.name,
        displayName: p.name,
        isGlobal: false
      })))
    }

    return tabs
  }

  const selectItem = (item: any) => {
    setSelectedItem(item)
    setItemContent(item.content || "")
    setEditingItem(false)
  }

  const saveItem = async () => {
    if (!selectedItem) return

    setLoading(true)
    try {
      const endpoint = selectedItem.path.includes('CLAUDE.md') ? '/api/claude-md' : '/api/config-files'

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedItem.path,
          content: itemContent
        })
      })

      if (res.ok) {
        setEditingItem(false)
        await fetchConfigData()
        alert(`${selectedItem.name} saved successfully!`)
      }
    } catch (error) {
      console.error("Failed to save:", error)
    }
    setLoading(false)
  }

  const handleCopyConfig = async (sourceProject: string, targetProject: string, configType: string, configName: string) => {
    // This would implement the copy logic - placeholder for now
    console.log(`Copy ${configName} from ${sourceProject} to ${targetProject}`)
    alert(`Copy operation: ${configName} from ${sourceProject} to ${targetProject}`)
  }

  const handleMCPServerUpdate = async (servers: any[]) => {
    // This would implement MCP server update logic - placeholder for now
    console.log('Update MCP servers:', servers)
    await fetchConfigData() // Refresh data
  }

  const project = getCurrentProject()
  const hasConfigs = project && (
    project.settings.length > 0 ||
    project.agents.length > 0 ||
    project.hooks?.length > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Claude Config Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Project-centric configuration management
                </p>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowProfiles(!showProfiles)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Archive className="w-4 h-4 mr-2" />
                Profiles
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowMCPServers(!showMCPServers)}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Server className="w-4 h-4 mr-2" />
                MCP Servers
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCrossProject(!showCrossProject)}
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Cross-Project
              </Button>
              <Button
                onClick={fetchConfigData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Project Tabs */}
          <Card className="border-0 shadow-lg mb-6">
            <div className="p-2">
              <Tabs value={activeProject} onValueChange={setActiveProject}>
                <TabsList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 w-full bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                  {getProjectTabs().map((tab) => (
                    <TabsTrigger
                      key={tab.name}
                      value={tab.name}
                      className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {tab.isGlobal ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Folder className="w-4 h-4" />
                      )}
                      <span className="truncate">{tab.displayName}</span>
                    </TabsTrigger>
                  ))}
                  <TabsTrigger
                    value="__new"
                    onClick={() => {/* Handle new project */}}
                    className="flex items-center gap-2 text-sm font-medium border-2 border-dashed border-slate-300 data-[state=active]:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Project</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </Card>
        </div>

        {/* Profiles Panel (Collapsible) */}
        {showProfiles && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-purple-600" />
                  Configuration Profiles
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowProfiles(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {profiles.map((profile) => (
                  <Card key={profile.name} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          profile.name === currentProfile ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <CardTitle className="text-base">{profile.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Upload className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* MCP Servers Panel (Collapsible) */}
        {showMCPServers && project && (
          <div className="mb-6">
            <ProjectMCPServers
              projectName={project.name}
              isGlobal={activeProject === "global"}
              configData={configData}
              onServerUpdate={handleMCPServerUpdate}
              showSensitive={showSensitive}
              onToggleSensitive={() => setShowSensitive(!showSensitive)}
            />
          </div>
        )}

        {/* Cross-Project Actions Panel (Collapsible) */}
        {showCrossProject && configData && (
          <div className="mb-6">
            <CrossProjectActions
              projects={configData.projects || []}
              globalProject={{
                name: "Global",
                path: "~/.claude",
                claudeMd: configData.global?.claudeMd,
                settings: configData.global?.settings || [],
                agents: configData.global?.agents || [],
                hooks: configData.global?.hooks || []
              }}
              onCopyConfig={handleCopyConfig}
            />
          </div>
        )}

        {/* Main Content - Project Context View */}
        {project && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)]">
            {/* Context Cards */}
            <div className="lg:col-span-1 space-y-4">
              {/* Instructions Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-t-lg pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {project.claudeMd ? (
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedItem?.path === project.claudeMd.path
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => selectItem(project.claudeMd)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">CLAUDE.md</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(project.claudeMd.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No instructions found</p>
                      <Button size="sm" variant="outline" className="mt-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Create
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuration Files Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-t-lg pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    Configuration
                    <Badge variant="secondary" className="ml-auto">
                      {project.settings.length + (project.hooks?.length || 0)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {project.settings.map((file) => (
                      <div
                        key={file.path}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedItem?.path === file.path
                            ? 'border border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => selectItem(file)}
                      >
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {project.hooks?.map((file) => (
                      <div
                        key={file.path}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedItem?.path === file.path
                            ? 'border border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => selectItem(file)}
                      >
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {!hasConfigs && (
                      <div className="text-center py-4 text-gray-500">
                        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No config files</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Agents Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-t-lg pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Agents
                    <Badge variant="secondary" className="ml-auto">
                      {project.agents.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {project.agents.map((file) => (
                      <div
                        key={file.path}
                        className={`p-2 rounded cursor-pointer transition-colors ${
                          selectedItem?.path === file.path
                            ? 'border border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => selectItem(file)}
                      >
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      </div>
                    ))}
                    {project.agents.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No agents</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedItem ? (
                          <>
                            {selectedItem.name?.endsWith('.md') ? (
                              <FileText className="w-5 h-5" />
                            ) : selectedItem.name?.endsWith('.json') ? (
                              <Code className="w-5 h-5" />
                            ) : (
                              <Settings className="w-5 h-5" />
                            )}
                            {selectedItem.name || 'Configuration File'}
                          </>
                        ) : (
                          <>
                            <FolderOpen className="w-5 h-5" />
                            Select an Item
                          </>
                        )}
                      </CardTitle>
                      {selectedItem && (
                        <CardDescription className="mt-1 font-mono text-xs">
                          {selectedItem.path}
                        </CardDescription>
                      )}
                    </div>
                    {selectedItem && (
                      <div className="flex gap-2">
                        {editingItem ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(false)
                                setItemContent(selectedItem.content || '')
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveItem}
                              disabled={loading}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigator.clipboard.writeText(selectedItem.content || '')}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setEditingItem(true)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {selectedItem ? (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 min-h-0">
                        {editingItem ? (
                          <CodeEditor
                            value={itemContent}
                            onChange={setItemContent}
                            language={selectedItem?.type === 'json' ? 'json' : 'markdown'}
                            height="100%"
                            placeholder="Edit content..."
                          />
                        ) : (
                          <CodeEditor
                            value={selectedItem.content || 'Empty file'}
                            onChange={() => {}}
                            language={selectedItem?.type === 'json' ? 'json' : 'markdown'}
                            readOnly={true}
                            height="100%"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t flex-shrink-0">
                        <span>
                          Last modified: {new Date(selectedItem.lastModified).toLocaleString()}
                        </span>
                        <span>
                          {selectedItem.size} bytes • {selectedItem.type || 'text'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select an item to view or edit</p>
                        <p className="text-sm">Choose from the cards on the left</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}