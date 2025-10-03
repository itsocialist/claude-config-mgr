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
  const [projectPaths, setProjectPaths] = React.useState<string[]>(['~/workspace'])
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
        setProjectPaths(Array.isArray(paths) ? paths : ['~/workspace'])
      } catch {
        setProjectPaths(['~/workspace'])
      }
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Claude Config Manager looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme" className="w-full">
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
                <p className="text-sm text-muted-foreground">
                  Choose between light, dark, or system default theme
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Project Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Project Discovery
              </CardTitle>
              <CardDescription>
                Configure where Claude Config Manager looks for projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Workspace Paths</Label>
                  <p className="text-sm text-muted-foreground">
                    Configure multiple directories where Claude Config Manager will search for projects
                  </p>
                </div>

                {/* Existing paths */}
                <div className="space-y-2">
                  {projectPaths.map((path, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/50">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 font-mono text-sm">{path}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePath(index)}
                        disabled={projectPaths.length === 1}
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
                  />
                  <Button
                    onClick={handleAddPath}
                    disabled={!newPath || projectPaths.includes(newPath)}
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}