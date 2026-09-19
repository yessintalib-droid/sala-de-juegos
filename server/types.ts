export type GameType = 'monopoly'

export type RoomPlayer = {
  id: string
  name: string
  connected: boolean
}

export type Room = {
  code: string
  game: GameType
  createdAt: string
  players: RoomPlayer[]
  state: Record<string, unknown>
}

export type ClientAction = {
  type: string
  payload?: Record<string, unknown>
}

export type ServerEvent =
  | { type: 'room:state'; room: Room }
  | { type: 'room:error'; message: string }
  | { type: 'action:accepted'; action: ClientAction; playerId: string }
