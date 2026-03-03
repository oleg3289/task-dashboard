import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { webSocketServer } from './src/lib/websocket-server.js'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`\u003e Ready on http://${hostname}:${port}`)
    
    // Start WebSocket server after HTTP server is ready
    webSocketServer.start(server)
  })
})