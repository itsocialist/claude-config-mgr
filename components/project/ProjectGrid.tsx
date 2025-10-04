"use client"

import React, { useState, useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ProjectCard from './ProjectCard'
import {
  Search,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Plus,
  Shield,
  FileText,
  Settings,
  Brain
} from "lucide-react"

interface Project {
  name: string
  path: string
  claudeMd?: any
  settings: any[]
  agents: any[]
  hooks: any[]
  mcpServers?: any[]
}

interface ProjectGridProps {
  projects: Project[]
  onSelectProject: (project: Project) => void
  onBadgeClick?: (section: 'memory' | 'settings' | 'agents') => void
  onCreateProject?: () => void
  globalConfig?: any
  viewMode?: 'grid' | 'list'
  hideSearchBar?: boolean
}

export default function ProjectGrid({
  projects,
  onSelectProject,
  onBadgeClick,
  onCreateProject,
  globalConfig,
  viewMode: externalViewMode,
  hideSearchBar = false
}: ProjectGridProps) {
  // Use external view mode if provided, otherwise manage internally
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>('grid')
  const viewMode = externalViewMode || internalViewMode

  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState({
    hasClaudeMd: false,
    hasMCP: false,
    hasAgents: false
  })

  // Use passed projects directly if search bar is hidden (already filtered)
  const filteredProjects = useMemo(() => {
    if (hideSearchBar) {
      return projects
    }

    let filtered = projects.filter(project => {
      // Search filter
      if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Feature filters
      if (filters.hasClaudeMd && !project.claudeMd) return false
      if (filters.hasMCP && (!project.mcpServers || project.mcpServers.length === 0)) return false
      if (filters.hasAgents && (!project.agents || project.agents.length === 0)) return false

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name)
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [projects, searchTerm, sortOrder, filters, hideSearchBar])

  return (
    <div className="space-y-6">
      {/* Header Controls - only show if not hidden */}
      {!hideSearchBar && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filters.hasClaudeMd ? "default" : "outline"}
              onClick={() => setFilters(f => ({ ...f, hasClaudeMd: !f.hasClaudeMd }))}
          >
            Memory
          </Button>
          <Button
            size="sm"
            variant={filters.hasMCP ? "default" : "outline"}
            onClick={() => setFilters(f => ({ ...f, hasMCP: !f.hasMCP }))}
          >
            MCP
          </Button>
          <Button
            size="sm"
            variant={filters.hasAgents ? "default" : "outline"}
            onClick={() => setFilters(f => ({ ...f, hasAgents: !f.hasAgents }))}
          >
            Agents
          </Button>
        </div>

          {/* View Controls */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? "default" : "outline"}
              onClick={() => setInternalViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? "default" : "outline"}
              onClick={() => setInternalViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Global Config Card - Compact Design */}
      {globalConfig && (
        <Card
          className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => onSelectProject({
            name: "Global",
            path: "~/.claude",
            ...globalConfig
          })}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Global Configuration</h3>
                  <p className="text-xs text-gray-500">~/.claude</p>
                </div>
              </div>
              <Badge className="bg-blue-500">Global</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {globalConfig.claudeMd && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span>Memory</span>
                  </div>
                )}
                {globalConfig.settings?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span>{globalConfig.settings.length} Settings</span>
                  </div>
                )}
                {globalConfig.agents?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span>{globalConfig.agents.length} Agents</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                Total: {(globalConfig.settings?.length || 0) + (globalConfig.agents?.length || 0) + (globalConfig.claudeMd ? 1 : 0)} files
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
        {onCreateProject && (
          <Button onClick={onCreateProject} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Project Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.path}
              project={project}
              onClick={() => onSelectProject(project)}
              onBadgeClick={onBadgeClick}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.path}
              project={project}
              onClick={() => onSelectProject(project)}
              onBadgeClick={onBadgeClick}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects found matching your criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setFilters({ hasClaudeMd: false, hasMCP: false, hasAgents: false })
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}