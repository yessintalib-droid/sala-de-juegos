import { ArrowLeft, Grid2X2, User } from 'lucide-react'
import { Chess } from 'chess.js'
import { useEffect, useRef, useState } from 'react'
import { Monopoly } from './Monopoly'

const SERVER_HOST = import.meta.env.VITE_SERVER_URL
const SERVER_HTTP = SERVER_HOST ? `https://${SERVER_HOST}` : 'http://localhost:8787'
const SERVER_WS = SERVER_HOST ? `wss://${SERVER_HOST}` : 'ws://localhost:8787'

const PROFILE_KEY = 'sala-de-juegos-profile-name'

const readProfileName = () => {
  try { return window.localStorage.getItem(PROFILE_KEY) ?? '' } catch { return '' }
}

const writeProfileName = (name: string) => {
  try { window.localStorage.setItem(PROFILE_KEY, name) } catch { /* almacenamiento no disponible */ }
}

function useProfileName() {
  const [name, setNameState] = useState(() => readProfileName())
  const setName = (value: string) => { writeProfileName(value.trim()); setNameState(value.trim()) }
  return { name, setName }
}

type ServerRoomPlayer = { id: string; name: string; connected: boolean }

type CulturinPhase = 'lobby' | 'playing' | 'winner' | 'exit'

type ServerCulturinState = {
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

type ServerRoom = { code: string; game: string; players: ServerRoomPlayer[]; state: ServerCulturinState }

type ServerEvent =
  | { type: 'room:state'; room: ServerRoom }
  | { type: 'room:error'; message: string }
  | { type: 'action:accepted' }

type Game = {
  name: string
  color: string
  accent: string
  symbol: string
}

const games: Game[] = [
  {
    name: 'Monopoly SVC',
    color: '#f6d45b',
    accent: '#332817',
    symbol: 'M',
  },
  {
    name: 'UNO',
    color: '#ef6a58',
    accent: '#fff7ec',
    symbol: 'UNO',
  },
  {
    name: 'Parchís',
    color: '#82c9bb',
    accent: '#173e3c',
    symbol: 'P',
  },
  {
    name: 'Hipster',
    color: '#f3a77f',
    accent: '#42231f',
    symbol: 'H',
  },
  {
    name: 'Mamania',
    color: '#d8a5e8',
    accent: '#36233d',
    symbol: 'M',
  },
  {
    name: 'Culturin',
    color: '#8bb6ed',
    accent: '#172d4c',
    symbol: 'C',
  },
  {
    name: 'Ajedrez',
    color: '#d9c7a7',
    accent: '#3f3227',
    symbol: '♞',
  },
  {
    name: 'Doble',
    color: '#f08d98',
    accent: '#48252d',
    symbol: '★',
  },
]

const culturinCategories = [
  { label: 'Nombre', color: '#087db8' },
  { label: 'Apellido', color: '#07968f' },
  { label: 'Ciudad / País', color: '#09b481' },
  { label: 'Animal', color: '#f7a400' },
  { label: 'Comida', color: '#ee5b08' },
  { label: 'Objeto', color: '#e83c8b' },
  { label: 'Marca / Color', color: '#8155e8' },
]

type CulturinUiStage = 'room' | 'code' | 'lobby'
type CulturinLocalStage = 'countdown' | 'playing' | 'results'

const chessFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const chessPieces: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚', P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔' }

type ChessStage = 'mode' | 'code' | 'game'

type ParchisStage = 'players' | 'mode' | 'code' | 'game'

const parchisColors = ['#e85b5b', '#4e83d4', '#efc347', '#54b88a', '#a568d7', '#eb8b43', '#4ca9b7', '#e16ba1', '#7e9d4e', '#d26b53', '#647bd0', '#b07b4d']

