'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api-path'

export interface FileWatcherHook {
  isWatching: boolean
  agents: string[]
  lastUpdate: string | null
  error: string | null
}

/**
 * Simple file watcher that polls static data files
 * Watches both agents.json and stories.json for changes
 */
export function useFileWatcher(): FileWatcherHook {
  const [isWatching, setIsWatching] = useState(false)
  const [agents, setAgents] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  
  useEffect(() => {
    let lastStoriesHash = ''
    
    const pollForUpdates = async () => {
      try {
        // Poll agents
        const agentsResponse = await apiFetch('/data/agents.json')
        if (agentsResponse.ok) {
          const data = await agentsResponse.json()
          const agentNames = Array.isArray(data) 
            ? data.map((a: any) => a.name) 
            : []
          setAgents(agentNames || [])
        }
        
        // Poll stories and check for changes
        const storiesResponse = await apiFetch('/data/stories.json?t=' + Date.now(), {
          headers: { 'Cache-Control': 'no-cache' }
        })
        if (storiesResponse.ok) {
          const text = await storiesResponse.text()
          // Simple hash check - if content changed, trigger update
          if (text !== lastStoriesHash) {
            lastStoriesHash = text
            setDataVersion(v => v + 1)
            setLastUpdate(new Date().toISOString())
          }
        }
        
        setError(null)
      } catch (err) {
        setError('Failed to fetch updates')
        console.error('Polling error:', err)
      }
    }

    // Poll every 10 seconds
    const interval = setInterval(pollForUpdates, 10000)
    setIsWatching(true)
    
    // Initial poll
    pollForUpdates()

    return () => {
      clearInterval(interval)
      setIsWatching(false)
    }
  }, [])

  return {
    isWatching,
    agents,
    lastUpdate,
    error
  }
}