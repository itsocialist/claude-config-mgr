"use client"

import React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  FileText,
  Shield,
  Brain
} from "lucide-react"

interface ProjectSearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortOrder: 'asc' | 'desc'
  onSortChange: (order: 'asc' | 'desc') => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  filters: {
    hasClaudeMd: boolean
    hasMCP: boolean
    hasAgents: boolean
  }
  onFiltersChange: (filters: any) => void
}

export default function ProjectSearchBar({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange
}: ProjectSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filters.hasClaudeMd ? "default" : "outline"}
          onClick={() => onFiltersChange({ ...filters, hasClaudeMd: !filters.hasClaudeMd })}
          className="gap-1"
        >
          <FileText className="w-4 h-4" />
          Memory
        </Button>

        <Button
          size="sm"
          variant={filters.hasMCP ? "default" : "outline"}
          onClick={() => onFiltersChange({ ...filters, hasMCP: !filters.hasMCP })}
          className="gap-1"
        >
          <Brain className="w-4 h-4" />
          MCP
        </Button>

        <Button
          size="sm"
          variant={filters.hasAgents ? "default" : "outline"}
          onClick={() => onFiltersChange({ ...filters, hasAgents: !filters.hasAgents })}
          className="gap-1"
        >
          <Shield className="w-4 h-4" />
          Agents
        </Button>
      </div>

      {/* Sort & View Controls */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
        </Button>

        <div className="flex gap-1 border rounded-md p-1">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? "default" : "ghost"}
            onClick={() => onViewModeChange('grid')}
            className="h-7 w-7 p-0"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? "default" : "ghost"}
            onClick={() => onViewModeChange('list')}
            className="h-7 w-7 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}