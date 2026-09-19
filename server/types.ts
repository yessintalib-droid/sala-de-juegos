export type GameType = 'monopoly' | 'culturin'

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

export type CulturinPhase = 'lobby' | 'playing' | 'winner' | 'exit'

export type CulturinState = {
  version: number
  phase: CulturinPhase
  round: number
  letter: string
  ready: string[]
  roundAdvanced: boolean
  totals: Record<string, number>
  rematch: string[]
  stopped: boolean
  stoppedBy: string | null
}

export type ClientAction =
  | { type: 'ready' }
  | { type: 'round:stop' }
  | { type: 'round:submit'; payload: { total: number } }
  | { type: 'rematch:vote'; payload: { accept: boolean } }
  | { type: string; payload?: Record<string, unknown> }

export type ServerEvent =
  | { type: 'room:state'; room: Room }
  | { type: 'room:error'; message: string }
  | { type: 'action:accepted'; action: ClientAction; playerId: string }
