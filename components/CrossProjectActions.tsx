"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CodeEditor from "@/components/CodeEditor"
import {
  Copy,
  GitCompare,
  ArrowRight,
  Check,
  X,
  FileText,
  Code,
  Settings,
  Brain,
  Folder,
  Globe,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Project {
  name: string
  path: string
  claudeMd?: any
  settings?: any[]
  agents?: any[]
  hooks?: any[]
}

interface CrossProjectActionsProps {
  projects: Project[]
  globalProject: Project
  onCopyConfig: (sourceProject: string, targetProject: string, configType: string, configName: string) => void
}

export default function CrossProjectActions({
  projects,
  globalProject,
  onCopyConfig
}: CrossProjectActionsProps) {
  const [sourceProject, setSourceProject] = useState<string>("")
  const [targetProject, setTargetProject] = useState<string>("")
  const [compareMode, setCompareMode] = useState<boolean>(false)
  const [selectedConfigType, setSelectedConfigType] = useState<string>("")
  const [selectedConfig, setSelectedConfig] = useState<string>("")
  const [comparisonData, setComparisonData] = useState<{source: any, target: any} | null>(null)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const allProjects = [
    { name: "global", displayName: "Global", data: globalProject },
    ...projects.map(p => ({ name: p.name, displayName: p.name, data: p }))
  ]

  const getConfigsForProject = (projectName: string) => {
    const project = allProjects.find(p => p.name === projectName)?.data
    if (!project) return []

    const configs = []

    if (project.claudeMd) {
      configs.push({ type: "instructions", name: "CLAUDE.md", data: project.claudeMd })
    }

    project.settings?.forEach(setting => {
      configs.push({ type: "settings", name: setting.name, data: setting })
    })

    project.agents?.forEach(agent => {
      configs.push({ type: "agents", name: agent.name, data: agent })
    })

    project.hooks?.forEach(hook => {
      configs.push({ type: "hooks", name: hook.name, data: hook })
    })

    return configs
  }

  const handleCompare = () => {
    if (!sourceProject || !targetProject || !selectedConfig) return

    const sourceConfigs = getConfigsForProject(sourceProject)
    const targetConfigs = getConfigsForProject(targetProject)

    const sourceConfig = sourceConfigs.find(c => c.name === selectedConfig)
    const targetConfig = targetConfigs.find(c => c.name === selectedConfig)

    setComparisonData({
      source: sourceConfig?.data,
      target: targetConfig?.data
    })
    setCompareMode(true)
  }

  const handleCopy = () => {
    if (!sourceProject || !targetProject || !selectedConfigType || !selectedConfig) return

    onCopyConfig(sourceProject, targetProject, selectedConfigType, selectedConfig)
  }

  const getIconForConfigType = (type: string) => {
    switch (type) {
      case "instructions": return <FileText className="w-4 h-4 text-orange-500" />
      case "settings": return <Code className="w-4 h-4 text-green-500" />
      case "agents": return <Brain className="w-4 h-4 text-purple-500" />
      case "hooks": return <Settings className="w-4 h-4 text-yellow-500" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const availableConfigs = sourceProject ? getConfigsForProject(sourceProject) : []

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader
        className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-indigo-600" />
              Cross-Project Actions
            </CardTitle>
            <CardDescription>
              Compare and copy configurations between projects
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          {!compareMode ? (
            <div className="space-y-6">
              {/* Project Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Project</label>
                  <Select value={sourceProject} onValueChange={setSourceProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source project" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProjects.map(project => (
                        <SelectItem key={project.name} value={project.name}>
                          <div className="flex items-center gap-2">
                            {project.name === "global" ? (
                              <Globe className="w-4 h-4" />
                            ) : (
                              <Folder className="w-4 h-4" />
                            )}
                            {project.displayName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Project</label>
                  <Select value={targetProject} onValueChange={setTargetProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target project" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProjects
                        .filter(p => p.name !== sourceProject)
                        .map(project => (
                          <SelectItem key={project.name} value={project.name}>
                            <div className="flex items-center gap-2">
                              {project.name === "global" ? (
                                <Globe className="w-4 h-4" />
                              ) : (
                                <Folder className="w-4 h-4" />
                              )}
                              {project.displayName}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Configuration Selection */}
              {sourceProject && (
                <div className="space-y-4">
                  <label className="text-sm font-medium">Available Configurations</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableConfigs.map(config => (
                      <div
                        key={`${config.type}-${config.name}`}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedConfig === config.name
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          setSelectedConfig(config.name)
                          setSelectedConfigType(config.type)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {getIconForConfigType(config.type)}
                          <span className="font-medium text-sm">{config.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {config.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {sourceProject && targetProject && selectedConfig && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleCompare}
                    variant="outline"
                    className="flex-1"
                  >
                    <GitCompare className="w-4 h-4 mr-2" />
                    Compare
                  </Button>
                  <Button
                    onClick={handleCopy}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Target
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Comparison View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Comparing: {selectedConfig}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompareMode(false)
                    setComparisonData(null)
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Comparison
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Source */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {sourceProject === "global" ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Folder className="w-4 h-4" />
                      )}
                      Source: {sourceProject}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comparisonData?.source ? (
                      <div className="h-96">
                        <CodeEditor
                          value={comparisonData.source.content || 'Empty file'}
                          onChange={() => {}}
                          language={comparisonData.source.type === 'json' ? 'json' : 'markdown'}
                          readOnly={true}
                          height="100%"
                        />
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <X className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Configuration not found</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Target */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {targetProject === "global" ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Folder className="w-4 h-4" />
                      )}
                      Target: {targetProject}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comparisonData?.target ? (
                      <div className="h-96">
                        <CodeEditor
                          value={comparisonData.target.content || 'Empty file'}
                          onChange={() => {}}
                          language={comparisonData.target.type === 'json' ? 'json' : 'markdown'}
                          readOnly={true}
                          height="100%"
                        />
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <X className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Configuration not found</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Comparison Actions */}
              <div className="flex justify-center pt-4 border-t">
                <Button
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={!comparisonData?.source}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Copy Source to Target
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}