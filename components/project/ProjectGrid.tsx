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
  Plus
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
  onCreateProject?: () => void
  globalConfig?: any
}

export default function ProjectGrid({
  projects,
  onSelectProject,
  onCreateProject,
  globalConfig
}: ProjectGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState({
    hasClaudeMd: false,
    hasMCP: false,
    hasAgents: false
  })

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
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
  }, [projects, searchTerm, sortOrder, filters])

  return (
    <div className="space-y-6">
      {/* Header Controls */}
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
            CLAUDE.md
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
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? "default" : "outline"}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Global Config Card */}
      {globalConfig && (
        <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <ProjectCard
            project={{
              name: "Global Configuration",
              path: "~/.claude",
              claudeMd: globalConfig.claudeMd,
              settings: globalConfig.settings || [],
              agents: globalConfig.agents || [],
              hooks: [],
              mcpServers: []
            }}
            isGlobal={true}
            onClick={() => onSelectProject({
              name: "Global",
              path: "~/.claude",
              ...globalConfig
            })}
            viewMode={viewMode}
          />
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