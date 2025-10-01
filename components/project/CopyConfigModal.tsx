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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, FileText, Settings, Brain, Server, Code } from 'lucide-react'

interface CopyConfigModalProps {
  isOpen: boolean
  onClose: () => void
  sourceProject: any
  targetProjects: any[]
  onConfirm: (targetProject: string, configTypes: string[]) => void
}

export default function CopyConfigModal({
  isOpen,
  onClose,
  sourceProject,
  targetProjects,
  onConfirm
}: CopyConfigModalProps) {
  const [selectedTarget, setSelectedTarget] = useState('')
  const [selectedConfigs, setSelectedConfigs] = useState({
    memory: false,
    settings: false,
    agents: false,
    mcp: false,
    hooks: false
  })

  const handleConfirm = () => {
    const configs = []
    if (selectedConfigs.memory) configs.push('memory')
    if (selectedConfigs.settings) configs.push('settings')
    if (selectedConfigs.agents) configs.push('agents')
    if (selectedConfigs.mcp) configs.push('mcp')
    if (selectedConfigs.hooks) configs.push('hooks')

    if (selectedTarget && configs.length > 0) {
      onConfirm(selectedTarget, configs)
      onClose()
    }
  }

  const availableConfigs = [
    {
      key: 'memory',
      label: 'Memory (CLAUDE.md)',
      icon: FileText,
      available: !!sourceProject?.claudeMd
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      available: sourceProject?.settings?.length > 0
    },
    {
      key: 'agents',
      label: 'Agents',
      icon: Brain,
      available: sourceProject?.agents?.length > 0
    },
    {
      key: 'mcp',
      label: 'MCP Servers',
      icon: Server,
      available: sourceProject?.mcpServers?.length > 0
    },
    {
      key: 'hooks',
      label: 'Hooks',
      icon: Code,
      available: sourceProject?.hooks?.length > 0
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Copy Configuration
            </div>
          </DialogTitle>
          <DialogDescription>
            Copy configuration from <strong>{sourceProject?.name}</strong> to another project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Target Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="target">Target Project</Label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
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

          {/* Configuration Selection */}
          <div className="space-y-2">
            <Label>Select Configurations to Copy</Label>
            <div className="space-y-2 rounded-lg border p-3">
              {availableConfigs.map(config => {
                const Icon = config.icon
                return (
                  <div
                    key={config.key}
                    className={`flex items-center space-x-3 p-2 rounded ${
                      !config.available ? 'opacity-50' : ''
                    }`}
                  >
                    <Checkbox
                      id={config.key}
                      checked={selectedConfigs[config.key as keyof typeof selectedConfigs]}
                      onCheckedChange={(checked) =>
                        setSelectedConfigs(prev => ({
                          ...prev,
                          [config.key]: checked
                        }))
                      }
                      disabled={!config.available}
                    />
                    <Label
                      htmlFor={config.key}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                      {!config.available && (
                        <span className="text-xs text-gray-500 ml-auto">Not available</span>
                      )}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Warning */}
          {selectedTarget && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              ⚠️ This will overwrite existing configurations in the target project
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTarget || Object.values(selectedConfigs).every(v => !v)}
          >
            Copy Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}