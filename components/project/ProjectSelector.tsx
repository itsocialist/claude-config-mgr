"use client"

import React, { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Check,
  ChevronsUpDown,
  Search,
  FileText,
  Brain,
  Server,
  Shield,
  Folder
} from "lucide-react"

interface Project {
  name: string
  path: string
  claudeMd?: any
  settings: any[]
  agents: any[]
  mcpServers?: any[]
}

interface ProjectSelectorProps {
  projects: Project[]
  currentProject?: string
  onSelect: (projectName: string) => void
  multiple?: boolean
  maxSelections?: number
  showGlobal?: boolean
  filterBy?: ('hasClaudeMd' | 'hasMCP' | 'hasAgents')[]
  className?: string
  placeholder?: string
}

export default function ProjectSelector({
  projects,
  currentProject,
  onSelect,
  multiple = false,
  maxSelections = 3,
  showGlobal = true,
  filterBy = [],
  className,
  placeholder = "Select project..."
}: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    currentProject ? [currentProject] : []
  )

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      // Search filter
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Feature filters
      if (filterBy.includes('hasClaudeMd') && !project.claudeMd) return false
      if (filterBy.includes('hasMCP') && (!project.mcpServers || project.mcpServers.length === 0)) return false
      if (filterBy.includes('hasAgents') && (!project.agents || project.agents.length === 0)) return false

      return true
    })

    return filtered
  }, [projects, searchTerm, filterBy])

  const handleSelect = (projectName: string) => {
    if (multiple) {
      const newSelection = selectedProjects.includes(projectName)
        ? selectedProjects.filter(p => p !== projectName)
        : [...selectedProjects, projectName].slice(0, maxSelections)

      setSelectedProjects(newSelection)
      onSelect(projectName) // Pass individual selection for multi-select
    } else {
      setSelectedProjects([projectName])
      onSelect(projectName)
      setOpen(false)
    }
  }

  const getProjectFeatures = (project: Project) => {
    const features = []
    if (project.claudeMd) features.push({ icon: FileText, color: 'text-orange-500', label: 'CLAUDE.md' })
    if (project.agents?.length) features.push({ icon: Brain, color: 'text-purple-500', label: `${project.agents.length} agents` })
    if (project.mcpServers?.length) features.push({ icon: Server, color: 'text-green-500', label: `${project.mcpServers.length} MCP` })
    return features
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between ${className}`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedProjects.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : multiple ? (
              <span>{selectedProjects.length} selected</span>
            ) : (
              <>
                {currentProject === 'Global' ? (
                  <Shield className="w-4 h-4 text-blue-600" />
                ) : (
                  <Folder className="w-4 h-4" />
                )}
                <span>{selectedProjects[0]}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search projects..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>No projects found.</CommandEmpty>

            {showGlobal && (
              <CommandGroup heading="System">
                <CommandItem
                  value="Global"
                  onSelect={() => handleSelect('Global')}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Global Configuration</span>
                  </div>
                  {selectedProjects.includes('Global') && (
                    <Check className="h-4 w-4" />
                  )}
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Projects">
              {filteredProjects.map(project => {
                const features = getProjectFeatures(project)
                return (
                  <CommandItem
                    key={project.path}
                    value={project.name}
                    onSelect={() => handleSelect(project.name)}
                    className="flex flex-col items-start gap-1 py-2"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      {selectedProjects.includes(project.name) && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    {features.length > 0 && (
                      <div className="flex gap-2 ml-6">
                        {features.map((feat, idx) => {
                          const Icon = feat.icon
                          return (
                            <div key={idx} className={`flex items-center gap-1 text-xs ${feat.color}`}>
                              <Icon className="w-3 h-3" />
                              <span>{feat.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>

          {multiple && selectedProjects.length > 0 && (
            <div className="border-t p-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {selectedProjects.length} of {maxSelections} selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedProjects([])
                    onSelect('')
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}