'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskCard } from '@/components/ui/task-card'
import { AgentCard } from '@/components/ui/agent-workload'
import { TeamStatus } from '@/components/ui/team-status'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFileWatcher } from '@/hooks/useFileWatcher'
import { useEffect, useState } from 'react'
import type { Task, Agent, Story, Ticket } from '@/types/task'

export default function TabbedDashboard() {
  const { agents: monitoredAgents, isWatching, lastUpdate, error: watcherError } = useFileWatcher()
  const [agents, setAgents] = useState<Agent[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [agentsResponse, storiesResponse] = await Promise.all([
          fetch('/data/agents.json'),
          fetch('/data/stories.json')
        ])
        
        const agentsData = await agentsResponse.json()
        const storiesData = await storiesResponse.json()
        
        setAgents(agentsData || [])
        setStories(storiesData || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (lastUpdate) {
      const reloadData = async () => {
        try {
          const [agentsResponse, storiesResponse] = await Promise.all([
            fetch('/data/agents.json'),
            fetch('/data/stories.json')
          ])
          
          setAgents(await agentsResponse.json() || [])
          setStories(await storiesResponse.json() || [])
        } catch (error) {
          console.error('Error reloading data:', error)
        }
      }
      reloadData()
    }
  }, [lastUpdate])

  const hasRosterData = agents.length > 0
  const hasStories = stories.length > 0
  const isLoading = loading || (!hasRosterData && !hasStories)

  const allTickets = stories.flatMap(story => story.tickets).map(ticket => ({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: 'development' as any,
    assignee: ticket.assignee,
    dueDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ticketId: ticket.id,
    storyId: ticket.storyId
  }))

  const allTicketsCount = allTickets.length
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Task Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {isLoading ? (
            <span className="text-yellow-500 font-medium">🔄 Loading dashboard data...</span>
          ) : hasStories ? (
            <span className="text-success font-medium">🚀 Agile workflow active ({stories.length} stories, {allTicketsCount} tickets)</span>
          ) : hasRosterData ? (
            <span className="text-success font-medium">✅ GitHub-hosted dashboard ({agents.length} agents with roles)</span>
          ) : (
            'GitHub-hosted dashboard with automatic refresh capabilities'
          )}
          {isWatching && (
            <span className="text-blue-500 font-medium ml-2">⋅ Auto-refresh active</span>
          )}
          {watcherError && (
            <span className="text-red-500 font-medium ml-2">⋅ Error: {watcherError}</span>
          )}
        </p>
      </header>

      {/* Overview Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{isLoading ? "🔄 Loading..." : hasStories ? "🚀 Agile Workflow Active" : hasRosterData ? "✅ GitHub Hosted Dashboard" : "🎯 Mobile Ready Dashboard"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{hasStories ? "🏢 Story Breakdown" : "🏢 Company Structure"}</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Loading agent data...'
                : hasStories
                  ? `${stories.length} stories with ${allTicketsCount} tickets tracked`
                  : `Using structured company roster with ${agents.length} roles`
              }
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">📊 Live Updates</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? 'Data loading...'
                : isWatching 
                  ? `File watching active • Last update: ${lastUpdate ? new Date(lastUpdate).toISOString() : 'None'}`
                  : 'Automatic reload when files change'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="team">👥 Team Status</TabsTrigger>
          <TabsTrigger value="tickets">📋 Tickets ({allTicketsCount})</TabsTrigger>
          <TabsTrigger value="agents">👨‍💼 Agents ({agents.length})</TabsTrigger>
        </TabsList>

        {/* Team Status Tab */}
        <TabsContent value="team">
          <TeamStatus />

          {hasStories && stories.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Active Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {stories.map((story) => (
                    <Card key={story.id} className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{story.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{story.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{story.type}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{story.status}</span>
                          </div>
                        </div>
                      </CardHeader>
                      {story.tickets.length > 0 && (
                        <CardContent>
                          <h4 className="font-medium mb-3">Tickets ({story.tickets.length})</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {story.tickets.map((ticket) => (
                              <div key={ticket.id} className="border rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium">{ticket.title}</span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{ticket.status}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs">Assigned to: {ticket.assignee}</span>
                                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{ticket.priority}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading tickets...</p>
              </CardContent>
            </Card>
          ) : allTicketsCount > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allTickets.map((ticket) => (
                <TaskCard
                  key={ticket.id}
                  task={ticket as Task}
                  showAssignee={true}
                  showCategory={false}
                  className="h-fit"
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No tickets currently assigned.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading agents...</p>
              </CardContent>
            </Card>
          ) : agents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.name}
                  agent={agent}
                  showActiveTasks={true}
                  className="h-fit"
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No agent data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Available Features Footer */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🚀 Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Agile workflow tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Story/ticket breakdown</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time status updates</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Workload visualization</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Live team tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real assignment monitoring</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}