import { randomBytes, randomUUID } from 'node:crypto'
import type { Room, RoomPlayer } from './types'

const rooms = new Map<string, Room>()

const createRoomCode = () => {
  let code = ''
  do {
    code = randomBytes(3).toString('hex').toUpperCase()
  } while (rooms.has(code))
  return code
}

export const createRoom = (game: Room['game'], playerName: string) => {
  const player: RoomPlayer = {
    id: randomUUID(),
    name: playerName,
    connected: true,
  }
  const room: Room = {
    code: createRoomCode(),
    game,
    createdAt: new Date().toISOString(),
    players: [player],
    state: {
      phase: 'lobby',
      version: 0,
    },
  }
  rooms.set(room.code, room)
  return { room, player }
}

export const joinRoom = (code: string, playerName: string) => {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null

  const player: RoomPlayer = {
    id: randomUUID(),
    name: playerName,
    connected: true,
  }
  room.players.push(player)
  return { room, player }
}

export const getRoom = (code: string) => rooms.get(code.toUpperCase())

export const setPlayerConnection = (code: string, playerId: string, connected: boolean) => {
  const room = getRoom(code)
  const player = room?.players.find((candidate) => candidate.id === playerId)
  if (player) player.connected = connected
  return room
}

export const bumpRoomVersion = (room: Room) => {
  const version = Number(room.state.version ?? 0) + 1
  room.state = { ...room.state, version }
}
