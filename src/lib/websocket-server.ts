import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import { watch } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface WebSocketMessage {
  type: 'file_change' | 'ticket_update' | 'status_change' | 'ping'
  data: any
  timestamp: string
}

export class DashboardWebSocketServer {
  private wss: WebSocketServer | null = null
  private clients: Set<WebSocket> = new Set()

  start(server: Server) {
    this.wss = new WebSocketServer({ server })
    
    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws)
      console.log('WebSocket client connected')
      
      // Send initial data
      this.sendInitialData(ws)
      
      // Start file watching when first client connects
      if (this.clients.size === 1) {
        this.startFileWatching()
      }
      
      ws.on('message', (message: Buffer) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString())
          this.handleMessage(data, ws)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })
      
      ws.on('close', () => {
        this.clients.delete(ws)
        console.log('WebSocket client disconnected')
        
        // Stop file watching if no clients left
        if (this.clients.size === 0) {
          // File watching cleanup would go here
        }
      })
    })
    
    console.log('WebSocket server started')
  }

  private startFileWatching() {
    const workspacePath = path.join(process.cwd(), '..', '..')
    const rosterPath = path.join(workspacePath, 'COMPANY_ROSTER.md')
    
    // Watch COMPANY_ROSTER.md for changes
    watch(rosterPath, (eventType) => {
      if (eventType === 'change') {
        console.log('COMPANY_ROSTER.md changed, broadcasting update')
        this.broadcast({
          type: 'file_change',
          data: { file: 'COMPANY_ROSTER.md', event: 'changed' },
          timestamp: new Date().toISOString()
        })
      }
    })
    
    console.log('Started file watching for real-time updates')
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const { readCompanyRoster, readWorkflowData } = await import('./file-monitor')
      const agents = await readCompanyRoster()
      const stories = await readWorkflowData()
      
      ws.send(JSON.stringify({
        type: 'initial_data',
        data: { agents, stories },
        timestamp: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error sending initial data:', error)
    }
  }

  private handleMessage(message: WebSocketMessage, ws: WebSocket) {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          data: {},
          timestamp: new Date().toISOString()
        }))
        break
      case 'ticket_update':
        // Handle ticket status updates from dashboard
        this.broadcast({
          type: 'ticket_update',
          data: message.data,
          timestamp: new Date().toISOString()
        })
        break
    }
  }

  private broadcast(message: WebSocketMessage) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  stop() {
    this.wss?.close()
    this.clients.clear()
  }
}

export const webSocketServer = new DashboardWebSocketServer()