"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Settings,
  Brain,
  Server,
  Code,
  GitBranch,
  Clock,
  Folder,
  Shield
} from "lucide-react"

interface ProjectCardProps {
  project: {
    name: string
    path: string
    claudeMd?: any
    settings: any[]
    agents: any[]
    hooks?: any[]
    mcpServers?: any[]
  }
  isGlobal?: boolean
  onClick: () => void
  viewMode: 'grid' | 'list'
}

export default function ProjectCard({
  project,
  isGlobal = false,
  onClick,
  viewMode
}: ProjectCardProps) {
  const stats = {
    claudeMd: !!project.claudeMd,
    settings: project.settings?.length || 0,
    agents: project.agents?.length || 0,
    hooks: project.hooks?.length || 0,
    mcpServers: project.mcpServers?.length || 0
  }

  const totalFiles = stats.settings + stats.agents + stats.hooks + (stats.claudeMd ? 1 : 0)

  if (viewMode === 'list') {
    return (
      <Card
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isGlobal ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/50' : ''
        }`}
        onClick={onClick}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${
              isGlobal ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {isGlobal ? <Shield className="w-5 h-5 text-blue-600" /> : <Folder className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold">{project.name}</h3>
              <p className="text-xs text-gray-500">{project.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stats.claudeMd && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-sm">CLAUDE.md</span>
              </div>
            )}

            {stats.mcpServers > 0 && (
              <Badge variant="outline" className="gap-1">
                <Server className="w-3 h-3" />
                {stats.mcpServers} MCP
              </Badge>
            )}

            {stats.agents > 0 && (
              <Badge variant="outline" className="gap-1">
                <Brain className="w-3 h-3" />
                {stats.agents} Agents
              </Badge>
            )}

            <Badge variant="secondary">
              {totalFiles} files
            </Badge>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${
        isGlobal ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/50' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${
            isGlobal ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            {isGlobal ? <Shield className="w-5 h-5 text-blue-600" /> : <Folder className="w-5 h-5" />}
          </div>
          {isGlobal && (
            <Badge className="bg-blue-500">Global</Badge>
          )}
        </div>
        <CardTitle className="text-base mt-3 line-clamp-1">{project.name}</CardTitle>
        <p className="text-xs text-gray-500 line-clamp-1">{project.path}</p>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${stats.claudeMd ? 'text-orange-500' : 'text-gray-300'}`} />
              <span className="text-xs">CLAUDE.md</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className={`w-4 h-4 ${stats.mcpServers > 0 ? 'text-green-500' : 'text-gray-300'}`} />
              <span className="text-xs">{stats.mcpServers} MCP</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className={`w-4 h-4 ${stats.agents > 0 ? 'text-purple-500' : 'text-gray-300'}`} />
              <span className="text-xs">{stats.agents} Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className={`w-4 h-4 ${stats.settings > 0 ? 'text-blue-500' : 'text-gray-300'}`} />
              <span className="text-xs">{stats.settings} Settings</span>
            </div>
          </div>

          {/* File Count Badge */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Total Files</span>
              <Badge variant="secondary">{totalFiles}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}