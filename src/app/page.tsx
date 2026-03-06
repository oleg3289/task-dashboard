'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamStatus } from '@/components/ui/team-status'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TicketsTab } from '@/components/ui/tickets-tab'
import { StoriesTab } from '@/components/ui/stories-tab'
import { TicketsFilterProvider } from '@/contexts/tickets-filter-context'
import { useFileWatcher } from '@/hooks/useFileWatcher'
import { useTeamTracker } from '@/hooks/useTeamTracker'
import { apiFetch } from '@/lib/api-path'
import { useEffect, useState } from 'react'
import type { Agent, Story } from '@/types/task'

export default function TabbedDashboard() {
  const { isWatching, lastUpdate, error: watcherError } = useFileWatcher()
  const { team, isLoading: teamLoading } = useTeamTracker()
  const [agents, setAgents] = useState<Agent[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [agentsResponse, storiesResponse] = await Promise.all([
          apiFetch('/data/agents.json'),
          apiFetch('/data/stories.json')
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
            apiFetch('/data/agents.json'),
            apiFetch('/data/stories.json')
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

  // Calculate ticket stats
  const allTickets = stories.flatMap(story => story.tickets || [])
  const ticketsByStatus = {
    done: allTickets.filter(t => t.status === 'done' || t.status === 'completed').length,
    inProgress: allTickets.filter(t => t.status === 'in-progress').length,
    review: allTickets.filter(t => t.status === 'review').length,
    todo: allTickets.filter(t => t.status === 'todo' || t.status === 'to-do').length,
    backlog: allTickets.filter(t => t.status === 'backlog').length,
  }
  const totalTickets = allTickets.length
  const completionPercent = totalTickets > 0 
    ? Math.round((ticketsByStatus.done / totalTickets) * 100) 
    : 0

  // Agent status counts
  const workingAgents = team.filter(m => m.status === 'working').length
  const availableAgents = team.filter(m => m.status === 'available').length
  const idleAgents = team.filter(m => m.status === 'idle').length

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Task Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading ? (
            <span className="text-yellow-500 font-medium">🔄 Loading...</span>
          ) : (
            <span>
              {hasStories && (
                <span>{stories.length} stories • {totalTickets} tickets • {workingAgents} working</span>
              )}
              {isWatching && (
                <span className="text-blue-500 ml-2">• Auto-refresh on</span>
              )}
            </span>
          )}
          {watcherError && (
            <span className="text-red-500 ml-2">• Error: {watcherError}</span>
          )}
        </p>
      </header>

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="stories">📚 Stories ({stories.length})</TabsTrigger>
          <TabsTrigger value="tickets">📋 Tickets ({totalTickets})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{workingAgents}</div>
                <div className="text-sm text-muted-foreground">Working</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{availableAgents}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{idleAgents}</div>
                <div className="text-sm text-muted-foreground">Idle</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{completionPercent}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </CardContent>
            </Card>
          </div>

          {/* Team Status */}
          <TeamStatus />

          {/* Currently Working On */}
          {team.filter(m => m.status === 'working' && m.currentTask).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">🔥 Currently Working On</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team
                    .filter(m => m.status === 'working' && m.currentTask)
                    .map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="font-medium">{member.name}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm truncate">{member.currentTask}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sprint Progress */}
          {hasStories && stories.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📈 Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sprint Completion</span>
                      <span>{completionPercent}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Status breakdown */}
                  <div className="grid grid-cols-5 gap-2 text-center text-sm">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-semibold">{ticketsByStatus.done}</div>
                      <div className="text-xs text-muted-foreground">Done</div>
                    </div>
                    <div className="p-2 rounded bg-purple-500/20">
                      <div className="font-semibold">{ticketsByStatus.review}</div>
                      <div className="text-xs text-muted-foreground">Review</div>
                    </div>
                    <div className="p-2 rounded bg-yellow-500/20">
                      <div className="font-semibold">{ticketsByStatus.inProgress}</div>
                      <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                    <div className="p-2 rounded bg-blue-500/20">
                      <div className="font-semibold">{ticketsByStatus.todo}</div>
                      <div className="text-xs text-muted-foreground">To Do</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="font-semibold">{ticketsByStatus.backlog}</div>
                      <div className="text-xs text-muted-foreground">Backlog</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stories Tab */}
        <TabsContent value="stories">
          <StoriesTab 
            stories={stories.map(story => ({
              ...story,
              tickets: story.tickets || []
            }))}
          />
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets">
          <TicketsFilterProvider>
            <TicketsTab />
          </TicketsFilterProvider>
        </TabsContent>
      </Tabs>
    </div>
  )
}