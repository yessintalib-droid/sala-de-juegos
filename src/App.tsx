import { ArrowLeft, Grid2X2 } from 'lucide-react'
import { Chess } from 'chess.js'
import { useEffect, useState } from 'react'
import { Monopoly } from './Monopoly'

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

type CulturinStage = 'room' | 'code' | 'name' | 'waiting' | 'countdown' | 'playing' | 'results' | 'summary' | 'winner'

type CulturinRound = {
  letter: string
  answers: string[]
  scores: number[]
  total: number
  bonus: number
}

const lettersPool = ['A', 'C', 'D', 'L', 'M', 'P', 'S', 'T']

const chessFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const chessPieces: Record<string, string> = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚', P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔' }

type ChessStage = 'mode' | 'code' | 'name' | 'game'

type ParchisStage = 'players' | 'mode' | 'code' | 'name' | 'game'

const parchisColors = ['#e85b5b', '#4e83d4', '#efc347', '#54b88a', '#a568d7', '#eb8b43', '#4ca9b7', '#e16ba1', '#7e9d4e', '#d26b53', '#647bd0', '#b07b4d']

function ParchisGame({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<ParchisStage>('players')
  const [playerCount, setPlayerCount] = useState(4)
  const [mode, setMode] = useState<'local' | 'room'>('local')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [player, setPlayer] = useState('')
  const [turn, setTurn] = useState(0)
  const [dice, setDice] = useState<number | null>(null)
  const [message, setMessage] = useState('Tira el dado para empezar')

  const createParchisRoom = () => { setMode('room'); setRoomCode(Math.random().toString(36).slice(2, 6).toUpperCase()); setStage('code') }
  const joinParchisRoom = () => { if (joinCode.trim().length === 4) { setMode('room'); setRoomCode(joinCode.trim().toUpperCase()); setStage('name') } }
  const beginParchis = () => { if (player.trim()) setStage('game') }
  const rollDice = () => { const value = Math.floor(Math.random() * 6) + 1; setDice(value); setMessage(value === 6 ? '¡Has sacado un 6! Puedes sacar una ficha' : 'Elige una ficha para mover'); setTurn((current) => (current + 1) % playerCount) }

  if (stage !== 'game') return (
    <main className="parchis-page room-page">
      <header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><div className="culturin-title"><span>PARCHÍS</span><small>/ {playerCount} JUGADORES</small></div></header>
      <section className="room-panel parchis-room-panel">
        {stage === 'players' && <><p className="room-kicker">CONFIGURA LA PARTIDA</p><h1>¿Cuántos vais<br /><em>a jugar?</em></h1><div className="player-count-grid">{[4, 6, 8, 12].map((count) => <button className={playerCount === count ? 'player-count-option active' : 'player-count-option'} key={count} type="button" onClick={() => setPlayerCount(count)}><strong>{count}</strong><span>jugadores</span></button>)}</div><button className="primary-room-button" type="button" onClick={() => setStage('mode')}>Continuar</button></>}
        {stage === 'mode' && <><p className="room-kicker">PARCHÍS PARA {playerCount}</p><h2>Elige cómo jugar</h2><div className="parchis-mode-grid"><button type="button" onClick={() => { setMode('local'); setStage('name') }}><span>🎲</span><strong>En la misma pantalla</strong><small>Pasad el turno entre jugadores</small></button><button type="button" onClick={createParchisRoom}><span>👥</span><strong>Con código de sala</strong><small>Invita a jugadores desde otro dispositivo</small></button></div><div className="join-form"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={4} placeholder="Código" aria-label="Código de sala" /><button type="button" onClick={joinParchisRoom}>Unirse</button></div></>}
        {stage === 'code' && <div className="room-modal-content"><p className="room-kicker">SALA DE PARCHÍS</p><h2>Comparte este código</h2><div className="room-code">{roomCode}</div><p>La sala está preparada para {playerCount} jugadores.</p><button className="primary-room-button" type="button" onClick={() => setStage('name')}>Continuar</button></div>}
        {stage === 'name' && <div className="room-modal-content"><p className="room-kicker">{mode === 'local' ? `PARTIDA LOCAL · ${playerCount}` : `SALA ${roomCode}`}</p><h2>¿Quién eres?</h2><input className="large-room-input" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="Nombre del jugador" autoFocus /><button className="primary-room-button" type="button" onClick={beginParchis} disabled={!player.trim()}>Empezar partida</button></div>}
      </section>
    </main>
  )

  const boardSquares = Array.from({ length: 68 }, (_, index) => index)
  return <main className="parchis-page game-parchis-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Salir de la partida"><ArrowLeft size={20} /></button><div className="culturin-title"><span>PARCHÍS</span><small>/ {playerCount} JUGADORES</small></div><div className="parchis-status">Turno {turn + 1} · {message}</div></header><section className="parchis-layout"><div className="parchis-board"><div className="parchis-track">{boardSquares.map((square) => <button className="parchis-square" key={square} type="button" aria-label={`Casilla ${square + 1}`}><span>{square + 1}</span>{square < playerCount && <i style={{ backgroundColor: parchisColors[square] }} />}</button>)}<div className="parchis-centre"><strong>PARCHÍS</strong><small>Meta</small></div></div></div><aside className="parchis-side-panel"><p className="room-kicker">{mode === 'room' ? `SALA ${roomCode}` : 'PARTIDA LOCAL'}</p><h2>{player}</h2><div className="parchis-dice" aria-live="polite">{dice || '·'}</div><button className="roll-button" type="button" onClick={rollDice}>Tirar dado</button><div className="parchis-players">{Array.from({ length: playerCount }, (_, index) => <span key={index} style={{ borderColor: parchisColors[index], color: parchisColors[index] }}>Jugador {index + 1}</span>)}</div></aside></section></main>
}

function ChessGame({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<ChessStage>('mode')
  const [mode, setMode] = useState<'bot' | 'player'>('bot')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [player, setPlayer] = useState('')
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
  const joinChessRoom = () => { if (joinCode.trim().length === 4) { setMode('player'); setRoomCode(joinCode.trim().toUpperCase()); setStage('name') } }
  const startChess = () => { if (player.trim()) setStage('game') }
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
        {stage === 'mode' && <><p className="room-kicker">ELIGE TU PARTIDA</p><h1>¿Contra quién<br /><em>quieres jugar?</em></h1><div className="chess-mode-grid"><button type="button" onClick={() => { setMode('bot'); setStage('name') }}><span>♞</span><strong>Contra el bot</strong><small>Una partida contra el ordenador</small></button><button type="button" onClick={createChessRoom}><span>♟♙</span><strong>Contra otra persona</strong><small>Crea una sala y comparte el código</small></button></div><div className="join-form chess-join"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={4} placeholder="Código de sala" aria-label="Código de sala" /><button type="button" onClick={joinChessRoom}>Unirse con código</button></div></>}
        {stage === 'code' && <div className="room-modal-content"><p className="room-kicker">SALA DE AJEDREZ</p><h2>Comparte este código</h2><div className="room-code">{roomCode}</div><p>Comparte el código con la otra persona y después escribe tu nombre.</p><button className="primary-room-button" type="button" onClick={() => setStage('name')}>Continuar</button></div>}
        {stage === 'name' && <div className="room-modal-content"><p className="room-kicker">{mode === 'bot' ? 'PARTIDA CONTRA BOT' : `SALA ${roomCode}`}</p><h2>¿Cómo te llamas?</h2><input className="large-room-input" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="Tu nombre" autoFocus /><button className="primary-room-button" type="button" onClick={startChess} disabled={!player.trim()}>Empezar partida</button></div>}
      </section>
    </main>
  )

  const board = game.board()
  return <main className="chess-page game-chess-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Salir de la partida"><ArrowLeft size={20} /></button><div className="culturin-title"><span>AJEDREZ</span><small>/ {mode === 'bot' ? 'BOT' : roomCode}</small></div><div className="chess-status">{message}</div></header><section className="chess-layout"><div className="chess-board" aria-label="Tablero de ajedrez">{board.map((row, rowIndex) => row.map((piece, columnIndex) => { const square = `${chessFiles[columnIndex]}${8 - rowIndex}`; const isSelected = selectedSquare === square; return <button className={`chess-square ${(rowIndex + columnIndex) % 2 === 0 ? 'light-square' : 'dark-square'} ${isSelected ? 'selected-square' : ''}`} key={square} type="button" onClick={() => selectSquare(square)} aria-label={`Casilla ${square}`}>{piece && <span className={piece.color === 'w' ? 'white-piece' : 'black-piece'}>{chessPieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}</span>}</button> }))}</div><aside className="chess-side-panel"><p className="room-kicker chess-state-label">{game.isGameOver() ? 'PARTIDA TERMINADA' : game.isCheck() ? 'JAQUE' : 'PARTIDA EN CURSO'}</p><h2>{player || 'Jugador'}</h2><span className="chess-vs">{mode === 'bot' ? 'contra el bot' : `sala ${roomCode}`}</span><div className="chess-turn">{game.turn() === 'w' ? '♙' : '♟'} {game.turn() === 'w' ? 'Blancas' : 'Negras'}</div><p className="chess-message">{message}</p><button className="secondary-chess-button" type="button" onClick={() => { setGame(new Chess()); setSelectedSquare(null); setMessage('Partida en curso: turno de las blancas') }}>Reiniciar partida</button></aside></section></main>
}

function Culturin({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<CulturinStage>('room')
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [player, setPlayer] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [letter, setLetter] = useState('')
  const [answers, setAnswers] = useState<string[]>(Array(culturinCategories.length).fill(''))
  const [finished, setFinished] = useState<boolean[]>(Array(culturinCategories.length).fill(false))
  const [scores, setScores] = useState<number[]>(Array(culturinCategories.length).fill(0))
  const [scoreSelected, setScoreSelected] = useState<boolean[]>(Array(culturinCategories.length).fill(false))
  const [roundNumber, setRoundNumber] = useState(1)
  const [roundHistory, setRoundHistory] = useState<CulturinRound[]>([])
  const [finishedFirst, setFinishedFirst] = useState(false)

  useEffect(() => {
    if (stage !== 'countdown') return
    if (countdown === 0) {
      setLetter(lettersPool[Math.floor(Math.random() * lettersPool.length)])
      setStage('playing')
      return
    }
    const timer = window.setTimeout(() => setCountdown((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown, stage])

  const createRoom = () => {
    setRoomCode(Math.random().toString(36).slice(2, 6).toUpperCase())
    setStage('code')
  }

  const joinRoom = () => {
    if (joinCode.trim().length < 4) return
    setRoomCode(joinCode.trim().toUpperCase())
    setStage('name')
  }

  const startNameStep = () => setStage('name')
  const enterRoom = () => { if (player.trim()) setStage('waiting') }
  const beginRound = () => {
    setAnswers(Array(culturinCategories.length).fill(''))
    setFinished(Array(culturinCategories.length).fill(false))
    setScores(Array(culturinCategories.length).fill(0))
    setScoreSelected(Array(culturinCategories.length).fill(false))
    setCountdown(3)
    setStage('countdown')
  }

  const updateAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? value : answer))
    setFinished((current) => current.map((done, answerIndex) => answerIndex === index ? false : done))
  }

  const markNoAnswer = (index: number) => {
    setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? '—' : answer))
    setFinished((current) => current.map((done, answerIndex) => answerIndex === index ? true : done))
  }

  const canFinish = answers.every((answer, index) => answer.trim() || finished[index])
  const finishRound = () => { if (canFinish) { setFinishedFirst(true); setStage('results') } }
  const setScore = (index: number, score: number) => {
    setScores((current) => current.map((value, scoreIndex) => scoreIndex === index ? score : value))
    setScoreSelected((current) => current.map((selected, scoreIndex) => scoreIndex === index ? true : selected))
  }
  const continueToSummary = () => {
    if (!scoreSelected.every(Boolean)) return
    const bonus = finishedFirst && scores.every((score) => score === 10) ? 10 : 0
    setRoundHistory((current) => [...current, { letter, answers: [...answers], scores: [...scores], total: total + bonus, bonus }])
    setStage('summary')
  }
  const nextRound = () => {
    if (roundNumber >= 5) { setStage('winner'); return }
    setAnswers(Array(culturinCategories.length).fill(''))
    setFinished(Array(culturinCategories.length).fill(false))
    setScores(Array(culturinCategories.length).fill(0))
    setScoreSelected(Array(culturinCategories.length).fill(false))
    setRoundNumber((current) => current + 1)
    setFinishedFirst(false)
    setCountdown(3)
    setStage('countdown')
  }
  const total = scores.reduce((sum, score) => sum + score, 0)
  const accumulatedPoints = roundHistory.reduce((sum, round) => sum + round.total, 0)

  const historicalRows = roundHistory.map((round, index) => ({ ...round, number: index + 1 }))

  if (stage === 'room' || stage === 'code' || stage === 'name' || stage === 'waiting') {
    return (
      <main className="culturin-page room-page">
        <header className="culturin-header">
          <button className="back-button" type="button" onClick={onBack} aria-label="Volver a la sala de juegos"><ArrowLeft size={20} /></button>
          <div className="culturin-title"><span>CULTURÍN</span><small>/ TUTIFRUTI</small></div>
        </header>
        <section className="room-panel">
          {stage === 'room' && <>
            <p className="room-kicker">NUEVA PARTIDA</p><h1>Crea una sala<br /><em>y juega en equipo.</em></h1>
            <p className="room-intro">Comparte el código con tu grupo y preparaos para responder con la misma letra.</p>
            <div className="room-actions"><button className="primary-room-button" type="button" onClick={createRoom}>Crear sala</button><div className="join-form"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={4} placeholder="Código" aria-label="Código de sala" /><button type="button" onClick={joinRoom}>Unirse mediante código</button></div></div>
          </>}
          {stage === 'code' && <div className="room-modal-content"><p className="room-kicker">SALA CREADA</p><h2>Comparte este código</h2><div className="room-code">{roomCode}</div><p>Cuando todos estén dentro, empieza la pantalla para que cada jugador escriba su nombre.</p><button className="primary-room-button" type="button" onClick={startNameStep}>Empezar pantalla</button></div>}
          {stage === 'name' && <div className="room-modal-content"><p className="room-kicker">SALA {roomCode}</p><h2>¿Cómo te llamas?</h2><p>Tu nombre aparecerá junto a tus respuestas al terminar la ronda.</p><input className="large-room-input" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="Escribe tu nombre" autoFocus /><button className="primary-room-button" type="button" onClick={enterRoom} disabled={!player.trim()}>Entrar en la sala</button></div>}
          {stage === 'waiting' && <div className="room-modal-content"><p className="room-kicker">SALA {roomCode}</p><h2>Jugadores preparados</h2><div className="player-list"><span className="player-chip">{player} <b>tú</b></span></div><p>Cuando todos hayan escrito su nombre, pulsa para mostrar la tabla.</p><button className="primary-room-button" type="button" onClick={beginRound}>Listo</button></div>}
        </section>
      </main>
    )
  }

  if (stage === 'countdown') return <main className="culturin-page countdown-page"><p>PREPARADOS</p><strong>{countdown || 'YA'}</strong><span>La letra aparece en un momento</span></main>

  if (stage === 'results') {
    return <main className="culturin-page results-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><div className="culturin-title"><span>REVISA LAS RESPUESTAS</span><small>/ {player || 'JUGADOR'}</small></div></header><div className="result-letter">Letra de la ronda <strong>{letter}</strong></div><section className="answer-results answer-table-wrap"><div className="answer-table answer-table-head"><span>CATEGORÍA</span><span>{player || 'TÚ'}</span><span>PUNTOS</span></div>{culturinCategories.map((category, index) => <div className="answer-table answer-table-row" key={category.label}><span className="answer-category" style={{ backgroundColor: category.color }}>{category.label}</span><strong>{answers[index] || 'Sin respuesta'}</strong><div className="score-actions"><button className={scoreSelected[index] && scores[index] === 10 ? 'score-active' : ''} onClick={() => setScore(index, 10)}>Único<br /><b>10</b></button><button className={scoreSelected[index] && scores[index] === 5 ? 'score-active' : ''} onClick={() => setScore(index, 5)}>Repetido<br /><b>5</b></button><button className={scoreSelected[index] && scores[index] === 0 ? 'score-active' : ''} onClick={() => setScore(index, 0)}>Fallo<br /><b>0</b></button></div></div>)}</section><button className="continue-button" type="button" onClick={continueToSummary} disabled={!scoreSelected.every(Boolean)}>Continuar</button></main>
  }

  if (stage === 'summary') {
    return <main className="culturin-page results-page"><header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver"><ArrowLeft size={20} /></button><div className="culturin-title"><span>RONDA {roundNumber} / 5</span><small>{player || 'JUGADOR'}</small></div><div className="result-total">{total + (finishedFirst && scores.every((score) => score === 10) ? 10 : 0)} puntos</div></header><div className="result-letter">Tus palabras con la letra <strong>{letter}</strong></div><section className="summary-list summary-table-wrap"><div className="summary-table summary-table-head"><span>CATEGORÍA</span><span>{player || 'TÚ'}</span><span>PUNTOS</span></div>{culturinCategories.map((category, index) => <div className="summary-table summary-table-row" key={category.label}><span className="answer-category" style={{ backgroundColor: category.color }}>{category.label}</span><strong>{answers[index] || 'Sin respuesta'}</strong><b>{scores[index]} pts</b></div>)}</section>{finishedFirst && scores.every((score) => score === 10) && <p className="bonus-note">+10 puntos por acabar primero con todas correctas</p>}<div className="next-round"><p>{roundNumber === 5 ? 'Has completado las 5 rondas.' : 'Cuando todos hayan revisado sus palabras, pulsa Listo para la siguiente letra.'}</p><button className="finish-button" type="button" onClick={nextRound}>{roundNumber === 5 ? 'Ver ganador' : 'Listo'}</button></div></main>
  }

  if (stage === 'winner') {
    return <main className="culturin-page winner-page"><p className="room-kicker">FIN DE LA PARTIDA</p><h1>¡{player || 'Jugador'}, has terminado!</h1><div className="winner-score">{accumulatedPoints}<span> puntos</span></div><p>Resultado después de 5 rondas</p><button className="primary-room-button" type="button" onClick={onBack}>Volver a la sala</button></main>
  }

  return (
    <main className="culturin-page">
      <header className="culturin-header"><button className="back-button" type="button" onClick={onBack} aria-label="Volver a la sala de juegos"><ArrowLeft size={20} /></button><div className="culturin-title"><span>CULTURÍN</span><small>/ {player}</small></div><div className="culturin-meta"><span>SALA {roomCode}</span><strong>LETRA: {letter}</strong><strong>ACUMULADO: {accumulatedPoints}</strong></div></header>
      <section className="culturin-board active-board" aria-label="Tabla de Culturín"><div className="culturin-row culturin-head"><div className="letter-head">LETRA</div>{culturinCategories.map((category) => <div key={category.label} style={{ backgroundColor: category.color }}>{category.label}</div>)}<div className="points-head">PUNTOS</div></div>{historicalRows.map((round) => <div className="culturin-row history-row" key={`${round.number}-${round.letter}`}><div className="letter-cell"><strong>{round.letter}</strong></div>{round.answers.map((answer, index) => <div className="answer-cell history-answer" key={culturinCategories[index].label}>{answer || '—'}</div>)}<div className="points-cell"><strong>{round.total}</strong>{round.bonus > 0 && <small>+{round.bonus}</small>}</div></div>)}<div className="culturin-row active-answer-row"><div className="letter-cell"><strong>{letter}</strong></div>{answers.map((answer, index) => <div className="answer-cell answer-editor" key={culturinCategories[index].label}><input value={answer === '—' ? '' : answer} onChange={(event) => updateAnswer(index, event.target.value)} aria-label={culturinCategories[index].label} placeholder={culturinCategories[index].label} /><button type="button" onClick={() => markNoAnswer(index)} title="Marcar sin solución">—</button></div>)}<div className="points-cell">—</div></div></section>
      <div className="finish-area"><p>{canFinish ? 'Todas las casillas están preparadas.' : 'Completa todas las casillas o marca — si no encuentras una solución.'}</p><button className="finish-button" type="button" onClick={finishRound} disabled={!canFinish}>He acabado</button></div>
    </main>
  )
}

function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  if (activeGame === 'Culturin') {
    return <Culturin onBack={() => setActiveGame(null)} />
  }

  if (activeGame === 'Ajedrez') {
    return <ChessGame onBack={() => setActiveGame(null)} />
  }

  if (activeGame === 'Parchís') {
    return <ParchisGame onBack={() => setActiveGame(null)} />
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
