"use client"

import React, { useState, useEffect, useMemo } from 'react'
import ProjectGrid from '@/components/project/ProjectGrid'
import ProjectDetailView from '@/components/project/ProjectDetailView'
import ProjectSearchBar from '@/components/project/ProjectSearchBar'
import CrossProjectOperations from '@/components/project/CrossProjectOperations'
import CopyConfigModal from '@/components/project/CopyConfigModal'
import CompareConfigModal from '@/components/project/CompareConfigModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Database,
  Shield
} from "lucide-react"

interface Project {
  name: string
  path: string
  claudeMd?: any
  settings: any[]
  agents: any[]
  hooks?: any[]
  mcpServers?: any[]
}

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [globalConfig, setGlobalConfig] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'grid' | 'detail'>('grid')

  // Modal states
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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

  useEffect(() => {
    fetchConfigData()
  }, [])

  const fetchConfigData = async () => {
    setLoading(true)
    try {
      console.log("Fetching config data...")

      // Fetch global config
      const globalRes = await fetch("/api/projects/global")
      const globalData = await globalRes.json()
      console.log("Global config:", globalData)
      setGlobalConfig(globalData)

      // Fetch project list from old endpoint to get paths
      const configRes = await fetch("/api/config-files")
      const configData = await configRes.json()
      console.log("Config data projects count:", configData.projects?.length || 0)

      // For now, just use the basic project data to test
      setProjects(configData.projects || [])

      console.log("Successfully loaded", configData.projects?.length || 0, "projects")
    } catch (error) {
      console.error("Failed to fetch config data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectSelect = (project: Project | any) => {
    if (project.name === "Global") {
      // Handle global config as special project
      setSelectedProject({
        name: "Global Configuration",
        path: "~/.claude",
        claudeMd: globalConfig?.claudeMd,
        settings: globalConfig?.settings || [],
        agents: globalConfig?.agents || [],
        hooks: [],
        mcpServers: []
      })
    } else {
      setSelectedProject(project)
    }
    setView('detail')
  }

  const handleSaveConfig = async (type: string, content: string, filePath: string) => {
    try {
      const res = await fetch("/api/config-files", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath, content })
      })

      if (res.ok) {
        await fetchConfigData() // Refresh data
        return Promise.resolve()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error("Failed to save config:", error)
      throw error
    }
  }

  const handleCopyConfig = async (targetName: string, configTypes: string[]) => {
    try {
      // Find target project
      const target = projects.find(p => p.name === targetName)
      if (!target) {
        console.error('Target project not found:', targetName)
        alert('Target project not found')
        return
      }

      // Implementation would copy selected config types from source to target
      console.log('Copying configs from', selectedProject?.name, 'to', targetName, 'types:', configTypes)

      // TODO: Implement actual copy logic via API
      // This would call appropriate API endpoints to copy files

      // For now, show success message
      alert(`Configuration will be copied to ${targetName}\n(Feature implementation in progress)`)

      // Refresh data
      await fetchConfigData()
    } catch (error) {
      console.error('Failed to copy config:', error)
      alert('Failed to copy configuration')
    }
  }

  const handleCompareProjects = (project1: string, project2: string) => {
    // Implementation would open comparison view
    console.log('Comparing', project1, 'with', project2)

    // For now, show a message that detailed comparison is coming soon
    alert(`Detailed comparison between ${project1} and ${project2} will be available soon`)

    // Close the modal
    setCompareModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Claude Config Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Project-Centric Configuration Management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {view === 'detail' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setView('grid')
                    setSelectedProject(null)
                  }}
                >
                  <Home className="w-4 h-4 mr-2" />
                  All Projects
                </Button>
              )}
              <Button
                variant="outline"
                onClick={fetchConfigData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Search Section - Sticky for grid view */}
      {view === 'grid' && (
        <div className="sticky top-[73px] z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Stats Section */}
          <div className="container mx-auto px-6 py-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{loading ? '...' : projects.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">With Memory</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {projects.filter(p => p.claudeMd).length}
                    </p>
                  </div>
                  <Settings className="w-8 h-8 text-orange-500 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">With Agents</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {projects.filter(p => p.agents?.length > 0).length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">MCP Servers</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {projects.reduce((sum, p) => sum + (p.mcpServers?.length || 0), 0)}
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-green-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>
          {/* Search and Filter Bar */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="container mx-auto px-6 py-3 max-w-7xl">
              <ProjectSearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6 max-w-7xl">

        {/* Main Content */}
        {view === 'grid' ? (
          <ProjectGrid
            projects={filteredProjects}
            onSelectProject={handleProjectSelect}
            globalConfig={globalConfig}
            viewMode={viewMode}
            hideSearchBar
          />
        ) : selectedProject ? (
          <div className="h-[calc(100vh-120px)]">
            <ProjectDetailView
              project={selectedProject}
              isGlobal={selectedProject.name === "Global Configuration"}
              onBack={() => {
                setView('grid')
                setSelectedProject(null)
              }}
              onSave={handleSaveConfig}
              onCopyTo={() => setCopyModalOpen(true)}
              onCompare={() => setCompareModalOpen(true)}
            />
          </div>
        ) : null}
      </div>

      {/* Modals */}
      {selectedProject && (
        <>
          <CopyConfigModal
            isOpen={copyModalOpen}
            onClose={() => setCopyModalOpen(false)}
            sourceProject={selectedProject}
            targetProjects={projects}
            onConfirm={handleCopyConfig}
          />
          <CompareConfigModal
            isOpen={compareModalOpen}
            onClose={() => setCompareModalOpen(false)}
            sourceProject={selectedProject}
            targetProjects={projects}
            onConfirm={(targetName) => handleCompareProjects(selectedProject.name, targetName)}
          />
        </>
      )}
    </div>
  )
}