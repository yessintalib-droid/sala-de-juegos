import { randomBytes, randomUUID } from 'node:crypto'
import type { CulturinState, Room, RoomPlayer } from './types.js'

const rooms = new Map<string, Room>()

const createRoomCode = () => {
  let code = ''
  do {
    code = randomBytes(3).toString('hex').toUpperCase()
  } while (rooms.has(code))
  return code
}

const createInitialState = (game: Room['game'], firstPlayerId: string): Room['state'] => {
  if (game === 'culturin') {
    const state: CulturinState = {
      version: 0,
      phase: 'lobby',
      round: 1,
      letter: '',
      ready: [],
      roundReported: [],
      totals: { [firstPlayerId]: 0 },
      rematch: [],
    }
    return state
  }
  return { phase: 'lobby', version: 0 }
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
    state: createInitialState(game, player.id),
  }
  rooms.set(room.code, room)
  return { room, player }
}

export const joinRoom = (code: string, playerName: string) => {
  const room = rooms.get(code.toUpperCase())
  if (!room) return null

  if (room.game === 'culturin' && (room.state as CulturinState).phase !== 'lobby') {
    return null
  }

  const player: RoomPlayer = {
    id: randomUUID(),
    name: playerName,
    connected: true,
  }
  room.players.push(player)
  if (room.game === 'culturin') {
    (room.state as CulturinState).totals[player.id] = 0
  }
  return { room, player }
}

export const getRoom = (code: string) => rooms.get(code.toUpperCase())

export const setPlayerConnection = (code: string, playerId: string, connected: boolean) => {
  const room = getRoom(code)
  const player = room?.players.find((candidate: RoomPlayer) => candidate.id === playerId)
  if (player) player.connected = connected
  return room
}

export const bumpRoomVersion = (room: Room) => {
  const version = Number(room.state.version ?? 0) + 1
  room.state = { ...room.state, version }
}
