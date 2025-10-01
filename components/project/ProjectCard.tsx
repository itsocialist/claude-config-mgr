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
                <span className="text-sm">Memory</span>
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

  // Grid view - Compact Design
  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${
        isGlobal ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header with icon inline with title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${
              isGlobal ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {isGlobal ? <Shield className="w-4 h-4 text-blue-600" /> : <Folder className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm line-clamp-1">{project.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-1">{project.path}</p>
            </div>
          </div>
          {isGlobal && (
            <Badge className="bg-blue-500 text-xs ml-2">Global</Badge>
          )}
        </div>

        {/* Compact stats in single row */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            {stats.claudeMd && (
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-orange-500" />
                <span>Memory</span>
              </div>
            )}
            {stats.mcpServers > 0 && (
              <div className="flex items-center gap-1">
                <Server className="w-3 h-3 text-green-500" />
                <span>{stats.mcpServers}</span>
              </div>
            )}
            {stats.agents > 0 && (
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3 text-purple-500" />
                <span>{stats.agents}</span>
              </div>
            )}
          </div>
          <span className="text-gray-500">{totalFiles} files</span>
        </div>
      </div>
    </Card>
  )
}