function ParchisGame({ onBack, playerName }: { onBack: () => void; playerName: string }) {
  const [stage, setStage] = useState<ParchisStage>('players')
  const [playerCount, setPlayerCount] = useState(4)
  const [mode, setMode] = useState<'local' | 'room'>('local')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [turn, setTurn] = useState(0)
  const [dice, setDice] = useState<number | null>(null)
  const [message, setMessage] = useState('Tira el dado para empezar')

  const createParchisRoom = () => { setMode('room'); setRoomCode(Math.random().toString(36).slice(2, 6).toUpperCase()); setStage('code') }
  const joinParchisRoom = () => { if (joinCode.trim().length === 4) { setMode('room'); setRoomCode(joinCode.trim().toUpperCase()); setStage('game') } }
  const rollDice = () => { const value = Math.floor(Math.random() * 6) + 1; setDice(value); setMessage(value === 6 ? '¡Has sacado un 6! Puedes sacar una ficha' : 'Elige una ficha para mover'); setTurn((current) => (current + 1) % playerCount) }

  if (stage !== 'game') return (
    <main className="parchis-page room-page">
      <header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><div className="culturin-title"><span>PARCHÍS</span><small>/ {playerCount} JUGADORES</small></div></header>
      <section className="room-panel parchis-room-panel">
        {stage === 'players' && <><p className="room-kicker">CONFIGURA LA PARTIDA</p><h1>¿Cuántos vais<br /><em>a jugar?</em></h1><div className="player-count-grid">{[4, 6, 8, 12].map((count) => <button className={playerCount === count ? 'player-count-option active' : 'player-count-option'} key={count} type="button" onClick={() => setPlayerCount(count)}><strong>{count}</strong><span>jugadores</span></button>)}</div><button className="primary-room-button" type="button" onClick={() => setStage('mode')}>Continuar</button></>}
        {stage === 'mode' && <><p className="room-kicker">PARCHÍS PARA {playerCount}</p><h2>Elige cómo jugar</h2><div className="parchis-mode-grid"><button type="button" onClick={() => { setMode('local'); setStage('game') }}><span>🎲</span><strong>En la misma pantalla</strong><small>Pasad el turno entre jugadores</small></button><button type="button" onClick={createParchisRoom}><span>👥</span><strong>Con código de sala</strong><small>Invita a jugadores desde otro dispositivo</small></button></div><div className="join-form"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={4} placeholder="Código" aria-label="Código de sala" /><button type="button" onClick={joinParchisRoom}>Unirse</button></div></>}
        {stage === 'code' && <div className="room-modal-content"><p className="room-kicker">SALA DE PARCHÍS</p><h2>Comparte este código</h2><div className="room-code">{roomCode}</div><p>La sala está preparada para {playerCount} jugadores.</p><button className="primary-room-button" type="button" onClick={() => setStage('game')}>Continuar</button></div>}
      </section>
    </main>
  )

  const boardSquares = Array.from({ length: 68 }, (_, index) => index)
  return <main className="parchis-page game-parchis-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Salir de la partida"><ArrowLeft size={20} /></button><div className="culturin-title"><span>PARCHÍS</span><small>/ {playerCount} JUGADORES</small></div><div className="parchis-status">Turno {turn + 1} · {message}</div></header><section className="parchis-layout"><div className="parchis-board"><div className="parchis-track">{boardSquares.map((square) => <button className="parchis-square" key={square} type="button" aria-label={`Casilla ${square + 1}`}><span>{square + 1}</span>{square < playerCount && <i style={{ backgroundColor: parchisColors[square] }} />}</button>)}<div className="parchis-centre"><strong>PARCHÍS</strong><small>Meta</small></div></div></div><aside className="parchis-side-panel"><p className="room-kicker">{mode === 'room' ? `SALA ${roomCode}` : 'PARTIDA LOCAL'}</p><h2>{playerName}</h2><div className="parchis-dice" aria-live="polite">{dice || '·'}</div><button className="roll-button" type="button" onClick={rollDice}>Tirar dado</button><div className="parchis-players">{Array.from({ length: playerCount }, (_, index) => <span key={index} style={{ borderColor: parchisColors[index], color: parchisColors[index] }}>Jugador {index + 1}</span>)}</div></aside></section></main>
}

