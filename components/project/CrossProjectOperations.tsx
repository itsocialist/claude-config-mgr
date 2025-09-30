"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import ProjectSelector from './ProjectSelector'
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  GitCompare,
  ArrowRight,
  Check,
  X,
  FileText,
  Settings,
  Brain,
  Server,
  AlertCircle
} from "lucide-react"

interface Project {
  name: string
  path: string
  claudeMd?: any
  settings: any[]
  agents: any[]
  mcpServers?: any[]
}

interface CrossProjectOperationsProps {
  sourceProject: Project
  projects: Project[]
  onCopyConfig: (source: Project, target: string, configType: string[]) => Promise<void>
  onCompareProjects: (project1: string, project2: string) => void
}

type ConfigType = 'claudeMd' | 'settings' | 'agents' | 'mcpServers'

export default function CrossProjectOperations({
  sourceProject,
  projects,
  onCopyConfig,
  onCompareProjects
}: CrossProjectOperationsProps) {
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [compareDialogOpen, setCompareDialogOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<string>('')
  const [selectedCompare, setSelectedCompare] = useState<string>('')
  const [selectedConfigs, setSelectedConfigs] = useState<ConfigType[]>([])
  const [copying, setCopying] = useState(false)

  const availableConfigs: { type: ConfigType; label: string; icon: any; available: boolean }[] = [
    {
      type: 'claudeMd',
      label: 'CLAUDE.md Instructions',
      icon: FileText,
      available: !!sourceProject.claudeMd
    },
    {
      type: 'settings',
      label: `Settings (${sourceProject.settings?.length || 0} files)`,
      icon: Settings,
      available: sourceProject.settings?.length > 0
    },
    {
      type: 'agents',
      label: `Agents (${sourceProject.agents?.length || 0} files)`,
      icon: Brain,
      available: sourceProject.agents?.length > 0
    },
    {
      type: 'mcpServers',
      label: `MCP Servers (${sourceProject.mcpServers?.length || 0})`,
      icon: Server,
      available: sourceProject.mcpServers?.length > 0
    }
  ]

  const handleCopy = async () => {
    if (!selectedTarget || selectedConfigs.length === 0) return

    setCopying(true)
    try {
      await onCopyConfig(sourceProject, selectedTarget, selectedConfigs)
      setCopyDialogOpen(false)
      setSelectedTarget('')
      setSelectedConfigs([])
    } catch (error) {
      console.error('Failed to copy configuration:', error)
    } finally {
      setCopying(false)
    }
  }

  const handleCompare = () => {
    if (!selectedCompare) return
    onCompareProjects(sourceProject.name, selectedCompare)
    setCompareDialogOpen(false)
  }

  const toggleConfigSelection = (type: ConfigType) => {
    setSelectedConfigs(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCopyDialogOpen(true)}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy To Project
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCompareDialogOpen(true)}
        >
          <GitCompare className="w-4 h-4 mr-2" />
          Compare With
        </Button>
      </div>

      {/* Copy Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Copy Configuration to Another Project</DialogTitle>
            <DialogDescription>
              Select which configurations to copy from {sourceProject.name} to another project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Source → Target */}
            <div className="flex items-center gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{sourceProject.name}</Badge>
                  </div>
                </CardContent>
              </Card>

              <ArrowRight className="w-5 h-5 text-gray-400" />

              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Target</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectSelector
                    projects={projects.filter(p => p.name !== sourceProject.name)}
                    onSelect={setSelectedTarget}
                    currentProject={selectedTarget}
                    showGlobal={false}
                    placeholder="Select target project..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Config Selection */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Select Configurations to Copy</h4>
              <div className="space-y-2">
                {availableConfigs.map(config => {
                  const Icon = config.icon
                  return (
                    <div
                      key={config.type}
                      className={`p-3 border rounded-lg transition-colors ${
                        !config.available
                          ? 'opacity-50 cursor-not-allowed bg-gray-50'
                          : selectedConfigs.includes(config.type)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => config.available && toggleConfigSelection(config.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{config.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!config.available && (
                            <Badge variant="outline" className="text-xs">Not available</Badge>
                          )}
                          {config.available && selectedConfigs.includes(config.type) && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Warning */}
            {selectedTarget && selectedConfigs.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      This will overwrite existing configurations
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      Files with the same name in the target project will be replaced.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              disabled={!selectedTarget || selectedConfigs.length === 0 || copying}
            >
              {copying ? 'Copying...' : 'Copy Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare Projects</DialogTitle>
            <DialogDescription>
              Select a project to compare with {sourceProject.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ProjectSelector
              projects={projects.filter(p => p.name !== sourceProject.name)}
              onSelect={setSelectedCompare}
              currentProject={selectedCompare}
              showGlobal={true}
              placeholder="Select project to compare..."
              className="w-full"
            />

            {selectedCompare && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>{sourceProject.name}</Badge>
                      <GitCompare className="w-4 h-4 text-gray-400" />
                      <Badge>{selectedCompare}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompare} disabled={!selectedCompare}>
              Compare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}