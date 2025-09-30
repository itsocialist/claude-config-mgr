import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface Project {
  name: string
  path: string
  claudeMd?: any
  settings: any[]
  agents: any[]
  hooks?: any[]
  mcpServers?: any[]
}

interface GlobalConfig {
  claudeMd?: any
  settings: any[]
  agents: any[]
  hooks: any[]
}

interface ProjectState {
  // Data
  projects: Project[]
  globalConfig: GlobalConfig | null
  activeProjectId: string | null
  selectedFiles: Map<string, any>

  // UI State
  viewMode: 'grid' | 'list'
  searchTerm: string
  filters: {
    hasClaudeMd: boolean
    hasMCP: boolean
    hasAgents: boolean
  }
  sortOrder: 'asc' | 'desc'

  // Actions
  setProjects: (projects: Project[]) => void
  setGlobalConfig: (config: GlobalConfig) => void
  setActiveProject: (projectId: string | null) => void
  updateProject: (projectPath: string, updates: Partial<Project>) => void

  // UI Actions
  setViewMode: (mode: 'grid' | 'list') => void
  setSearchTerm: (term: string) => void
  setFilters: (filters: Partial<ProjectState['filters']>) => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // Selectors
  getProjectByPath: (path: string) => Project | undefined
  getFilteredProjects: () => Project[]
  getProjectStats: () => {
    total: number
    withClaudeMd: number
    withAgents: number
    withMCP: number
  }

  // Cross-Project Operations
  copyConfigBetweenProjects: (
    sourcePath: string,
    targetPath: string,
    configTypes: string[]
  ) => Promise<void>
}

export const useProjectStore = create<ProjectState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    projects: [],
    globalConfig: null,
    activeProjectId: null,
    selectedFiles: new Map(),
    viewMode: 'grid',
    searchTerm: '',
    filters: {
      hasClaudeMd: false,
      hasMCP: false,
      hasAgents: false
    },
    sortOrder: 'asc',

    // Data Actions
    setProjects: (projects) => set({ projects }),

    setGlobalConfig: (config) => set({ globalConfig: config }),

    setActiveProject: (projectId) => set({ activeProjectId: projectId }),

    updateProject: (projectPath, updates) => set((state) => ({
      projects: state.projects.map(p =>
        p.path === projectPath ? { ...p, ...updates } : p
      )
    })),

    // UI Actions
    setViewMode: (mode) => set({ viewMode: mode }),

    setSearchTerm: (term) => set({ searchTerm: term }),

    setFilters: (filters) => set((state) => ({
      filters: { ...state.filters, ...filters }
    })),

    setSortOrder: (order) => set({ sortOrder: order }),

    // Selectors
    getProjectByPath: (path) => {
      return get().projects.find(p => p.path === path)
    },

    getFilteredProjects: () => {
      const { projects, searchTerm, filters, sortOrder } = get()

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
    },

    getProjectStats: () => {
      const projects = get().projects
      return {
        total: projects.length,
        withClaudeMd: projects.filter(p => p.claudeMd).length,
        withAgents: projects.filter(p => p.agents?.length > 0).length,
        withMCP: projects.filter(p => p.mcpServers?.length > 0).length
      }
    },

    // Cross-Project Operations
    copyConfigBetweenProjects: async (sourcePath, targetPath, configTypes) => {
      const sourceProject = get().getProjectByPath(sourcePath)
      const targetProject = get().getProjectByPath(targetPath)

      if (!sourceProject || !targetProject) {
        throw new Error('Source or target project not found')
      }

      // This would implement the actual file copying logic
      // For now, it's a placeholder
      console.log('Copying configs:', {
        from: sourceProject.name,
        to: targetProject.name,
        types: configTypes
      })

      // In a real implementation, this would:
      // 1. Call API endpoints to copy files
      // 2. Update the target project in the store
      // 3. Handle errors appropriately

      return Promise.resolve()
    }
  }))
)