function ChessGame({ onBack, playerName }: { onBack: () => void; playerName: string }) {
  const [stage, setStage] = useState<ChessStage>('mode')
  const [mode, setMode] = useState<'bot' | 'player'>('bot')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [game, setGame] = useState(() => new Chess())
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [message, setMessage] = useState('Tu turno: juegan las blancas')

  const getGameStatus = (currentGame: Chess) => {
    if (currentGame.isCheckmate()) return `Jaque mate: ganan las ${currentGame.turn() === 'w' ? 'negras' : 'blancas'}`
    if (currentGame.isStalemate()) return 'Tablas por ahogado'
    if (currentGame.isDraw()) return 'Tablas: partida terminada'
    if (currentGame.isCheck()) return `Jaque: turno de las ${currentGame.turn() === 'w' ? 'blancas' : 'negras'}`
    return `Partida en curso: turno de las ${currentGame.turn() === 'w' ? 'blancas' : 'negras'}`
  }

  const createChessRoom = () => { setMode('player'); setRoomCode(Math.random().toString(36).slice(2, 6).toUpperCase()); setStage('code') }
  const joinChessRoom = () => { if (joinCode.trim().length === 4) { setMode('player'); setRoomCode(joinCode.trim().toUpperCase()); setStage('game') } }
  const makeBotMove = (currentGame: Chess) => {
    const moves = currentGame.moves({ verbose: true })
    if (!moves.length) return
    const move = moves[Math.floor(Math.random() * moves.length)]
    currentGame.move({ from: move.from, to: move.to, promotion: 'q' })
    setGame(new Chess(currentGame.fen()))
    setMessage(getGameStatus(currentGame))
  }
  const selectSquare = (square: string) => {
    if (game.isGameOver() || (mode === 'bot' && game.turn() === 'b')) return
    if (!selectedSquare) {
      const piece = game.get(square as never)
      if (piece && piece.color === game.turn()) setSelectedSquare(square)
      return
    }
    try {
      const nextGame = new Chess(game.fen())
      nextGame.move({ from: selectedSquare, to: square, promotion: 'q' })
      setSelectedSquare(null)
      setGame(nextGame)
      if (nextGame.isGameOver()) { setMessage(getGameStatus(nextGame)) } else if (mode === 'bot') { setMessage('El bot está pensando...'); window.setTimeout(() => makeBotMove(nextGame), 450) } else { setMessage(getGameStatus(nextGame)) }
    } catch { setSelectedSquare(null) }
  }

  if (stage !== 'game') return (
    <main className="chess-page room-page">
      <header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><div className="culturin-title"><span>AJEDREZ</span><small>/ TABLERO</small></div></header>
      <section className="room-panel chess-room-panel">
        {stage === 'mode' && <><p className="room-kicker">ELIGE TU PARTIDA</p><h1>¿Contra quién<br /><em>quieres jugar?</em></h1><div className="chess-mode-grid"><button type="button" onClick={() => { setMode('bot'); setStage('game') }}><span>♞</span><strong>Contra el bot</strong><small>Una partida contra el ordenador</small></button><button type="button" onClick={createChessRoom}><span>♟♙</span><strong>Contra otra persona</strong><small>Crea una sala y comparte el código</small></button></div><div className="join-form chess-join"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={4} placeholder="Código de sala" aria-label="Código de sala" /><button type="button" onClick={joinChessRoom}>Unirse con código</button></div></>}
        {stage === 'code' && <div className="room-modal-content"><p className="room-kicker">SALA DE AJEDREZ</p><h2>Comparte este código</h2><div className="room-code">{roomCode}</div><p>Comparte el código con la otra persona para empezar.</p><button className="primary-room-button" type="button" onClick={() => setStage('game')}>Continuar</button></div>}
      </section>
    </main>
  )

  const board = game.board()
  return <main className="chess-page game-chess-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Salir de la partida"><ArrowLeft size={20} /></button><div className="culturin-title"><span>AJEDREZ</span><small>/ {mode === 'bot' ? 'BOT' : roomCode}</small></div><div className="chess-status">{message}</div></header><section className="chess-layout"><div className="chess-board" aria-label="Tablero de ajedrez">{board.map((row, rowIndex) => row.map((piece, columnIndex) => { const square = `${chessFiles[columnIndex]}${8 - rowIndex}`; const isSelected = selectedSquare === square; return <button className={`chess-square ${(rowIndex + columnIndex) % 2 === 0 ? 'light-square' : 'dark-square'} ${isSelected ? 'selected-square' : ''}`} key={square} type="button" onClick={() => selectSquare(square)} aria-label={`Casilla ${square}`}>{piece && <span className={piece.color === 'w' ? 'white-piece' : 'black-piece'}>{chessPieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}</span>}</button> }))}</div><aside className="chess-side-panel"><p className="room-kicker chess-state-label">{game.isGameOver() ? 'PARTIDA TERMINADA' : game.isCheck() ? 'JAQUE' : 'PARTIDA EN CURSO'}</p><h2>{playerName || 'Jugador'}</h2><span className="chess-vs">{mode === 'bot' ? 'contra el bot' : `sala ${roomCode}`}</span><div className="chess-turn">{game.turn() === 'w' ? '♙' : '♟'} {game.turn() === 'w' ? 'Blancas' : 'Negras'}</div><p className="chess-message">{message}</p><button className="secondary-chess-button" type="button" onClick={() => { setGame(new Chess()); setSelectedSquare(null); setMessage('Partida en curso: turno de las blancas') }}>Reiniciar partida</button></aside></section></main>
}

