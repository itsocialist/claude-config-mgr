"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GitCompare, FileText, Settings, Brain, Server, Code } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CompareConfigModalProps {
  isOpen: boolean
  onClose: () => void
  sourceProject: any
  targetProjects: any[]
  onConfirm: (targetProject: string) => void
}

export default function CompareConfigModal({
  isOpen,
  onClose,
  sourceProject,
  targetProjects,
  onConfirm
}: CompareConfigModalProps) {
  const [selectedTarget, setSelectedTarget] = useState('')
  const [comparisonData, setComparisonData] = useState<any>(null)

  const handleSelectTarget = (projectName: string) => {
    setSelectedTarget(projectName)

    // Find the target project
    const target = targetProjects.find(p => p.name === projectName)
    if (!target) return

    // Generate comparison data
    const comparison = {
      memory: {
        source: !!sourceProject?.claudeMd,
        target: !!target?.claudeMd,
        diff: !!sourceProject?.claudeMd !== !!target?.claudeMd
      },
      settings: {
        source: sourceProject?.settings?.length || 0,
        target: target?.settings?.length || 0,
        diff: (sourceProject?.settings?.length || 0) !== (target?.settings?.length || 0)
      },
      agents: {
        source: sourceProject?.agents?.length || 0,
        target: target?.agents?.length || 0,
        diff: (sourceProject?.agents?.length || 0) !== (target?.agents?.length || 0)
      },
      mcp: {
        source: sourceProject?.mcpServers?.length || 0,
        target: target?.mcpServers?.length || 0,
        diff: (sourceProject?.mcpServers?.length || 0) !== (target?.mcpServers?.length || 0)
      },
      hooks: {
        source: sourceProject?.hooks?.length || 0,
        target: target?.hooks?.length || 0,
        diff: (sourceProject?.hooks?.length || 0) !== (target?.hooks?.length || 0)
      }
    }
    setComparisonData(comparison)
  }

  const handleConfirm = () => {
    if (selectedTarget) {
      onConfirm(selectedTarget)
    }
  }

  const configs = [
    { key: 'memory', label: 'Memory (CLAUDE.md)', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'agents', label: 'Agents', icon: Brain },
    { key: 'mcp', label: 'MCP Servers', icon: Server },
    { key: 'hooks', label: 'Hooks', icon: Code }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Compare Configuration
            </div>
          </DialogTitle>
          <DialogDescription>
            Compare configuration between <strong>{sourceProject?.name}</strong> and another project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Target Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="target">Compare With</Label>
            <Select value={selectedTarget} onValueChange={handleSelectTarget}>
              <SelectTrigger id="target">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {targetProjects
                  .filter(p => p.name !== sourceProject?.name)
                  .map(project => (
                    <SelectItem key={project.path} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comparison Results */}
          {comparisonData && (
            <div className="space-y-2">
              <Label>Comparison Results</Label>
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50 dark:bg-gray-800">
                      <th className="text-left p-3 text-sm font-medium">Configuration</th>
                      <th className="text-center p-3 text-sm font-medium">{sourceProject?.name}</th>
                      <th className="text-center p-3 text-sm font-medium">{selectedTarget}</th>
                      <th className="text-center p-3 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {configs.map(config => {
                      const Icon = config.icon
                      const data = comparisonData[config.key]
                      return (
                        <tr key={config.key} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span className="text-sm">{config.label}</span>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            {config.key === 'memory' ? (
                              data.source ?
                                <Badge variant="default">Present</Badge> :
                                <Badge variant="secondary">Absent</Badge>
                            ) : (
                              <Badge variant={data.source > 0 ? "default" : "secondary"}>
                                {data.source}
                              </Badge>
                            )}
                          </td>
                          <td className="text-center p-3">
                            {config.key === 'memory' ? (
                              data.target ?
                                <Badge variant="default">Present</Badge> :
                                <Badge variant="secondary">Absent</Badge>
                            ) : (
                              <Badge variant={data.target > 0 ? "default" : "secondary"}>
                                {data.target}
                              </Badge>
                            )}
                          </td>
                          <td className="text-center p-3">
                            {data.diff ? (
                              <Badge variant="destructive">Different</Badge>
                            ) : (
                              <Badge variant="outline">Same</Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {selectedTarget && (
            <Button onClick={handleConfirm}>
              View Detailed Comparison
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}