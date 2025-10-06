"use client"

import React, { useState, useEffect, useMemo } from 'react'
import ProjectGrid from '@/components/project/ProjectGrid'
import ProjectDetailView from '@/components/project/ProjectDetailView'
import ProjectSearchBar from '@/components/project/ProjectSearchBar'
import CrossProjectOperations from '@/components/project/CrossProjectOperations'
import CopyConfigModal from '@/components/project/CopyConfigModal'
import CompareConfigModal from '@/components/project/CompareConfigModal'
import DetailedCompareModal from '@/components/project/DetailedCompareModal'
import ImportProjectModal from '@/components/project/ImportProjectModal'
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
  Shield,
  Plus
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
  const [initialTab, setInitialTab] = useState<'memory' | 'settings' | 'agents' | undefined>(undefined)

  // Modal states
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [detailedCompareOpen, setDetailedCompareOpen] = useState(false)
  const [compareTarget, setCompareTarget] = useState<any>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

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

      // Get workspace paths from localStorage
      const savedPaths = localStorage.getItem('workspacePaths')
      let workspacePaths: string[] = []
      if (savedPaths) {
        try {
          const parsed = JSON.parse(savedPaths)
          if (Array.isArray(parsed) && parsed.length > 0) {
            workspacePaths = parsed
          }
        } catch {
          // Use default workspace
          workspacePaths = ['~/workspace']
        }
      }

      // If no workspace paths saved, use default workspace
      if (workspacePaths.length === 0) {
        workspacePaths = ['~/workspace']
      }

      // Fetch global config
      const globalRes = await fetch("/api/projects/global")
      const globalData = await globalRes.json()
      console.log("Global config:", globalData)
      setGlobalConfig(globalData)

      // Fetch project list with workspace paths
      const params = new URLSearchParams({
        workspacePaths: JSON.stringify(workspacePaths)
      })
      const configRes = await fetch(`/api/config-files?${params}`)
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
    window.scrollTo(0, 0)
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

      if (!selectedProject) {
        console.error('No source project selected')
        alert('No source project selected')
        return
      }

      // Call the copy API
      const response = await fetch('/api/copy-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourcePath: selectedProject.path,
          targetPath: target.path,
          configTypes
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Show success message with details
        const successCount = result.results.success.length
        const failedCount = result.results.failed.length
        const skippedCount = result.results.skipped.length

        let message = `Configuration copied to ${targetName}!\n\n`
        message += `✅ Success: ${successCount} files\n`
        if (failedCount > 0) {
          message += `❌ Failed: ${failedCount} files\n`
        }
        if (skippedCount > 0) {
          message += `⏭️ Skipped: ${skippedCount} files (not found)\n`
        }

        alert(message)

        // Refresh data to show updated configurations
        await fetchConfigData()

        // Close the modal
        setCopyModalOpen(false)
      } else {
        throw new Error(result.error || 'Copy operation failed')
      }
    } catch (error) {
      console.error('Failed to copy config:', error)
      alert(`Failed to copy configuration: ${error.message}`)
    }
  }

  const handleCompareProjects = (targetProjectName: string) => {
    // Find the target project
    const target = projects.find(p => p.name === targetProjectName)
    if (target) {
      setCompareTarget(target)
      setCompareModalOpen(false)
      setDetailedCompareOpen(true)
    }
  }

  const handleImportProject = async (projectPath: string) => {
    try {
      // Get current workspace paths
      const savedPaths = localStorage.getItem('workspacePaths')
      let workspacePaths: string[] = []
      if (savedPaths) {
        try {
          const parsed = JSON.parse(savedPaths)
          if (Array.isArray(parsed)) {
            workspacePaths = parsed
          }
        } catch {
          // Use empty array if parse fails
        }
      }

      // Get the parent directory of the project (this is the workspace)
      // Use string manipulation since we're in client-side code
      const lastSlash = projectPath.lastIndexOf('/')
      const parentDir = lastSlash > 0 ? projectPath.substring(0, lastSlash) : projectPath

      // Add the parent directory as a workspace path if not already included
      if (parentDir && !workspacePaths.includes(parentDir)) {
        workspacePaths.push(parentDir)
        localStorage.setItem('workspacePaths', JSON.stringify(workspacePaths))
      }

      // Close modal and refresh
      setImportModalOpen(false)
      await fetchConfigData()

      // Show success message (you could add a toast here)
      console.log(`Successfully imported project from ${projectPath}`)
    } catch (error) {
      console.error('Failed to import project:', error)
      alert('Failed to import project. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
              Claude Config Manager
            </h1>

            <div className="flex items-center gap-2">
              {view === 'detail' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setView('grid')
                    setSelectedProject(null)
                    window.scrollTo(0, 0)
                  }}
                >
                  <Home className="w-4 h-4 mr-2" />
                  All Projects
                </Button>
              )}
              {view === 'grid' && (
                <Button
                  variant="ghost"
                  onClick={() => setImportModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Import
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchConfigData}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Search Section - Sticky */}
      {view === 'grid' && (
        <div className="sticky top-[73px] z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <div className="container mx-auto px-6 max-w-7xl">
            {/* Stats Section */}
            <div className="py-4">
              <div className="grid grid-cols-4 gap-4">
                {/* Total Projects */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Projects</div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {loading ? '...' : projects.length}
                  </div>
                </div>

                {/* With Memory */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">With Memory</div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {projects.filter(p => p.claudeMd).length}
                  </div>
                </div>

                {/* With Agents */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">With Agents</div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {projects.filter(p => p.agents?.length > 0).length}
                  </div>
                </div>

                {/* With MCPs */}
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">With MCPs</div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {projects.filter(p => p.mcpServers && p.mcpServers.length > 0).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="pb-3">
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
            projects={filteredProjects as any}
            onSelectProject={handleProjectSelect}
            onBadgeClick={(section) => setInitialTab(section)}
            globalConfig={globalConfig}
            viewMode={viewMode}
            hideSearchBar
          />
        ) : selectedProject ? (
          <div className="h-[calc(100vh-120px)]">
            <ProjectDetailView
              project={selectedProject}
              isGlobal={selectedProject.name === "Global Configuration"}
              initialTab={initialTab}
              onBack={() => {
                setView('grid')
                setSelectedProject(null)
                setInitialTab(undefined)
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
            onConfirm={handleCompareProjects}
          />
          <DetailedCompareModal
            isOpen={detailedCompareOpen}
            onClose={() => {
              setDetailedCompareOpen(false)
              setCompareTarget(null)
            }}
            project1={selectedProject}
            project2={compareTarget}
          />
          <ImportProjectModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            onImport={handleImportProject}
          />
        </>
      )}
    </div>
  )
}