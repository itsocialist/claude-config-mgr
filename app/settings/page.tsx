"use client"
import React from 'react'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Moon, Sun, Monitor, FolderOpen, Plus, Trash2 } from 'lucide-react'
import { showToast } from '@/components/StatusBar'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [projectPaths, setProjectPaths] = React.useState<string[]>([])
  const [newPath, setNewPath] = React.useState('')
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
    // Load saved project paths from localStorage
    const savedPaths = localStorage.getItem('workspacePaths')
    if (savedPaths) {
      try {
        const paths = JSON.parse(savedPaths)
        if (Array.isArray(paths) && paths.length > 0) {
          setProjectPaths(paths)
        } else {
          setProjectPaths(['~/workspace']) // Default workspace
        }
      } catch {
        setProjectPaths(['~/workspace']) // Default workspace
      }
    } else {
      setProjectPaths(['~/workspace']) // Default workspace if nothing saved
    }
  }, [])

  const handleAddPath = () => {
    if (newPath && !projectPaths.includes(newPath)) {
      setProjectPaths([...projectPaths, newPath])
      setNewPath('')
    }
  }

  const handleRemovePath = (index: number) => {
    if (projectPaths.length > 1) {
      setProjectPaths(projectPaths.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    // Save project paths to localStorage
    localStorage.setItem('workspacePaths', JSON.stringify(projectPaths))
    showToast('success', 'Settings saved successfully')
    // Navigate back to previous screen
    router.push('/project-dashboard')
  }

  const handleBack = () => {
    router.push('/project-dashboard')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header - matching project dashboard */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-medium text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Appearance Settings - Clean design */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Customize how Claude Config Manager looks
            </p>

            <div className="space-y-2">
              <Label htmlFor="theme" className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="w-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose between light, dark, or system default theme
              </p>
            </div>
          </div>

          {/* Project Settings - Clean design */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Project Discovery</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Configure where Claude Config Manager looks for projects
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Workspace Paths</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Configure multiple directories where Claude Config Manager will search for projects
                </p>
              </div>

              {/* Existing paths */}
              <div className="space-y-2">
                {projectPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="flex-1 font-mono text-sm text-gray-700 dark:text-gray-300">{path}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePath(index)}
                      disabled={projectPaths.length === 1}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add new path */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="/path/to/workspace"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPath()}
                  className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600"
                />
                <Button
                  onClick={handleAddPath}
                  disabled={!newPath || projectPaths.includes(newPath)}
                  size="icon"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button - Clean style */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}