function Culturin({ onBack, playerName }: { onBack: () => void; playerName: string }) {
  const [uiStage, setUiStage] = useState<CulturinUiStage>('room')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [selfId, setSelfId] = useState('')
  const [room, setRoom] = useState<ServerRoom | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const roundKeyRef = useRef<string | null>(null)

  const [localStage, setLocalStage] = useState<CulturinLocalStage>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [answers, setAnswers] = useState<string[]>(Array(culturinCategories.length).fill(''))
  const [finished, setFinished] = useState<boolean[]>(Array(culturinCategories.length).fill(false))
  const [scores, setScores] = useState<number[]>(Array(culturinCategories.length).fill(0))
  const [scoreSelected, setScoreSelected] = useState<boolean[]>(Array(culturinCategories.length).fill(false))
  const [finishedFirst, setFinishedFirst] = useState(false)
  const [roundHistory, setRoundHistory] = useState<{ round: number; letter: string; answers: string[]; scores: number[]; total: number }[]>([])
  const [readySent, setReadySent] = useState(false)
  const [rematchVoted, setRematchVoted] = useState(false)

  useEffect(() => {
    if (!room || !selfId) return
    const socket = new WebSocket(`${SERVER_WS}/ws?room=${room.code}&playerId=${selfId}`)
    wsRef.current = socket
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as ServerEvent
        if (data.type === 'room:state') setRoom(data.room)
      } catch { /* mensaje ignorado */ }
    }
    return () => socket.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, selfId])

  const sendAction = (action: { type: string; payload?: Record<string, unknown> }) => {
    const socket = wsRef.current
    if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(action))
  }

  const phase = room?.state.phase ?? null
  const round = room?.state.round ?? null

  useEffect(() => {
    if (!phase) return
    const key = `${phase}:${round}`
    if (key === roundKeyRef.current) return
    if (phase === 'playing' && localStage === 'results') return
    roundKeyRef.current = key
    if (phase === 'playing') {
      setAnswers(Array(culturinCategories.length).fill(''))
      setFinished(Array(culturinCategories.length).fill(false))
      setScores(Array(culturinCategories.length).fill(0))
      setScoreSelected(Array(culturinCategories.length).fill(false))
      setFinishedFirst(false)
      setCountdown(3)
      setLocalStage('countdown')
    }
    if (phase === 'lobby') setReadySent(false)
    if (phase === 'winner') setRematchVoted(false)
    if (phase === 'exit') { wsRef.current?.close(); onBack() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round, localStage])

  useEffect(() => {
    if (localStage !== 'countdown' || phase !== 'playing') return
    if (countdown === 0) { setLocalStage('playing'); return }
    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, localStage, phase])

  const stopped = room?.state.stopped ?? false
  const prevStoppedRef = useRef(false)
  useEffect(() => {
    if (stopped && !prevStoppedRef.current && phase === 'playing' && localStage === 'playing') {
      setFinishedFirst(false)
      setLocalStage('results')
    }
    prevStoppedRef.current = stopped
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped, phase])

  const createRoom = async () => {
    setError('')
    try {
      const response = await fetch(`${SERVER_HTTP}/api/rooms`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ game: 'culturin', name: playerName }),
      })
      if (!response.ok) throw new Error()
      const data = await response.json() as { room: ServerRoom; player: ServerRoomPlayer }
      setSelfId(data.player.id)
      setRoom(data.room)
      setUiStage('code')
    } catch { setError('No se pudo crear la sala. Comprueba tu conexión.') }
  }

  const joinRoom = async () => {
    if (joinCode.trim().length < 4) return
    setError('')
    try {
      const response = await fetch(`${SERVER_HTTP}/api/rooms/join`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase(), game: 'culturin', name: playerName }),
      })
      if (!response.ok) throw new Error()
      const data = await response.json() as { room: ServerRoom; player: ServerRoomPlayer }
      setSelfId(data.player.id)
      setRoom(data.room)
      setUiStage('lobby')
    } catch { setError('No se pudo unir a esa sala. Comprueba el código.') }
  }

  const sendReady = () => { setReadySent(true); sendAction({ type: 'ready' }) }

  const updateAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? value : answer))
    setFinished((current) => current.map((done, answerIndex) => answerIndex === index ? false : done))
  }

  const markNoAnswer = (index: number) => {
    setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? '—' : answer))
    setFinished((current) => current.map((done, answerIndex) => answerIndex === index ? true : done))
  }

  const canFinish = answers.every((answer, index) => answer.trim() || finished[index])
  const finishRound = () => { if (canFinish) { setFinishedFirst(true); setLocalStage('results'); sendAction({ type: 'round:stop' }) } }
  const setScore = (index: number, score: number) => {
    setScores((current) => current.map((value, scoreIndex) => scoreIndex === index ? score : value))
    setScoreSelected((current) => current.map((selected, scoreIndex) => scoreIndex === index ? true : selected))
  }
  const total = scores.reduce((sum, score) => sum + score, 0)
  const bonus = finishedFirst && scores.every((score) => score === 10) ? 10 : 0

  const submitRound = () => {
    if (!scoreSelected.every(Boolean) || !room) return
    setRoundHistory((current) => [...current, { round: room.state.round, letter: room.state.letter, answers: [...answers], scores: [...scores], total: total + bonus }])
    sendAction({ type: 'round:submit', payload: { total: total + bonus } })
    setAnswers(Array(culturinCategories.length).fill(''))
    setFinished(Array(culturinCategories.length).fill(false))
    setScores(Array(culturinCategories.length).fill(0))
    setScoreSelected(Array(culturinCategories.length).fill(false))
    setFinishedFirst(false)
    setCountdown(3)
    setLocalStage('countdown')
  }

  const voteRematch = (accept: boolean) => { setRematchVoted(true); sendAction({ type: 'rematch:vote', payload: { accept } }) }

  if (!room || uiStage === 'room' || uiStage === 'code') {
    return (
      <main className="culturin-page room-page">
        <header className="culturin-header">
          <button className="back-button" type="button" onClick={onBack} aria-label="Volver a la sala de juegos"><ArrowLeft size={20} /></button>
          <div className="culturin-title"><span>CULTURÍN</span><small>/ TUTIFRUTI</small></div>
        </header>
        <section className="room-panel">
          {uiStage === 'room' && <>
            <p className="room-kicker">NUEVA PARTIDA</p><h1>Crea una sala<br /><em>y juega en equipo.</em></h1>
            <p className="room-intro">Comparte el código con tu grupo. La partida empezará con la misma letra para todos.</p>
            <div className="room-actions"><button className="primary-room-button" type="button" onClick={createRoom}>Crear sala</button><div className="join-form"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={6} placeholder="Código" aria-label="Código de sala" /><button type="button" onClick={joinRoom}>Unirse mediante código</button></div></div>
            {error && <p className="room-error">{error}</p>}
          </>}
          {uiStage === 'code' && room && <div className="room-modal-content"><p className="room-kicker">SALA CREADA</p><h2>Comparte este código</h2><div className="room-code">{room.code}</div><p>Cuando todos se hayan unido, entra en la sala de espera.</p><button className="primary-room-button" type="button" onClick={() => setUiStage('lobby')}>Entrar en la sala</button></div>}
        </section>
      </main>
    )
  }

  if (phase === 'lobby') {
    const readyIds = room.state.ready
    const connectedPlayers = room.players.filter((candidate) => candidate.connected)
    const notReadyCount = connectedPlayers.filter((candidate) => !readyIds.includes(candidate.id)).length
    return (
      <main className="culturin-page room-page">
        <header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver a la sala de juegos"><ArrowLeft size={20} /></button><div className="culturin-title"><span>CULTURÍN</span><small>/ TUTIFRUTI</small></div></header>
        <section className="room-panel">
          <div className="room-modal-content">
            <p className="room-kicker">SALA {room.code}</p>
            <h2>Jugadores en la sala</h2>
            <div className="player-list">
              {room.players.map((candidate) => (
                <span key={candidate.id} className={`player-chip ${readyIds.includes(candidate.id) ? 'is-ready' : ''} ${candidate.connected ? '' : 'is-offline'}`}>
                  <span className="ready-dot" />{candidate.name}{candidate.id === selfId && <b>tú</b>}
                </span>
              ))}
            </div>
            {readySent
              ? <p className="waiting-note">{notReadyCount > 0 ? `Esperando a ${notReadyCount} jugador${notReadyCount === 1 ? '' : 'es'} más...` : 'Todos listos, empezando...'}</p>
              : <p className="room-intro">Cuando todos pulséis Listo, empezará la misma partida para todos.</p>}
            <button className="primary-room-button" type="button" onClick={sendReady} disabled={readySent}>{readySent ? 'Esperando...' : 'Listo para jugar'}</button>
          </div>
        </section>
      </main>
    )
  }

  if (phase === 'playing' && localStage === 'countdown') {
    return <main className="culturin-page countdown-page"><p>PREPARADOS</p><strong>{countdown || 'YA'}</strong><span>La letra aparece en un momento</span></main>
  }

  if (phase === 'playing' && localStage === 'results') {
    const letter = room.state.letter
    return <main className="culturin-page results-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><div className="culturin-title"><span>REVISA LAS RESPUESTAS</span><small>/ {playerName}</small></div></header><div className="result-letter">Letra de la ronda <strong>{letter}</strong></div><section className="answer-results answer-table-wrap"><div className="answer-table answer-table-head"><span>CATEGORÍA</span><span>{playerName || 'TÚ'}</span><span>PUNTOS</span></div>{culturinCategories.map((category, index) => <div className="answer-table answer-table-row" key={category.label}><span className="answer-category" style={{ backgroundColor: category.color }}>{category.label}</span><strong>{answers[index] || 'Sin respuesta'}</strong><div className="score-actions"><button className={scoreSelected[index] && scores[index] === 10 ? 'score-active' : ''} onClick={() => setScore(index, 10)}>Único<br /><b>10</b></button><button className={scoreSelected[index] && scores[index] === 5 ? 'score-active' : ''} onClick={() => setScore(index, 5)}>Repetido<br /><b>5</b></button><button className={scoreSelected[index] && scores[index] === 0 ? 'score-active' : ''} onClick={() => setScore(index, 0)}>Fallo<br /><b>0</b></button></div></div>)}</section><button className="continue-button" type="button" onClick={submitRound} disabled={!scoreSelected.every(Boolean)}>Continuar</button></main>
  }

  if (phase === 'winner') {
    const rankingRows = room.players.map((candidate) => ({ id: candidate.id, name: candidate.name, points: room.state.totals[candidate.id] ?? 0 })).sort((a, b) => b.points - a.points)
    const winner = rankingRows[0]
    const rematchIds = room.state.rematch
    const notVotedCount = room.players.filter((candidate) => candidate.connected && !rematchIds.includes(candidate.id)).length
    return <main className="culturin-page winner-page"><p className="room-kicker">FIN DE LA PARTIDA</p><h1>¡{winner?.name ?? 'Alguien'} ha ganado!</h1><div className="winner-score">{winner?.points ?? 0}<span> puntos</span></div><section className="player-list">{rankingRows.map((row, index) => <span key={row.id} className="player-chip">#{index + 1} {row.name}: <b>{row.points}</b></span>)}</section>{rematchVoted ? <p className="waiting-note">{notVotedCount > 0 ? `Esperando a ${notVotedCount} jugador${notVotedCount === 1 ? '' : 'es'} más para la revancha...` : 'Todos listos, empezando revancha...'}</p> : <div className="rematch-actions"><button className="primary-room-button" type="button" onClick={() => voteRematch(true)}>Revancha</button><button className="secondary-exit-button" type="button" onClick={() => voteRematch(false)}>Salir</button></div>}</main>
  }

  const letter = room.state.letter
  const historicalRows = roundHistory.map((round) => round)
  return (
    <main className="culturin-page">
      <header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver a la sala de juegos"><ArrowLeft size={20} /></button><div className="culturin-title"><span>CULTURÍN</span><small>/ {playerName}</small></div><div className="culturin-meta"><span>SALA {room.code}</span><strong>LETRA: {letter}</strong><strong>RONDA: {room.state.round}/5</strong></div></header>
      <section className="culturin-board active-board" aria-label="Tabla de Culturín"><div className="culturin-row culturin-head"><div className="letter-head">LETRA</div>{culturinCategories.map((category) => <div key={category.label} style={{ backgroundColor: category.color }}>{category.label}</div>)}<div className="points-head">PUNTOS</div></div>{historicalRows.map((round) => <div className="culturin-row history-row" key={`${round.round}-${round.letter}`}><div className="letter-cell"><strong>{round.letter}</strong></div>{round.answers.map((answer, index) => <div className="answer-cell history-answer" key={culturinCategories[index].label}>{answer || '—'}</div>)}<div className="points-cell"><strong>{round.total}</strong></div></div>)}<div className="culturin-row active-answer-row"><div className="letter-cell"><strong>{letter}</strong></div>{answers.map((answer, index) => <div className="answer-cell answer-editor" key={culturinCategories[index].label}><input value={answer === '—' ? '' : answer} onChange={(event) => updateAnswer(index, event.target.value)} aria-label={culturinCategories[index].label} placeholder={culturinCategories[index].label} /><button type="button" onClick={() => markNoAnswer(index)} title="Marcar sin solución">—</button></div>)}<div className="points-cell">—</div></div></section>
      <div className="finish-area"><p>{canFinish ? 'Todas las casillas están preparadas.' : 'Completa todas las casillas o marca — si no encuentras una solución.'}</p><button className="finish-button" type="button" onClick={finishRound} disabled={!canFinish}>He acabado</button></div>
    </main>
  )
}

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const { name: playerName, setName: setPlayerName } = useProfileName()
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState(playerName)

  const needsProfile = !playerName.trim()

  const saveProfile = () => {
    if (!profileDraft.trim()) return
    setPlayerName(profileDraft)
    setEditingProfile(false)
  }

  if (needsProfile || editingProfile) {
    return (
      <main className="culturin-page profile-gate-page">
        <div className="room-modal-content">
          <p className="room-kicker">TU PERFIL</p>
          <h2>¿Cómo te llamas?</h2>
          <p>Este nombre se usará en todos los juegos y modos de partida.</p>
          <input className="large-room-input" value={profileDraft} onChange={(event) => setProfileDraft(event.target.value)} placeholder="Tu nombre" autoFocus />
          <button className="primary-room-button" type="button" onClick={saveProfile} disabled={!profileDraft.trim()}>Guardar y continuar</button>
          {!needsProfile && <button className="secondary-exit-button" type="button" onClick={() => { setProfileDraft(playerName); setEditingProfile(false) }} style={{ marginTop: 12 }}>Cancelar</button>}
        </div>
      </main>
    )
  }

  if (activeGame === 'Culturin') {
    return <Culturin onBack={() => setActiveGame(null)} playerName={playerName} />
  }

  if (activeGame === 'Ajedrez') {
    return <ChessGame onBack={() => setActiveGame(null)} playerName={playerName} />
  }

  if (activeGame === 'Parchís') {
    return <ParchisGame onBack={() => setActiveGame(null)} playerName={playerName} />
  }

  if (activeGame === 'Monopoly SVC') {
    return <Monopoly onBack={() => setActiveGame(null)} />
  }

  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Navegación principal">
        <a className="brand" href="#inicio" aria-label="Sala de Juegos, inicio">
          <span className="brand-mark"><Grid2X2 size={19} strokeWidth={2.7} /></span>
          <span>SALA<span className="brand-dot">.</span>JUEGOS</span>
        </a>
        <div className="topbar-actions">
          <button className="profile-button" type="button" onClick={() => { setProfileDraft(playerName); setEditingProfile(true) }}>
            <span className="avatar"><User size={15} /></span>{playerName}
          </button>
        </div>
      </nav>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <h1>¿A qué<br /><em>jugamos</em> hoy?</h1>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-shape" />
          <div className="hero-card hero-card-back">♞</div>
          <div className="hero-card hero-card-front"><span>?</span><small>JUEGA<br />SIN<br />LÍMITES</small></div>
          <div className="floating-die">6</div>
          <div className="floating-token">✦</div>
        </div>
      </section>

      <section className="games-section" aria-labelledby="games-title">
        <div className="section-heading"><div><p className="section-kicker">LA COLECCIÓN</p><h2 id="games-title">Elige tu juego</h2></div></div>
        <div className="game-grid">
          {games.map((game, index) => (
            <button className="game-tile" key={game.name} type="button" onClick={() => setActiveGame(game.name)} style={{ '--tile-color': game.color, '--tile-accent': game.accent } as React.CSSProperties}>
              <div className={`game-symbol symbol-${index}`}><span>{game.symbol}</span></div>
              <h3>{game.name}</h3>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
