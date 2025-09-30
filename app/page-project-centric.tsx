"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProjectCentricDashboard from "@/components/ProjectCentricDashboard"
import CrossProjectActions from "@/components/CrossProjectActions"
import ProjectMCPServers from "@/components/ProjectMCPServers"
import {
  Settings,
  RefreshCw,
  Save,
  Shield,
  Check,
  AlertCircle,
  Archive,
  GitBranch,
  Globe
} from "lucide-react"

export default function ModernDashboard() {
  const [view, setView] = useState<'project' | 'legacy'>('project')
  const [status, setStatus] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatus()
    fetchProfiles()
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status")
      const data = await res.json()
      setStatus(data)
      setCurrentProfile(data.currentProfile)
    } catch (error) {
      console.error("Failed to fetch status:", error)
    }
  }

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/profiles")
      const data = await res.json()
      setProfiles(data.profiles)
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
    }
  }

  const captureCurrentConfig = async () => {
    const name = prompt("Enter profile name:")
    if (!name) return

    setLoading(true)
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })

      if (res.ok) {
        await fetchProfiles()
        alert("Profile captured successfully!")
      }
    } catch (error) {
      console.error("Failed to capture profile:", error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header with View Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Claude Config Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Unified management for Claude Desktop, Claude Code, and memory systems
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              <Tabs value={view} onValueChange={(v) => setView(v as 'project' | 'legacy')}>
                <TabsList className="bg-white dark:bg-slate-800 border shadow-sm">
                  <TabsTrigger value="project" className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Project View
                  </TabsTrigger>
                  <TabsTrigger value="legacy" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Legacy View
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Status Cards */}
          {status && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Active Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="text-lg px-4 py-2 bg-blue-600">
                      {status.currentProfile || "None"}
                    </Badge>
                    {profiles.length > 0 && (
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {profiles.length} total
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Configuration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Claude Desktop</span>
                      <div className="flex items-center gap-1">
                        {status.desktopConfigExists ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-slate-600">
                          {status.desktopConfigExists ? 'Active' : 'Missing'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Claude Code</span>
                      <div className="flex items-center gap-1">
                        {status.codeConfigExists ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-xs text-slate-600">
                          {status.codeConfigExists ? 'Active' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Archive className="w-5 h-5 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={captureCurrentConfig}
                      disabled={loading}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Capture Profile
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.reload()}
                      disabled={loading}
                      className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-purple-600" />
                    {view === 'project' ? 'Project Mode' : 'Legacy Mode'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {view === 'project'
                      ? 'Managing configs by project with unified cross-project actions'
                      : 'Traditional tab-based interface for detailed configuration management'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Content Based on View */}
        {view === 'project' ? (
          <ProjectCentricDashboard />
        ) : (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're viewing the legacy interface. Switch to Project View for the improved project-centric workflow.
              </AlertDescription>
            </Alert>
            {/* Note: Would import and render the original Dashboard component here */}
            <Card className="p-8 text-center">
              <p className="text-gray-500 mb-4">Legacy view would be rendered here</p>
              <Button variant="outline" onClick={() => setView('project')}>
                Switch to Project View
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}