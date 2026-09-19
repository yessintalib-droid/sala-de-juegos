import { createServer } from 'node:http'
import { parse } from 'node:url'
import { WebSocketServer, type WebSocket } from 'ws'
import { bumpRoomVersion, createRoom, getRoom, joinRoom, setPlayerConnection } from './store.js'
import type { ClientAction, CulturinState, GameType, Room, RoomPlayer, ServerEvent } from './types.js'

const culturinLetters = ['A', 'C', 'D', 'L', 'M', 'P', 'S', 'T']
const pickLetter = () => culturinLetters[Math.floor(Math.random() * culturinLetters.length)]

const connectedIdsOf = (room: Room) => room.players.filter((player: RoomPlayer) => player.connected).map((player: RoomPlayer) => player.id)

const applyCulturinAction = (room: Room, playerId: string, action: ClientAction) => {
  const state = room.state as CulturinState
  const connectedIds = connectedIdsOf(room)

  if (action.type === 'ready') {
    if (state.phase !== 'lobby') return
    if (!state.ready.includes(playerId)) state.ready.push(playerId)
    const allReady = connectedIds.length > 0 && connectedIds.every((id) => state.ready.includes(id))
    if (!allReady) return
    state.round = 1
    state.letter = pickLetter()
    state.phase = 'playing'
    state.stopped = false
    state.stoppedBy = null
    state.roundAdvanced = false
    state.ready = []
    return
  }

  if (action.type === 'round:stop') {
    if (state.phase !== 'playing' || state.stopped) return
    state.stopped = true
    state.stoppedBy = playerId
    return
  }

  if (action.type === 'round:submit') {
    if (state.phase !== 'playing') return
    const total = Number((action.payload as { total?: number } | undefined)?.total ?? 0)
    state.totals[playerId] = (state.totals[playerId] ?? 0) + total
    if (state.roundAdvanced) return
    state.roundAdvanced = true
    if (state.round >= 5) {
      state.phase = 'winner'
    } else {
      state.round += 1
      state.letter = pickLetter()
      state.stopped = false
      state.stoppedBy = null
      state.roundAdvanced = false
    }
    return
  }

  if (action.type === 'rematch:vote') {
    const accept = Boolean((action.payload as { accept?: boolean } | undefined)?.accept)
    if (!accept) {
      state.phase = 'exit'
      return
    }
    if (!state.rematch.includes(playerId)) state.rematch.push(playerId)
    if (!connectedIds.every((id) => state.rematch.includes(id))) return
    state.phase = 'lobby'
    state.round = 1
    state.letter = ''
    state.ready = []
    state.roundAdvanced = false
    state.rematch = []
    state.stopped = false
    state.stoppedBy = null
    state.totals = Object.fromEntries(connectedIds.map((id) => [id, 0]))
  }
}

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
        const payload = JSON.parse(body) as { code?: string; game?: GameType; name?: string }
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
  if (!room || !room.players.some((player: RoomPlayer) => player.id === url.query.playerId)) {
    socket.destroy()
    return
  }

  websocketServer.handleUpgrade(request, socket, head, (client) => {
    websocketServer.emit('connection', client, request, room.code, url.query.playerId as string)
  })
})

websocketServer.on('connection', (socket: WebSocket, _request: import('node:http').IncomingMessage, roomCode: string, playerId: string) => {
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
      const currentRoom = getRoom(roomCode)
      if (!currentRoom) return
      if (currentRoom.game === 'culturin') {
        applyCulturinAction(currentRoom, playerId, action)
      }
      bumpRoomVersion(currentRoom)
      broadcastRoom(currentRoom)
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
