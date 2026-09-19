import { createServer } from 'node:http'
import { parse } from 'node:url'
import { WebSocketServer, type WebSocket } from 'ws'
import { bumpRoomVersion, createRoom, getRoom, joinRoom, setPlayerConnection } from './store'
import type { ClientAction, Room, ServerEvent } from './types'

const port = Number(process.env.PORT ?? 8787)
const clients = new Map<string, Set<WebSocket>>()

const json = (response: import('node:http').ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
  })
  response.end(JSON.stringify(body))
}

const broadcastRoom = (room: Room) => {
  const event: ServerEvent = { type: 'room:state', room }
  const serialized = JSON.stringify(event)
  for (const socket of clients.get(room.code) ?? []) {
    if (socket.readyState === socket.OPEN) socket.send(serialized)
  }
}

const httpServer = createServer((request, response) => {
  const url = parse(request.url ?? '/', true)
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    })
    response.end()
    return
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    json(response, 200, { ok: true, service: 'sala-de-juegos-server' })
    return
  }

  if (request.method === 'GET' && url.pathname?.startsWith('/api/rooms/')) {
    const code = url.pathname.split('/').pop() ?? ''
    const room = getRoom(code)
    if (!room) {
      json(response, 404, { error: 'Sala no encontrada' })
      return
    }
    json(response, 200, { room })
    return
  }

  if (request.method === 'POST' && (url.pathname === '/api/rooms' || url.pathname === '/api/rooms/join')) {
    let body = ''
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => {
      try {
        const payload = JSON.parse(body) as { code?: string; game?: 'monopoly'; name?: string }
        if (!payload.name?.trim()) {
          json(response, 400, { error: 'El nombre es obligatorio' })
          return
        }
        const result = url.pathname === '/api/rooms'
          ? createRoom(payload.game ?? 'monopoly', payload.name.trim())
          : payload.code ? joinRoom(payload.code, payload.name.trim()) : null
        if (!result) {
          json(response, 404, { error: 'Sala no encontrada' })
          return
        }
        json(response, 201, result)
      } catch {
        json(response, 400, { error: 'JSON no valido' })
      }
    })
    return
  }

  json(response, 404, { error: 'Ruta no encontrada' })
})

const websocketServer = new WebSocketServer({ noServer: true })

httpServer.on('upgrade', (request, socket, head) => {
  const url = parse(request.url ?? '/', true)
  if (url.pathname !== '/ws' || typeof url.query.room !== 'string' || typeof url.query.playerId !== 'string') {
    socket.destroy()
    return
  }

  const room = getRoom(url.query.room)
  if (!room || !room.players.some((player) => player.id === url.query.playerId)) {
    socket.destroy()
    return
  }

  websocketServer.handleUpgrade(request, socket, head, (client) => {
    websocketServer.emit('connection', client, request, room.code, url.query.playerId as string)
  })
})

websocketServer.on('connection', (socket: WebSocket, _request, roomCode: string, playerId: string) => {
  const room = getRoom(roomCode)
  if (!room) return

  const roomClients = clients.get(roomCode) ?? new Set<WebSocket>()
  roomClients.add(socket)
  clients.set(roomCode, roomClients)
  setPlayerConnection(roomCode, playerId, true)
  broadcastRoom(room)

  socket.on('message', (raw) => {
    try {
      const action = JSON.parse(raw.toString()) as ClientAction
      bumpRoomVersion(room)
      broadcastRoom(room)
      const event: ServerEvent = { type: 'action:accepted', action, playerId }
      for (const client of clients.get(roomCode) ?? []) {
        if (client.readyState === client.OPEN) client.send(JSON.stringify(event))
      }
    } catch {
      socket.send(JSON.stringify({ type: 'room:error', message: 'Accion no valida' } satisfies ServerEvent))
    }
  })

  socket.on('close', () => {
    roomClients.delete(socket)
    setPlayerConnection(roomCode, playerId, false)
    broadcastRoom(room)
  })
})

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`Servidor listo en http://localhost:${port}`)
})
