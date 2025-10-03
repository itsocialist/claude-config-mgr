"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ConfigTab from "@/components/ConfigTab"
import CodeEditor from "@/components/CodeEditor"
import {
  Server,
  Settings,
  Download,
  Upload,
  Shield,
  RefreshCw,
  Save,
  FolderOpen,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Brain,
  FileText,
  Folder,
  Terminal,
  Clock,
  Edit,
  Code,
  BookOpen,
  Archive,
  Database,
  Search,
  SortAsc,
  SortDesc
} from "lucide-react"

export default function Dashboard() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<string>("")
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [showSensitive, setShowSensitive] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [claudeData, setClaudeData] = useState<any>(null)
  const [selectedClaudeMd, setSelectedClaudeMd] = useState<any>(null)
  const [editingClaudeMd, setEditingClaudeMd] = useState(false)
  const [claudeMdContent, setClaudeMdContent] = useState<string>("")
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [claudeMdSearchTerm, setClaudeMdSearchTerm] = useState('')
  const [claudeMdSortOrder, setClaudeMdSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedContext, setSelectedContext] = useState<any>(null)
  const [editingContext, setEditingContext] = useState(false)
  const [contextContent, setContextContent] = useState<string>("")
  const [configData, setConfigData] = useState<any>(null)
  const [selectedConfig, setSelectedConfig] = useState<any>(null)
  const [editingConfig, setEditingConfig] = useState(false)
  const [configContent, setConfigContent] = useState<string>("")

  useEffect(() => {
    fetchStatus()
    fetchProfiles()
    fetchClaudeData()
    fetchConfigFiles()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status")
      const data = await res.json()
      setStatus(data)
      setCurrentProfile(data.currentProfile)
    } catch (error) {
      console.error("Failed to fetch status:", error)
    }
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

  const fetchProfile = async (name: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/profiles/${name}`)
      const data = await res.json()
      setSelectedProfile(data)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
    setLoading(false)
  }

  const captureCurrentConfig = async () => {
    const name = prompt("Enter profile name:")
    if (!name) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      
      if (res.ok) {
        await fetchProfiles()
        alert("Profile captured successfully!")
      }
    } catch (error) {
      console.error("Failed to capture profile:", error)
    }
    setLoading(false)
  }

  const applyProfile = async (name: string) => {
    if (!confirm(`Apply profile "${name}"? This will overwrite current configurations.`)) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, backup: true })
      })
      
      if (res.ok) {
        alert("Profile applied successfully! You may need to restart Claude Desktop and VS Code.")
        await fetchStatus()
      }
    } catch (error) {
      console.error("Failed to apply profile:", error)
    }
    setLoading(false)
  }

  const syncMCPServers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "desktop-to-code" })
      })
      
      if (res.ok) {
        alert("MCP servers synced successfully!")
      }
    } catch (error) {
      console.error("Failed to sync:", error)
    }
    setLoading(false)
  }

  const fetchClaudeData = async () => {
    try {
      const res = await fetch("/api/claude-data")
      const data = await res.json()
      setClaudeData(data)
    } catch (error) {
      console.error("Failed to fetch Claude data:", error)
    }
  }

  const loadClaudeMd = async (projectName: string = 'global') => {
    try {
      const res = await fetch(`/api/claude-md?project=${projectName}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedClaudeMd(data)
        setClaudeMdContent(data.content)
      }
    } catch (error) {
      console.error("Failed to load Memory file:", error)
    }
  }

  const saveClaudeMd = async () => {
    if (!selectedClaudeMd) return

    setLoading(true)
    try {
      const res = await fetch("/api/claude-md", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedClaudeMd.path,
          content: claudeMdContent
        })
      })

      if (res.ok) {
        setEditingClaudeMd(false)
        await fetchClaudeData()
        alert("Memory file saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save Memory file:", error)
    }
    setLoading(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleProject = (projectName: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectName)) {
      newExpanded.delete(projectName)
    } else {
      newExpanded.add(projectName)
    }
    setExpandedProjects(newExpanded)
  }

  const loadContextFile = async (filePath: string) => {
    try {
      const res = await fetch(`/api/context?path=${encodeURIComponent(filePath)}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedContext(data)
        setContextContent(data.raw)
      }
    } catch (error) {
      console.error("Failed to load context:", error)
    }
  }

  const saveContextFile = async () => {
    if (!selectedContext) return

    setLoading(true)
    try {
      const res = await fetch("/api/context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedContext.path,
          content: contextContent
        })
      })

      if (res.ok) {
        setEditingContext(false)
        await fetchClaudeData()
        alert("Context file saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save context:", error)
    }
    setLoading(false)
  }

  const fetchConfigFiles = async () => {
    try {
      console.log("Fetching config files...")
      const res = await fetch("/api/config-files")
      if (res.ok) {
        const data = await res.json()
        console.log("Config files data received:", data)
        setConfigData(data)
      } else {
        console.error("Failed to fetch config files, status:", res.status)
      }
    } catch (error) {
      console.error("Failed to fetch config files:", error)
    }
  }

  const selectConfigFile = (file: any) => {
    setSelectedConfig(file)
    setConfigContent(file.content)
    setEditingConfig(false)
  }

  const saveConfigFile = async () => {
    if (!selectedConfig) return

    setLoading(true)
    try {
      const res = await fetch("/api/config-files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedConfig.path,
          content: configContent
        })
      })

      if (res.ok) {
        setEditingConfig(false)
        await fetchConfigFiles()
        alert("Configuration file saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save config file:", error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Claude Config Manager
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Unified management for Claude Desktop, Claude Code, and memory systems
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-7xl">

        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Active Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-lg px-4 py-2 bg-blue-600">
                    {status.currentProfile || "None"}
                  </Badge>
                  {profiles.length > 0 && (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {profiles.length} total
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Configuration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Claude Desktop</span>
                    <div className="flex items-center gap-1">
                      {status.desktopConfigExists ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs text-slate-600">
                        {status.desktopConfigExists ? 'Active' : 'Missing'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Claude Code</span>
                    <div className="flex items-center gap-1">
                      {status.codeConfigExists ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs text-slate-600">
                        {status.codeConfigExists ? 'Active' : 'Missing'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Claude Config
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Projects</span>
                    <Badge variant="outline" className="text-xs">
                      {claudeData?.projects?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Agents</span>
                    <Badge variant="outline" className="text-xs">
                      {claudeData?.agents?.length || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Shell Snapshots</span>
                    <Badge variant="outline" className="text-xs">
                      {claudeData?.shells?.length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={captureCurrentConfig}
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Capture Config
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncMCPServers}
                    disabled={loading}
                    className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync MCP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="profiles" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-5xl bg-white dark:bg-slate-800 border shadow-sm p-1">
            <TabsTrigger value="profiles" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Profiles</span>
            </TabsTrigger>
            <TabsTrigger value="servers" className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">MCP Servers</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config Files</span>
            </TabsTrigger>
            <TabsTrigger value="claude-md" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Memory</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-slate-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profiles" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Configuration Profiles
                </CardTitle>
                <CardDescription className="text-base">
                  Manage different configuration profiles for various environments and use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile) => (
                    <Card key={profile.name} className="group cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1 border-0 shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                profile.name === currentProfile
                                  ? 'bg-green-500 shadow-lg shadow-green-200'
                                  : 'bg-gray-300'
                              }`} />
                              {profile.name}
                            </CardTitle>
                            {profile.description && (
                              <CardDescription className="mt-2 text-sm">
                                {profile.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {profile.isPrivate && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Private
                              </Badge>
                            )}
                            {profile.name === currentProfile && (
                              <Badge className="text-xs bg-green-500">
                                <Check className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchProfile(profile.name)}
                            className="flex-1 group-hover:border-blue-400"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => applyProfile(profile.name)}
                            disabled={loading || profile.name === currentProfile}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {profile.name === currentProfile ? 'Applied' : 'Apply'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="border-2 border-dashed border-blue-300 cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-800"
                        onClick={captureCurrentConfig}>
                    <CardHeader className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                        <Plus className="w-6 h-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                        Create New Profile
                      </CardTitle>
                      <CardDescription className="text-blue-600 dark:text-blue-400">
                        Capture your current configuration as a new profile
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {selectedProfile && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        Profile Details: {selectedProfile.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Configuration data and settings for this profile
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSensitive(!showSensitive)}
                        className="border-slate-300"
                      >
                        {showSensitive ? (
                          <><EyeOff className="w-4 h-4 mr-1" /> Hide Sensitive</>
                        ) : (
                          <><Eye className="w-4 h-4 mr-1" /> Show Sensitive</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(
                          JSON.stringify(showSensitive ? selectedProfile : selectedProfile.sanitized, null, 2),
                          'profile-data'
                        )}
                        className="border-slate-300"
                      >
                        {copied === 'profile-data' ? (
                          <><Check className="w-4 h-4 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="w-4 h-4 mr-1" /> Copy</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <pre className="p-4 overflow-auto max-h-96 text-sm font-mono">
                      <code className="text-slate-700 dark:text-slate-300">
                        {JSON.stringify(
                          showSensitive ? selectedProfile : selectedProfile.sanitized,
                          null,
                          2
                        )}
                      </code>
                    </pre>
                  </div>

                  {selectedProfile.desktop?.desktopConfig?.mcpServers && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        MCP Servers: {Object.keys(selectedProfile.desktop.desktopConfig.mcpServers).length}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.keys(selectedProfile.desktop.desktopConfig.mcpServers).map(serverName => (
                          <Badge key={serverName} variant="outline" className="justify-start">
                            <Server className="w-3 h-3 mr-1" />
                            {serverName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="servers" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-6 h-6 text-green-600" />
                  MCP Servers
                </CardTitle>
                <CardDescription className="text-base">
                  Model Context Protocol servers configured across your Claude ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {(() => {
                  // Collect all MCP servers from configuration files
                  const allServers: {[key: string]: any} = {}

                  // Add servers from global desktop config
                  configData?.global?.settings?.forEach((file: any) => {
                    if (file.name === 'claude_desktop_config.json' && file.content) {
                      try {
                        const config = JSON.parse(file.content)
                        if (config.mcpServers) {
                          Object.entries(config.mcpServers).forEach(([name, server]) => {
                            allServers[`desktop-global-${name}`] = { ...(server as any), source: 'Global Desktop Config', serverName: name }
                          })
                        }
                      } catch (e) {}
                    }
                  })

                  // Add servers from project .mcp.json files
                  configData?.projects?.forEach((project: any) => {
                    project.settings?.forEach((file: any) => {
                      if (file.name === '.mcp.json' && file.content) {
                        try {
                          const config = JSON.parse(file.content)
                          if (config.mcpServers) {
                            Object.entries(config.mcpServers).forEach(([name, server]) => {
                              allServers[`project-${project.name}-${name}`] = { ...(server as any), source: `Project: ${project.name}`, serverName: name }
                            })
                          }
                        } catch (e) {}
                      }
                    })
                  })

                  // Also include servers from selected profile if available
                  if (selectedProfile?.desktop?.desktopConfig?.mcpServers) {
                    Object.entries(selectedProfile.desktop.desktopConfig.mcpServers).forEach(([name, server]) => {
                      allServers[`profile-${name}`] = { ...(server as any), source: `Profile: ${selectedProfile.name}`, serverName: name }
                    })
                  }

                  return Object.keys(allServers).length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Server className="w-5 h-5 text-green-600" />
                          All MCP Servers
                        </h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {Object.keys(allServers).length} servers
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(allServers).map(([key, server]: [string, any]) => (
                          <Card key={key} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    server.disabled ? 'bg-red-500' : 'bg-green-500'
                                  }`} />
                                  {server.serverName}
                                </CardTitle>
                                <div className="flex flex-col gap-1">
                                  {server.disabled && (
                                    <Badge variant="secondary" className="text-xs">
                                      Disabled
                                    </Badge>
                                  )}
                                  {server.env && Object.keys(server.env).length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                      <Shield className="w-3 h-3 mr-1" />
                                      {Object.keys(server.env).length} env
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {server.source}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Type</div>
                                  <div className="font-mono text-sm">{server.type || 'stdio'}</div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Command</div>
                                  <div className="font-mono text-sm break-all">{server.command}</div>
                                </div>

                                {server.args && server.args.length > 0 && (
                                  <div className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Arguments</div>
                                    <div className="font-mono text-xs space-y-1">
                                      {server.args.map((arg: string, idx: number) => (
                                        <div key={idx} className="break-all">{arg}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {server.env && Object.keys(server.env).length > 0 && (
                                  <div className="bg-amber-50 dark:bg-amber-950 rounded p-3">
                                    <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">Environment Variables</div>
                                    <div className="space-y-1">
                                      {Object.entries(server.env).map(([key, value]: [string, any]) => (
                                        <div key={key} className="text-xs font-mono">
                                          <span className="text-amber-600 dark:text-amber-400">{key}</span>
                                          <span className="text-slate-500">={showSensitive ? value : '***'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Server className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                        No MCP Servers Found
                      </h3>
                      <p className="text-slate-500 dark:text-slate-500 mb-4">
                        No MCP servers are currently configured in your Claude Desktop config or project .mcp.json files
                      </p>
                      <Button variant="outline" onClick={() => window.open('https://modelcontextprotocol.io/', '_blank')}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Learn about MCP
                      </Button>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            <ConfigTab
              configData={configData}
              selectedConfig={selectedConfig}
              editingConfig={editingConfig}
              configContent={configContent}
              onSelectConfig={selectConfigFile}
              onEditConfig={() => setEditingConfig(true)}
              onSaveConfig={saveConfigFile}
              onCancelEdit={() => {
                setEditingConfig(false)
                setConfigContent(selectedConfig?.content || '')
              }}
              onContentChange={setConfigContent}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="claude-md" className="space-y-4">
            <div className="flex h-[calc(100vh-200px)] gap-6">
              {/* File Browser */}
              <Card className="w-1/3 flex flex-col">
                <CardHeader className="flex-shrink-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Memory Files
                  </CardTitle>
                  <CardDescription>
                    Global and project-specific memory instructions
                  </CardDescription>

                  {/* Search and Sort Controls */}
                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        value={claudeMdSearchTerm}
                        onChange={(e) => setClaudeMdSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setClaudeMdSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="flex items-center gap-1"
                    >
                      {claudeMdSortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 min-h-0">
                  <div className="space-y-2">
                    {/* Global Memory */}
                    {configData?.global?.claudeMd && (
                      <div
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          selectedClaudeMd?.path === configData.global.claudeMd.path
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedClaudeMd(configData.global.claudeMd)
                          setClaudeMdContent(configData.global.claudeMd.content)
                          setEditingClaudeMd(false)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          <span className="font-medium">Global Memory</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(configData.global.claudeMd.lastModified).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {/* Project Memory files */}
                    {(() => {
                      const projectsWithClaudeMd = configData?.projects?.filter((project: any) => {
                        return project.claudeMd && project.name.toLowerCase().includes(claudeMdSearchTerm.toLowerCase())
                      }) || []

                      const sortedProjects = projectsWithClaudeMd.sort((a: any, b: any) => {
                        const comparison = a.name.localeCompare(b.name)
                        return claudeMdSortOrder === 'asc' ? comparison : -comparison
                      })

                      return sortedProjects.map((project: any) => (
                        <div
                          key={project.name}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            selectedClaudeMd?.path === project.claudeMd.path
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => {
                            setSelectedClaudeMd(project.claudeMd)
                            setClaudeMdContent(project.claudeMd.content)
                            setEditingClaudeMd(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            <span className="font-medium">{project.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(project.claudeMd.lastModified).toLocaleString()}
                          </div>
                        </div>
                      ))
                    })()}

                    {/* Show project count and available projects */}
                    <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                      Total projects: {configData?.projects?.length || 0}<br/>
                      Projects with Memory: {configData?.projects?.filter((p: any) => p.claudeMd).length || 0}<br/>
                      Filtered results: {configData?.projects?.filter((p: any) => p.claudeMd && p.name.toLowerCase().includes(claudeMdSearchTerm.toLowerCase())).length || 0}
                    </div>

                    {(!configData?.global?.claudeMd &&
                      (!configData?.projects || configData.projects.filter((p: any) => p.claudeMd).length === 0)) && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No Memory files found</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => loadClaudeMd('global')}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Global Memory
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* File Editor */}
              <Card className="flex-1 flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        {selectedClaudeMd ?
                          selectedClaudeMd.path.includes('.claude/CLAUDE.md') ? 'Global Instructions' :
                          `Project: ${selectedClaudeMd.path.split('/').slice(-2, -1)[0]}`
                          : 'Select a file to edit'
                        }
                      </CardTitle>
                      {selectedClaudeMd && (
                        <CardDescription>
                          {selectedClaudeMd.path}
                        </CardDescription>
                      )}
                    </div>
                    {selectedClaudeMd && (
                      <div className="flex gap-2">
                        {editingClaudeMd ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingClaudeMd(false)
                                setClaudeMdContent(selectedClaudeMd.content)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveClaudeMd}
                              disabled={loading}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setEditingClaudeMd(true)}
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
                  {selectedClaudeMd ? (
                    <div className="flex flex-col h-full">
                      <div className="flex-1 min-h-0">
                        {editingClaudeMd ? (
                          <CodeEditor
                            value={claudeMdContent}
                            onChange={setClaudeMdContent}
                            language="markdown"
                            height="100%"
                            placeholder="Enter your Claude instructions..."
                          />
                        ) : (
                          <CodeEditor
                            value={selectedClaudeMd.content || 'This file is empty'}
                            onChange={() => {}}
                            language="markdown"
                            readOnly={true}
                            height="100%"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t flex-shrink-0">
                        <span>Last modified: {new Date(selectedClaudeMd.lastModified).toLocaleString()}</span>
                        <span>{selectedClaudeMd.size} bytes</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Select a Memory file to view or edit</p>
                        <p className="text-sm">Choose from the list on the left</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure how the config manager behaves
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Configuration changes require restarting Claude Desktop and VS Code to take effect.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">Config Paths</h3>
                      <div className="space-y-1 text-sm font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
                        <div>Desktop: ~/Library/Application Support/Claude/</div>
                        <div>Code: ~/Library/Application Support/Code/User/</div>
                        <div>Claude Data: ~/.claude/</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Data Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 border rounded text-center">
                          <Database className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-lg font-semibold">{claudeData?.projects?.length || 0}</div>
                          <div className="text-xs text-gray-500">Projects</div>
                        </div>
                        <div className="p-3 border rounded text-center">
                          <Brain className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-lg font-semibold">{claudeData?.agents?.length || 0}</div>
                          <div className="text-xs text-gray-500">Agents</div>
                        </div>
                        <div className="p-3 border rounded text-center">
                          <Terminal className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-lg font-semibold">{claudeData?.shells?.length || 0}</div>
                          <div className="text-xs text-gray-500">Shells</div>
                        </div>
                        <div className="p-3 border rounded text-center">
                          <Check className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-lg font-semibold">{claudeData?.todos?.length || 0}</div>
                          <div className="text-xs text-gray-500">Todos</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={fetchClaudeData}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}