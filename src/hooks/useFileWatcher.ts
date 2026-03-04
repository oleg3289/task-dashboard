'use client'

import { useState, useEffect } from 'react'

export interface FileWatcherHook {
  isWatching: boolean
  agents: string[]
  lastUpdate: string | null
  error: string | null
}

/**
 * Simple file watcher that polls static data files
 */
export function useFileWatcher(): FileWatcherHook {
  const [isWatching, setIsWatching] = useState(false)
  const [agents, setAgents] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const response = await fetch('/data/agents.json')
        if (response.ok) {
          const data = await response.json()
          // Handle both array and non-array responses
          const agentNames = Array.isArray(data) 
            ? data.map((a: any) => a.name) 
            : Array.isArray(data?.map) 
              ? data.map((a: any) => a.name) 
              : []
          setAgents(agentNames || [])
          setLastUpdate(new Date().toISOString())
          setError(null)
        }
      } catch (err) {
        setError('Failed to fetch updates')
        console.error('Polling error:', err)
      }
    }

    // Start polling every 10 seconds (longer interval for GitHub Pages)
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