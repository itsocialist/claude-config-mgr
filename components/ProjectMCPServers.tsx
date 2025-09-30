"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Server,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  BookOpen
} from "lucide-react"

interface MCPServer {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  type?: string
  disabled?: boolean
  source: string
}

interface ProjectMCPServersProps {
  projectName: string
  isGlobal: boolean
  configData: any
  onServerUpdate: (servers: MCPServer[]) => void
  showSensitive: boolean
  onToggleSensitive: () => void
}

export default function ProjectMCPServers({
  projectName,
  isGlobal,
  configData,
  onServerUpdate,
  showSensitive,
  onToggleSensitive
}: ProjectMCPServersProps) {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [editingServer, setEditingServer] = useState<string | null>(null)
  const [newServer, setNewServer] = useState<Partial<MCPServer>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadServers()
  }, [projectName, configData])

  const loadServers = () => {
    const projectServers: MCPServer[] = []

    if (isGlobal) {
      // Load from global desktop config
      configData?.global?.settings?.forEach((file: any) => {
        if (file.name === 'claude_desktop_config.json' && file.content) {
          try {
            const config = JSON.parse(file.content)
            if (config.mcpServers) {
              Object.entries(config.mcpServers).forEach(([name, server]: [string, any]) => {
                projectServers.push({
                  name,
                  ...server,
                  source: 'Global Desktop Config'
                })
              })
            }
          } catch (e) {
            console.error('Failed to parse global desktop config:', e)
          }
        }
      })
    } else {
      // Load from project .mcp.json or project-specific desktop config
      const project = configData?.projects?.find((p: any) => p.name === projectName)

      project?.settings?.forEach((file: any) => {
        if (file.name === '.mcp.json' && file.content) {
          try {
            const config = JSON.parse(file.content)
            if (config.mcpServers) {
              Object.entries(config.mcpServers).forEach(([name, server]: [string, any]) => {
                projectServers.push({
                  name,
                  ...server,
                  source: 'Project MCP Config'
                })
              })
            }
          } catch (e) {
            console.error('Failed to parse project MCP config:', e)
          }
        }

        if (file.name === 'claude_desktop_config.json' && file.content) {
          try {
            const config = JSON.parse(file.content)
            if (config.mcpServers) {
              Object.entries(config.mcpServers).forEach(([name, server]: [string, any]) => {
                projectServers.push({
                  name,
                  ...server,
                  source: 'Project Desktop Config'
                })
              })
            }
          } catch (e) {
            console.error('Failed to parse project desktop config:', e)
          }
        }
      })
    }

    setServers(projectServers)
  }

  const handleAddServer = () => {
    if (!newServer.name || !newServer.command) return

    const serverToAdd: MCPServer = {
      name: newServer.name,
      command: newServer.command,
      args: newServer.args || [],
      env: newServer.env || {},
      type: newServer.type || 'stdio',
      source: isGlobal ? 'Global Desktop Config' : 'Project MCP Config'
    }

    const updatedServers = [...servers, serverToAdd]
    setServers(updatedServers)
    onServerUpdate(updatedServers)

    setNewServer({})
    setShowAddForm(false)
  }

  const handleRemoveServer = (serverName: string) => {
    if (!confirm(`Remove MCP server "${serverName}"?`)) return

    const updatedServers = servers.filter(s => s.name !== serverName)
    setServers(updatedServers)
    onServerUpdate(updatedServers)
  }

  const handleToggleServer = (serverName: string) => {
    const updatedServers = servers.map(server =>
      server.name === serverName
        ? { ...server, disabled: !server.disabled }
        : server
    )
    setServers(updatedServers)
    onServerUpdate(updatedServers)
  }

  const copyServerConfig = (server: MCPServer) => {
    const config = {
      [server.name]: {
        command: server.command,
        args: server.args,
        env: server.env,
        type: server.type
      }
    }
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              MCP Servers
              <Badge variant="secondary" className="ml-2">
                {servers.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Model Context Protocol servers for {isGlobal ? 'global' : projectName} configuration
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleSensitive}
            >
              {showSensitive ? (
                <><EyeOff className="w-4 h-4 mr-1" /> Hide Secrets</>
              ) : (
                <><Eye className="w-4 h-4 mr-1" /> Show Secrets</>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Server
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Add Server Form */}
        {showAddForm && (
          <Card className="mb-6 border-dashed border-2 border-blue-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add New MCP Server</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Server Name</label>
                    <Input
                      placeholder="e.g., filesystem"
                      value={newServer.name || ''}
                      onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Command</label>
                    <Input
                      placeholder="e.g., npx -y @modelcontextprotocol/server-filesystem"
                      value={newServer.command || ''}
                      onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Arguments (one per line)</label>
                  <textarea
                    className="w-full h-20 p-2 border rounded-md resize-none text-sm font-mono"
                    placeholder="/allowed/path&#10;--readonly"
                    value={newServer.args?.join('\n') || ''}
                    onChange={(e) => setNewServer({
                      ...newServer,
                      args: e.target.value.split('\n').filter(Boolean)
                    })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddServer}
                    disabled={!newServer.name || !newServer.command}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Server
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewServer({})
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Server List */}
        {servers.length > 0 ? (
          <div className="space-y-4">
            {servers.map((server) => (
              <Card key={server.name} className="border shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        server.disabled ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <h4 className="font-semibold">{server.name}</h4>
                        <p className="text-xs text-gray-500">{server.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Command and Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Command</div>
                        <div className="font-mono text-sm break-all">{server.command}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Type</div>
                        <div className="font-mono text-sm">{server.type || 'stdio'}</div>
                      </div>
                    </div>

                    {/* Arguments */}
                    {server.args && server.args.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Arguments</div>
                        <div className="font-mono text-xs space-y-1">
                          {server.args.map((arg, idx) => (
                            <div key={idx} className="break-all">{arg}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Environment Variables */}
                    {server.env && Object.keys(server.env).length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950 rounded p-3">
                        <div className="text-xs text-amber-700 dark:text-amber-300 mb-1">Environment Variables</div>
                        <div className="space-y-1">
                          {Object.entries(server.env).map(([key, value]) => (
                            <div key={key} className="text-xs font-mono">
                              <span className="text-amber-600 dark:text-amber-400">{key}</span>
                              <span className="text-slate-500">={showSensitive ? value : '***'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleServer(server.name)}
                      >
                        {server.disabled ? 'Enable' : 'Disable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyServerConfig(server)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Config
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingServer(server.name)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveServer(server.name)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Server className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
              No MCP Servers Configured
            </h3>
            <p className="text-slate-500 dark:text-slate-500 mb-4">
              Get started by adding your first MCP server for {isGlobal ? 'global' : projectName} configuration
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Server
              </Button>
              <Button variant="outline" onClick={() => window.open('https://modelcontextprotocol.io/', '_blank')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Learn about MCP
              </Button>
            </div>
          </div>
        )}

        {/* Sync Notice for Global */}
        {isGlobal && servers.length > 0 && (
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Global MCP servers will be available across all Claude Desktop instances.
              Changes require restarting Claude Desktop to take effect.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}