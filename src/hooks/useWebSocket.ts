import { useEffect, useRef, useState } from 'react'
import type { Story, Agent } from '@/types/task'

interface WebSocketMessage {
  type: 'file_change' | 'ticket_update' | 'status_change' | 'initial_data' | 'ping' | 'pong'
  data: any
  timestamp: string
}

interface WebSocketState {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  agents: Agent[]
  stories: Story[]
  error: string | null
}

export function useWebSocket() {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastMessage: null,
    agents: [],
    stories: [],
    error: null
  })
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const connect = () => {
      // Determine WebSocket URL based on environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws`
      
      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          setState(prev => ({ ...prev, isConnected: true, error: null }))
          
          // Clear any reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            setState(prev => ({
              ...prev,
              lastMessage: message
            }))
            
            // Handle different message types
            switch (message.type) {
              case 'initial_data':
                setState(prev => ({
                  ...prev,
                  agents: message.data.agents || [],
                  stories: message.data.stories || []
                }))
                break
              case 'file_change':
                // Trigger refresh when COMPANY_ROSTER.md changes
                console.log('File changed, data may need refresh')
                break
              case 'ticket_update':
                // Update specific ticket
                console.log('Ticket updated:', message.data)
                break
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          setState(prev => ({ ...prev, isConnected: false }))
          
          // Attempt reconnect after delay
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setState(prev => ({ 
            ...prev, 
            error: 'Connection failed', 
            isConnected: false 
          }))
        }
      } catch (error) {
        console.error('Error creating WebSocket:', error)
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to connect', 
          isConnected: false 
        }))
      }
    }

    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [])

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      }
      wsRef.current.send(JSON.stringify(fullMessage))
    }
  }

  return {
    ...state,
    sendMessage
  }
}