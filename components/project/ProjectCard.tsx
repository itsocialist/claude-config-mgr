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
  onBadgeClick?: (section: 'memory' | 'settings' | 'agents') => void
  viewMode: 'grid' | 'list'
}

export default function ProjectCard({
  project,
  isGlobal = false,
  onClick,
  onBadgeClick,
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

  // Grid view - Figma Design
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 ${
        isGlobal ? 'ring-1 ring-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header with folder icon and title */}
        <div className="flex items-center gap-2 mb-2">
          <Folder className="w-4 h-4 text-gray-400" />
          <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
            {project.name}
          </h3>
        </div>

        {/* Path */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
          {project.path}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1 mb-3">
          {stats.claudeMd && (
            <Badge
              variant="secondary"
              className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0 cursor-pointer hover:bg-orange-200 dark:hover:bg-orange-900/50"
              onClick={(e) => {
                e.stopPropagation()
                if (onBadgeClick) {
                  onClick()
                  setTimeout(() => onBadgeClick('memory'), 100)
                }
              }}
            >
              Memory
            </Badge>
          )}
          {stats.settings > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
              onClick={(e) => {
                e.stopPropagation()
                if (onBadgeClick) {
                  onClick()
                  setTimeout(() => onBadgeClick('settings'), 100)
                }
              }}
            >
              {stats.settings} Settings
            </Badge>
          )}
          {stats.agents > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50"
              onClick={(e) => {
                e.stopPropagation()
                if (onBadgeClick) {
                  onClick()
                  setTimeout(() => onBadgeClick('agents'), 100)
                }
              }}
            >
              {stats.agents} Agents
            </Badge>
          )}
        </div>

        {/* File count footer */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
        </div>
      </div>
    </Card>
  )
}