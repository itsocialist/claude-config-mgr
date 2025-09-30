"use client"

import React, { useState, useEffect } from 'react'
import ProjectGrid from '@/components/project/ProjectGrid'
import ProjectDetailView from '@/components/project/ProjectDetailView'
import CrossProjectOperations from '@/components/project/CrossProjectOperations'
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

  const handleCopyConfig = async (source: Project, targetName: string, configTypes: string[]) => {
    // Find target project
    const target = projects.find(p => p.name === targetName)
    if (!target) throw new Error('Target project not found')

    // Implementation would copy selected config types from source to target
    console.log('Copying configs from', source.name, 'to', targetName, 'types:', configTypes)

    // This would call appropriate API endpoints to copy files
    // For now, just refresh data
    await fetchConfigData()
  }

  const handleCompareProjects = (project1: string, project2: string) => {
    // Implementation would open comparison view
    console.log('Comparing', project1, 'with', project2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Claude Config Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
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
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold">{loading ? '...' : projects.length}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With CLAUDE.md</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.claudeMd).length}
                  </p>
                </div>
                <Settings className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Agents</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.agents?.length > 0).length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">MCP Servers</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((sum, p) => sum + (p.mcpServers?.length || 0), 0)}
                  </p>
                </div>
                <Database className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {view === 'grid' ? (
          <ProjectGrid
            projects={projects}
            onSelectProject={handleProjectSelect}
            globalConfig={globalConfig}
          />
        ) : selectedProject ? (
          <div className="space-y-6">
            <CrossProjectOperations
              sourceProject={selectedProject}
              projects={projects}
              onCopyConfig={handleCopyConfig}
              onCompareProjects={handleCompareProjects}
            />
            <ProjectDetailView
              project={selectedProject}
              isGlobal={selectedProject.name === "Global Configuration"}
              onBack={() => {
                setView('grid')
                setSelectedProject(null)
              }}
              onSave={handleSaveConfig}
              onCopyTo={(targetProject) => {
                // Open copy dialog
                console.log('Copy to', targetProject)
              }}
              onCompare={() => {
                // Open compare dialog
                console.log('Compare project')
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}