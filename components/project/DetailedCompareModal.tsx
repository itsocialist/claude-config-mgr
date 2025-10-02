"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Settings,
  Brain,
  Server,
  Code,
  ArrowRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

interface DetailedCompareModalProps {
  isOpen: boolean
  onClose: () => void
  project1: any
  project2: any
}

export default function DetailedCompareModal({
  isOpen,
  onClose,
  project1,
  project2
}: DetailedCompareModalProps) {
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('memory')

  useEffect(() => {
    if (isOpen && project1 && project2) {
      loadComparison()
    }
  }, [isOpen, project1, project2])

  const loadComparison = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/compare-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project1Path: project1.path,
          project2Path: project2.path
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load comparison')
      }

      const data = await response.json()
      setComparison(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderMemoryComparison = () => {
    if (!comparison?.memory) return null

    const { project1: p1, project2: p2, differences } = comparison.memory

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {project1?.name}
              {p1.exists ? (
                <Badge variant="default">Present</Badge>
              ) : (
                <Badge variant="secondary">Absent</Badge>
              )}
            </h4>
            {p1.exists && (
              <div className="text-xs text-gray-500 mb-2">
                Path: {p1.path?.replace(project1.path, '.')}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {project2?.name}
              {p2.exists ? (
                <Badge variant="default">Present</Badge>
              ) : (
                <Badge variant="secondary">Absent</Badge>
              )}
            </h4>
            {p2.exists && (
              <div className="text-xs text-gray-500 mb-2">
                Path: {p2.path?.replace(project2.path, '.')}
              </div>
            )}
          </div>
        </div>

        {differences && (
          <div className="border rounded-lg p-4">
            <h5 className="font-semibold mb-2">Differences</h5>
            <ScrollArea className="h-64">
              <div className="space-y-1 text-sm font-mono">
                {differences.map((part: any, index: number) => (
                  <div
                    key={index}
                    className={`p-1 ${
                      part.added
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : part.removed
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        : ''
                    }`}
                  >
                    {part.value}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    )
  }

  const renderSettingsComparison = () => {
    if (!comparison?.settings) return null

    const { project1: p1, project2: p2, differences } = comparison.settings

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">
              {project1?.name} ({p1.length} files)
            </h4>
            <div className="space-y-1">
              {p1.map((file: any) => (
                <Badge key={file.name} variant="outline">
                  {file.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">
              {project2?.name} ({p2.length} files)
            </h4>
            <div className="space-y-1">
              {p2.map((file: any) => (
                <Badge key={file.name} variant="outline">
                  {file.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {Object.keys(differences).length > 0 && (
          <div className="border rounded-lg p-4">
            <h5 className="font-semibold mb-2">File Differences</h5>
            <div className="space-y-2">
              {Object.entries(differences).map(([file, diff]: [string, any]) => (
                <div key={file} className="border rounded p-2">
                  <h6 className="font-medium text-sm mb-1">{file}</h6>
                  {diff.error ? (
                    <Badge variant="destructive">{diff.error}</Badge>
                  ) : (
                    <div className="text-xs space-y-1">
                      {diff.keysOnlyIn1?.length > 0 && (
                        <div>Only in {project1?.name}: {diff.keysOnlyIn1.join(', ')}</div>
                      )}
                      {diff.keysOnlyIn2?.length > 0 && (
                        <div>Only in {project2?.name}: {diff.keysOnlyIn2.join(', ')}</div>
                      )}
                      {diff.differentValues?.length > 0 && (
                        <div>Different values: {diff.differentValues.join(', ')}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderAgentsComparison = () => {
    if (!comparison?.agents) return null

    const { project1: p1, project2: p2, differences } = comparison.agents

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">
              {project1?.name} ({p1.length} agents)
            </h4>
            <div className="space-y-1">
              {p1.map((agent: any) => (
                <Badge key={agent.name} variant="outline">
                  {agent.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">
              {project2?.name} ({p2.length} agents)
            </h4>
            <div className="space-y-1">
              {p2.map((agent: any) => (
                <Badge key={agent.name} variant="outline">
                  {agent.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {differences && (
          <div className="border rounded-lg p-4">
            <h5 className="font-semibold mb-2">Differences</h5>
            <div className="space-y-2 text-sm">
              {differences.onlyIn1?.length > 0 && (
                <div>
                  <span className="font-medium">Only in {project1?.name}:</span>{' '}
                  {differences.onlyIn1.join(', ')}
                </div>
              )}
              {differences.onlyIn2?.length > 0 && (
                <div>
                  <span className="font-medium">Only in {project2?.name}:</span>{' '}
                  {differences.onlyIn2.join(', ')}
                </div>
              )}
              {differences.inBoth?.length > 0 && (
                <div>
                  <span className="font-medium">In both:</span>{' '}
                  {differences.inBoth.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderMCPComparison = () => {
    if (!comparison?.mcp) return null

    const { project1: p1, project2: p2, differences } = comparison.mcp

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {project1?.name}
              {p1.exists ? (
                <Badge variant="default">Has MCP</Badge>
              ) : (
                <Badge variant="secondary">No MCP</Badge>
              )}
            </h4>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {project2?.name}
              {p2.exists ? (
                <Badge variant="default">Has MCP</Badge>
              ) : (
                <Badge variant="secondary">No MCP</Badge>
              )}
            </h4>
          </div>
        </div>

        {differences && !differences.error && (
          <div className="border rounded-lg p-4">
            <h5 className="font-semibold mb-2">Server Differences</h5>
            <div className="space-y-2 text-sm">
              {differences.servers?.onlyIn1?.length > 0 && (
                <div>
                  <span className="font-medium">Only in {project1?.name}:</span>{' '}
                  {differences.servers.onlyIn1.join(', ')}
                </div>
              )}
              {differences.servers?.onlyIn2?.length > 0 && (
                <div>
                  <span className="font-medium">Only in {project2?.name}:</span>{' '}
                  {differences.servers.onlyIn2.join(', ')}
                </div>
              )}
              {differences.servers?.different?.length > 0 && (
                <div>
                  <span className="font-medium">Different configurations:</span>{' '}
                  {differences.servers.different.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detailed Configuration Comparison</DialogTitle>
          <DialogDescription>
            Comparing <strong>{project1?.name}</strong> with <strong>{project2?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p>Loading comparison...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5" />
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        {comparison && !loading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="memory" className="gap-2">
                <FileText className="w-4 h-4" />
                Memory
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2">
                <Brain className="w-4 h-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="mcp" className="gap-2">
                <Server className="w-4 h-4" />
                MCP
              </TabsTrigger>
              <TabsTrigger value="hooks" className="gap-2">
                <Code className="w-4 h-4" />
                Hooks
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-96 mt-4">
              <TabsContent value="memory">{renderMemoryComparison()}</TabsContent>
              <TabsContent value="settings">{renderSettingsComparison()}</TabsContent>
              <TabsContent value="agents">{renderAgentsComparison()}</TabsContent>
              <TabsContent value="mcp">{renderMCPComparison()}</TabsContent>
              <TabsContent value="hooks">
                {/* Similar to agents, can be implemented */}
                <div className="text-center text-gray-500 py-8">
                  Hooks comparison coming soon
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}