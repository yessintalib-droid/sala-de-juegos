import { ArrowLeft, Dice5, Home, Sparkles, Wallet } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type Stage = 'setup' | 'tokens' | 'game' | 'ranking'
type Mode = 'normal' | 'express' | 'test'

type Player = {
  id: number
  name: string
  token: number
  money: number
  position: number
  properties: string[]
  jailed: boolean
  bankrupt: boolean
}

type Space = {
  name: string
  kind: 'start' | 'property' | 'luck' | 'tax' | 'rest' | 'goto-jail' | 'jail' | 'gain' | 'park' | 'lottery' | 'robbery' | 'bank'
  color?: string
  price?: number
  rent?: number
  amount?: number
  level?: number
  railway?: boolean
}

type EconomyGroup = {
  level: number
  label: string
  color: string
  price: number
  rents: [number, number, number, number, number, number]
  buildCost: number
  hotelCost: number
}

type LuckCard = {
  title: string
  text: string
  action: 'collect' | 'pay-all' | 'extra-turn' | 'start' | 'jail' | 'collect-all'
}

type MoneyEffect = {
  amount: number
  source: string
  target: string
  kind: 'gain' | 'payment' | 'bank' | 'purchase'
  from: { x: number; y: number }
  to: { x: number; y: number }
}

type LuckAnimation = {
  card: LuckCard
  position: number
}

type PropertyDetails = {
  houses: number
  hotel: boolean
  mortgaged: boolean
}

type PropertyOffer = {
  property: string
  price: number
  sellerId: number
  buyerId: number
}

type MoneyMovement = {
  id: number
  amount: number
  direction: 'entrada' | 'salida'
  label: string
}

type MoneyPrompt = {
  amount: number
  title: string
  description: string
  button: string
  action: 'rent' | 'tax' | 'start' | 'gain' | 'bank'
  actorId: number
  targetId?: number
}

const tokens = ['1', '2', '3', '4', '5', '6']
const railwayColor = '#8b8f99'
const propertyColors = ['#b89adf', '#b89adf', '#e9a1b4', '#e9a1b4', '#cfe2f3', '#cfe2f3', '#d85b5b', '#d85b5b', '#2f7355', '#2f7355', '#315d9a', '#315d9a']

const economyGroups: Record<number, EconomyGroup> = {
  1: { level: 1, label: 'Nivel 1 · Lila', color: '#b89adf', price: 60, rents: [2, 10, 30, 90, 160, 250], buildCost: 50, hotelCost: 200 },
  2: { level: 2, label: 'Nivel 2 · Rosa', color: '#e9a1b4', price: 100, rents: [6, 30, 90, 270, 400, 550], buildCost: 60, hotelCost: 240 },
  3: { level: 3, label: 'Nivel 3 · Azul claro', color: '#cfe2f3', price: 140, rents: [10, 50, 150, 450, 625, 750], buildCost: 70, hotelCost: 280 },
  4: { level: 4, label: 'Nivel 4 · Rojo', color: '#d85b5b', price: 180, rents: [14, 70, 200, 550, 750, 950], buildCost: 80, hotelCost: 320 },
  5: { level: 5, label: 'Nivel 5 · Verde oscuro', color: '#2f7355', price: 220, rents: [18, 90, 250, 700, 875, 1050], buildCost: 90, hotelCost: 360 },
  6: { level: 6, label: 'Nivel 6 · Azul oscuro', color: '#315d9a', price: 350, rents: [28, 150, 450, 1000, 1200, 1500], buildCost: 100, hotelCost: 400 },
}

const trialMoney = 20000
const jailPosition = 7

const spaces: Space[] = [
  { name: 'Salida', kind: 'start', amount: 100 },
  { name: 'Carnicería', kind: 'property', color: propertyColors[0], price: 60, rent: 2, level: 1 },
  { name: 'Habitación de Yessin', kind: 'gain', amount: 50 },
  { name: 'Bazar Chino', kind: 'property', color: propertyColors[0], price: 60, rent: 2, level: 1 },
  { name: 'Carta de la suerte', kind: 'luck' },
  { name: 'Gym', kind: 'property', color: propertyColors[2], price: 100, rent: 6, level: 2 },
  { name: 'Talmon', kind: 'property', color: propertyColors[2], price: 100, rent: 6, level: 2 },
  { name: 'Cárcel: solo visitas', kind: 'jail' },
  { name: 'Puigsoler', kind: 'property', color: propertyColors[5], price: 140, rent: 10, level: 3 },
  { name: 'Bonpreu: impuestos', kind: 'tax', amount: 100 },
  { name: 'Cal Soler', kind: 'property', color: propertyColors[4], price: 140, rent: 10, level: 3 },
  { name: 'Tren Catalans', kind: 'property', color: railwayColor, price: 200, rent: 0, railway: true },
  { name: 'Cap SVC', kind: 'property', color: propertyColors[4], price: 140, rent: 10, level: 3 },
  { name: 'Carta de la suerte', kind: 'luck' },
  { name: 'Impuestos españoles: -100 €', kind: 'tax', amount: 100 },
  { name: 'Pugnator', kind: 'property', color: propertyColors[6], price: 180, rent: 14, level: 4 },
  { name: 'Caja registradora', kind: 'bank' },
  { name: 'Carta de la suerte', kind: 'luck' },
  { name: 'Cal Manel', kind: 'property', color: propertyColors[6], price: 180, rent: 14, level: 4 },
  { name: 'Premio: 50 €', kind: 'gain', amount: 50 },
  { name: 'Habitación de Naira', kind: 'gain', amount: 50 },
  { name: 'Ikan', kind: 'property', color: propertyColors[6], price: 180, rent: 14, level: 4 },
  { name: 'Forn de pa', kind: 'property', color: propertyColors[8], price: 220, rent: 18, level: 5 },
  { name: 'Gasolinera', kind: 'property', color: propertyColors[8], price: 220, rent: 18, level: 5 },
  { name: 'Comisaría de policía', kind: 'goto-jail' },
  { name: 'La Grangeta', kind: 'property', color: propertyColors[8], price: 220, rent: 18, level: 5 },
  { name: 'Parque: pierdes un turno', kind: 'park' },
  { name: 'Carta de la suerte', kind: 'luck' },
  { name: 'Lotería', kind: 'lottery', price: 20 },
  { name: 'Tren Renfe', kind: 'property', color: railwayColor, price: 200, rent: 0, railway: true },
  { name: 'Te han robado: -50 €', kind: 'robbery', amount: 50 },
  { name: 'Vallhonesta', kind: 'property', color: propertyColors[10], price: 350, rent: 28, level: 6 },
  { name: 'Mansión Balconada', kind: 'property', color: propertyColors[10], price: 350, rent: 28, level: 6 },
]

const luckCards: LuckCard[] = [
  { title: 'Ayuda vecinal', text: 'Todos los jugadores te pagan 100 €.', action: 'collect-all' },
  { title: 'Imprevisto', text: 'Paga 100 € a todos los jugadores.', action: 'pay-all' },
  { title: 'Tira otra vez', text: 'Conservas el turno y puedes volver a tirar.', action: 'extra-turn' },
  { title: 'Premio', text: 'La lotería te da 100 € del banco.', action: 'collect' },
  { title: 'Viaje inesperado', text: 'Vuelves a Inicio sin cobrar.', action: 'start' },
  { title: 'Cárcel', text: 'Vas directamente a la cárcel.', action: 'jail' },
]

const initialPlayers = (count: number): Player[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    name: `Jugador ${index + 1}`,
    token: index,
    money: 1500,
    position: 0,
    properties: [],
    jailed: false,
    bankrupt: false,
  }))

const initialTrialPlayers = (count: number): Player[] =>
  initialPlayers(count).map((player) => ({ ...player, money: trialMoney }))

const boardRects = [
  { x: 88, y: 84, w: 12, h: 16 },
  { x: 77, y: 84, w: 11, h: 16 },
  { x: 66, y: 84, w: 11, h: 16 },
  { x: 55, y: 84, w: 11, h: 16 },
  { x: 44, y: 84, w: 11, h: 16 },
  { x: 33, y: 84, w: 11, h: 16 },
  { x: 22, y: 84, w: 11, h: 16 },
  { x: 11, y: 84, w: 11, h: 16 },
  { x: 0, y: 84, w: 11, h: 16 },
  { x: 0, y: 74, w: 11, h: 10 },
  { x: 0, y: 63, w: 11, h: 11 },
  { x: 0, y: 52, w: 11, h: 11 },
  { x: 0, y: 41, w: 11, h: 11 },
  { x: 0, y: 30, w: 11, h: 11 },
  { x: 0, y: 19, w: 11, h: 11 },
  { x: 0, y: 9, w: 11, h: 10 },
  { x: 0, y: 0, w: 11, h: 9 },
  { x: 11, y: 0, w: 11, h: 16 },
  { x: 22, y: 0, w: 11, h: 16 },
  { x: 33, y: 0, w: 11, h: 16 },
  { x: 44, y: 0, w: 11, h: 16 },
  { x: 55, y: 0, w: 11, h: 16 },
  { x: 66, y: 0, w: 11, h: 16 },
  { x: 77, y: 0, w: 11, h: 16 },
  { x: 88, y: 0, w: 12, h: 16 },
  { x: 88, y: 16, w: 12, h: 10 },
  { x: 88, y: 26, w: 12, h: 11 },
  { x: 88, y: 37, w: 12, h: 11 },
  { x: 88, y: 48, w: 12, h: 11 },
  { x: 88, y: 59, w: 12, h: 11 },
  { x: 88, y: 70, w: 12, h: 14 },
  { x: 5, y: 84, w: 6, h: 16 },
]

const logicalBoardRects = [
  { x: 0, y: 84, w: 11, h: 16 },
  { x: 0, y: 74, w: 11, h: 10 },
  { x: 0, y: 63, w: 11, h: 11 },
  { x: 0, y: 52, w: 11, h: 11 },
  { x: 0, y: 41, w: 11, h: 11 },
  { x: 0, y: 30, w: 11, h: 11 },
  { x: 0, y: 19, w: 11, h: 11 },
  { x: 0, y: 9, w: 11, h: 10 },
  { x: 0, y: 0, w: 11, h: 9 },
  { x: 11, y: 0, w: 10, h: 16 },
  { x: 21, y: 0, w: 10, h: 16 },
  { x: 31, y: 0, w: 10, h: 16 },
  { x: 41, y: 0, w: 10, h: 16 },
  { x: 51, y: 0, w: 10, h: 16 },
  { x: 61, y: 0, w: 10, h: 16 },
  { x: 71, y: 0, w: 9, h: 16 },
  { x: 80, y: 0, w: 8, h: 16 },
  { x: 88, y: 0, w: 12, h: 16 },
  { x: 88, y: 16, w: 12, h: 11 },
  { x: 88, y: 27, w: 12, h: 11 },
  { x: 88, y: 38, w: 12, h: 11 },
  { x: 88, y: 49, w: 12, h: 11 },
  { x: 88, y: 60, w: 12, h: 11 },
  { x: 88, y: 71, w: 12, h: 5 },
  { x: 88, y: 76, w: 12, h: 8 },
  { x: 88, y: 84, w: 12, h: 16 },
  { x: 77, y: 84, w: 11, h: 16 },
  { x: 66, y: 84, w: 11, h: 16 },
  { x: 55, y: 84, w: 11, h: 16 },
  { x: 44, y: 84, w: 11, h: 16 },
  { x: 33, y: 84, w: 11, h: 16 },
  { x: 22, y: 84, w: 11, h: 16 },
  { x: 11, y: 84, w: 11, h: 16 },
  { x: 0, y: 84, w: 11, h: 16 },
]

const tokenCenters = [
  { x: 5, y: 92 },
  { x: 5, y: 78 },
  { x: 5, y: 66 },
  { x: 5, y: 54 },
  { x: 5, y: 43 },
  { x: 5, y: 33 },
  { x: 5, y: 21 },
  { x: 5, y: 7 },
  { x: 16, y: 7 },
  { x: 26, y: 7 },
  { x: 36, y: 7 },
  { x: 46, y: 7 },
  { x: 56, y: 7 },
  { x: 66, y: 7 },
  { x: 76, y: 7 },
  { x: 86, y: 7 },
  { x: 95, y: 7 },
  { x: 95, y: 22 },
  { x: 95, y: 34 },
  { x: 95, y: 45 },
  { x: 95, y: 56 },
  { x: 95, y: 67 },
  { x: 95, y: 78 },
  { x: 95, y: 85 },
  { x: 95, y: 92 },
  { x: 84, y: 92 },
  { x: 74, y: 92 },
  { x: 64, y: 92 },
  { x: 54, y: 92 },
  { x: 44, y: 92 },
  { x: 34, y: 92 },
  { x: 24, y: 92 },
  { x: 14, y: 92 },
]
const startAnimationPosition = 0

function Monopoly({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>('setup')
  const [mode, setMode] = useState<Mode>('normal')
  const [playerCount, setPlayerCount] = useState(2)
  const [players, setPlayers] = useState<Player[]>(initialPlayers(2))
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [dice, setDice] = useState<number[]>([])
  const [notice, setNotice] = useState('Pulsa tirar dados para empezar.')
  const [pendingProperty, setPendingProperty] = useState<Space | null>(null)
  const [luckCard, setLuckCard] = useState<LuckCard | null>(null)
  const [turns, setTurns] = useState(0)
  const [selectedToken, setSelectedToken] = useState<number | null>(null)
  const [movement, setMovement] = useState<{ playerId: number; path: number[]; index: number } | null>(null)
  const [moneyEffect, setMoneyEffect] = useState<MoneyEffect | null>(null)
  const [luckAnimation, setLuckAnimation] = useState<LuckAnimation | null>(null)
  const [bankCash, setBankCash] = useState(0)
  const [moneyPrompt, setMoneyPrompt] = useState<MoneyPrompt | null>(null)
  const [propertyDetails, setPropertyDetails] = useState<Record<string, PropertyDetails>>({})
  const [managedProperty, setManagedProperty] = useState<string | null>(null)
  const [offerTargetId, setOfferTargetId] = useState<number | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [propertyOffer, setPropertyOffer] = useState<PropertyOffer | null>(null)
  const [lotteryPosition, setLotteryPosition] = useState<number | null>(null)
  const [lotteryTicketBought, setLotteryTicketBought] = useState(false)
  const [lotteryRoll, setLotteryRoll] = useState<number | null>(null)
  const [moneyMovements, setMoneyMovements] = useState<Record<number, MoneyMovement[]>>({})
  const [jailTurns, setJailTurns] = useState<Record<number, number>>({})
  const [extraTurn, setExtraTurn] = useState(false)
  const [selectedEconomyGroup, setSelectedEconomyGroup] = useState<EconomyGroup | null>(null)
  const [testDiceValue, setTestDiceValue] = useState(1)
  const walletRef = useRef<HTMLDivElement>(null)
  const movementId = useRef(0)

  const current = players[currentPlayer]

  const boardPoint = (position: number) => {
    return tokenCenters[position % tokenCenters.length] ?? tokenCenters[0]
  }

  const walletPoint = () => {
    const wallet = walletRef.current?.getBoundingClientRect()
    if (!wallet) return { x: 86, y: 28 }

    return {
      x: ((wallet.left + wallet.width / 2) / window.innerWidth) * 100,
      y: ((wallet.top + wallet.height / 2) / window.innerHeight) * 100,
    }
  }

  const showMoneyEffect = (
    amount: number,
    source: string,
    target: string,
    kind: MoneyEffect['kind'],
    fromPosition: number,
    toPosition: number,
  ) => {
    if (amount <= 0) return
    setMoneyEffect({
      amount,
      source,
      target,
      kind,
      from: boardPoint(fromPosition),
      to: boardPoint(toPosition),
    })
  }

  const askMoney = (prompt: MoneyPrompt) => {
    setMoneyPrompt(prompt)
    setNotice(prompt.description)
  }

  const addMoneyMovement = (amount: number, direction: MoneyMovement['direction'], label: string) => {
    const playerId = current.id
    setMoneyMovements((movements) => ({
      ...movements,
      [playerId]: [
        { id: movementId.current++, amount, direction, label },
        ...(movements[playerId] ?? []),
      ].slice(0, 12),
    }))
  }

  const getPropertyDetails = (property: string) => propertyDetails[property] ?? { houses: 0, hotel: false, mortgaged: false }

  const getEconomyGroup = (property: string) => {
    const space = spaces.find((candidate) => candidate.name === property)
    return space?.level ? economyGroups[space.level] : null
  }

  const ownsCompleteGroup = (property: string, player: Player) => {
    const space = spaces.find((candidate) => candidate.name === property)
    if (!space?.level || space.railway) return false
    const groupProperties = spaces.filter((candidate) => candidate.level === space.level && !candidate.railway)
    return groupProperties.every((candidate) => player.properties.includes(candidate.name))
  }

  const getRent = (property: string, owner: Player) => {
    const space = spaces.find((candidate) => candidate.name === property)
    if (!space || space.railway) return 0
    const group = getEconomyGroup(property)
    if (!group) return space.rent ?? 0
    const details = getPropertyDetails(property)
    if (details.mortgaged) return 0
    if (details.hotel) return group.rents[5]
    if (details.houses > 0) return group.rents[details.houses]
    return ownsCompleteGroup(property, owner) ? group.rents[0] * 2 : group.rents[0]
  }

  const getBuildCost = (property: string) => getEconomyGroup(property)?.buildCost ?? 0

  const owned = useMemo(
    () => new Map(players.flatMap((player) => player.properties.map((property) => [property, player.name]))),
    [players],
  )

  const configurePlayers = () => {
    setPlayers(mode === 'test' ? initialTrialPlayers(playerCount) : initialPlayers(playerCount))
    setCurrentPlayer(0)
    setStage('tokens')
  }

  const chooseToken = (token: number) => {
    setSelectedToken(token)
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) => (index === 0 ? { ...player, token } : player)),
    )
  }

  const updateCurrent = (changes: Partial<Player>) => {
    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) => (index === currentPlayer ? { ...player, ...changes } : player)),
    )
  }

  const nextTurn = () => {
    setCurrentPlayer((index) => (index + 1) % players.length)
    setTurns((value) => value + 1)
    setDice([])
    setPendingProperty(null)
    setLuckCard(null)
    setNotice('Pulsa tirar dados para empezar.')
  }

  const billValues = (amount: number) => {
    const values = [500, 100, 50, 20, 10, 5, 1]
    const bills: number[] = []
    let remaining = Math.max(0, amount)

    for (const value of values) {
      const count = Math.floor(remaining / value)
      for (let i = 0; i < count; i += 1) {
        bills.push(value)
      }
      remaining -= count * value
    }

    return bills
  }

  const resolveSpace = (position: number, actor: Player, passedStart = false) => {
    const space = spaces[position % spaces.length]

    if (space.kind === 'property') {
      const owner = owned.get(space.name)

      if (!owner && (space.price ?? 0) <= actor.money) {
        setPendingProperty(space)
        setNotice(`${space.name} está libre. Puedes comprarla.`)
        return
      }

      if (owner && owner !== actor.name) {
        const ownerPlayer = players.find((player) => player.name === owner)
        if (space.railway) {
          setNotice('Los trenes no cobran alquiler.')
          return
        }
        const rent = ownerPlayer ? getRent(space.name, ownerPlayer) : 0
        if (rent <= 0) return

        askMoney({
          amount: rent,
          title: 'Pago de alquiler',
          description: `Debes pagar ${rent} € a ${owner}.`,
          button: `Pagar ${rent} €`,
          action: 'rent',
          actorId: actor.id,
          targetId: ownerPlayer?.id,
        })
      }
      return
    }

    if (space.kind === 'start') {
      const amount = 100 + actor.properties.filter((property) => spaces.find((candidate) => candidate.name === property)?.railway).length * 100
      const startAmount = passedStart || position !== 0 ? amount : 0
      const collectedCash = position === 0 ? bankCash : 0
      if (collectedCash > 0) {
        const totalCollected = collectedCash + startAmount
        askMoney({ amount: totalCollected, title: startAmount > 0 ? 'Cobrar Salida y caja' : 'Cobrar caja', description: startAmount > 0 ? `Cobras ${startAmount} € de Salida y recoges ${collectedCash} € de la caja.` : `Hay ${collectedCash} € en la caja del tablero.`, button: `Cobrar ${totalCollected} €`, action: 'bank', actorId: actor.id })
      } else if (startAmount > 0) {
        askMoney({ amount: startAmount, title: 'Cobrar por Salida', description: `Has pasado por Salida y cobras ${startAmount} €.`, button: `Cobrar ${startAmount} €`, action: 'start', actorId: actor.id })
      }
      return
    }

    if (space.kind === 'tax') {
      const amount = space.amount ?? 0
      askMoney({ amount, title: 'Pagar impuestos', description: `Debes pagar ${amount} € al tablero.`, button: `Pagar ${amount} €`, action: 'tax', actorId: actor.id })
      return
    }

    if (space.kind === 'gain') {
      const amount = space.amount ?? 50
      const isBedroom = space.name.startsWith('Habitación de')
      const bedroomOwner = space.name.replace('Habitación de ', '')
      askMoney({
        amount,
        title: `+${amount} €`,
        description: 'Has ganado 50 €.',
        button: `Cobrar ${amount} €`,
        action: 'gain',
        actorId: actor.id,
      })
      return
    }

    if (space.kind === 'robbery') {
      const amount = space.amount ?? 50
      askMoney({ amount, title: 'Te han robado', description: `Debes pagar ${amount} € por el robo.`, button: `Pagar ${amount} €`, action: 'tax', actorId: actor.id })
      return
    }

    if (space.kind === 'bank') {
      const amount = bankCash
      if (amount > 0) {
        askMoney({ amount, title: 'Cobrar caja', description: `Has llegado a la caja y puedes recoger ${amount} €.`, button: `Cobrar ${amount} €`, action: 'bank', actorId: actor.id })
      } else {
        setNotice('La caja del tablero está vacía.')
      }
      return
    }

    if (space.kind === 'goto-jail') {
      updateCurrent({ position: jailPosition, jailed: true })
      setNotice('Has ido a la cárcel.')
      return
    }

    if (space.kind === 'park') {
      updateCurrent({ jailed: true })
      setNotice('Descansas en el parque y pierdes el siguiente turno.')
      return
    }

    if (space.kind === 'lottery') {
      setLotteryPosition(position)
      setNotice('Puedes comprar un billete de lotería por 20 €.')
      return
    }

    if (space.kind === 'luck') {
      const randomCard = luckCards[Math.floor(Math.random() * luckCards.length)]
      setLuckAnimation({ card: randomCard, position })
      setNotice('Has sacado una carta de Suerte.')
      return
    }

    if (space.kind === 'rest') {
      setNotice(`Has caído en ${space.name}.`)
      return
    }

    setNotice(`Has caído en ${space.name}.`)
  }
const getHotelCost = (property: string) => getEconomyGroup(property)?.hotelCost ?? 0

  const getMissingGroupProperties = (property: string) => {
    const space = spaces.find((candidate) => candidate.name === property)
    if (!space?.level || space.railway) return []
    return spaces
      .filter((candidate) => candidate.level === space.level && !candidate.railway && !current.properties.includes(candidate.name))
      .map((candidate) => candidate.name)
  }

  useEffect(() => {
    if (!movement) return

    if (movement.index >= movement.path.length - 1) {
      const finalPosition = movement.path[movement.path.length - 1]
      const mover = players.find((player) => player.id === movement.playerId)

      if (mover) {
        const passedStart = mover.position + movement.path.length >= spaces.length
        const updatedPlayer = {
          ...mover,
          position: finalPosition,
          money: mover.money,
        }

        setPlayers((currentPlayers) =>
          currentPlayers.map((player) => (player.id === mover.id ? updatedPlayer : player)),
        )

        resolveSpace(finalPosition, updatedPlayer, passedStart)
      }

      setMovement(null)
      return
    }

    const timer = window.setTimeout(() => {
      setMovement((currentMovement) =>
        currentMovement ? { ...currentMovement, index: currentMovement.index + 1 } : null,
      )
    }, 330)

    return () => window.clearTimeout(timer)
  }, [movement, players])

  useEffect(() => {
    if (!luckAnimation) return

    const timer = window.setTimeout(() => {
      setLuckCard(luckAnimation.card)
      setLuckAnimation(null)
    }, 850)

    return () => window.clearTimeout(timer)
  }, [luckAnimation])

  useEffect(() => {
    if (!moneyEffect) return

    const timer = window.setTimeout(() => setMoneyEffect(null), 3700)
    return () => window.clearTimeout(timer)
  }, [moneyEffect])

  useEffect(() => {
    if (stage !== 'game' || !current.jailed || movement || moneyPrompt || pendingProperty || luckCard) return

    const timer = window.setTimeout(() => {
      const skippedTurns = jailTurns[current.id] ?? 0
      if (skippedTurns + 1 >= 2) {
        setPlayers((currentPlayers) => currentPlayers.map((player) =>
          player.id === current.id ? { ...player, jailed: false } : player,
        ))
        setJailTurns((turnsByPlayer) => ({ ...turnsByPlayer, [current.id]: 0 }))
        setNotice(`Jugador ${current.token + 1} ya puede volver a jugar.`)
      } else {
        setJailTurns((turnsByPlayer) => ({ ...turnsByPlayer, [current.id]: skippedTurns + 1 }))
        setNotice(`Jugador ${current.token + 1} está en la cárcel. Se salta el turno ${skippedTurns + 1} de 2.`)
      }
      nextTurn()
    }, 700)

    return () => window.clearTimeout(timer)
  }, [stage, current.id, current.jailed, jailTurns, movement, moneyPrompt, pendingProperty, luckCard])

  useEffect(() => {
    if (stage !== 'game' || !current.bankrupt || movement || moneyPrompt || pendingProperty || luckCard) return

    const timer = window.setTimeout(() => {
      setNotice(`Jugador ${current.token + 1} está eliminado por quiebra.`)
      nextTurn()
    }, 500)

    return () => window.clearTimeout(timer)
  }, [stage, current.id, current.bankrupt, movement, moneyPrompt, pendingProperty, luckCard])

  const confirmMoney = () => {
    if (!moneyPrompt) return

    const actor = players.find((player) => player.id === moneyPrompt.actorId)
    if (!actor) return

    if (moneyPrompt.action === 'rent') {
      const owner = players.find((player) => player.id === moneyPrompt.targetId)
      const remainingMoney = actor.money - moneyPrompt.amount

      if (remainingMoney <= 0) {
        setPlayers((currentPlayers) => currentPlayers.map((player) => {
          if (player.id === actor.id) return { ...player, money: 0, bankrupt: true }
          return player
        }))
        addMoneyMovement(Math.max(0, actor.money), 'salida', `Quiebra por alquiler de ${owner ? `Jugador ${owner.token + 1}` : 'banco'}`)
        setMoneyEffect(null)
        setMoneyPrompt(null)
        setNotice(`Jugador ${actor.token + 1} ha perdido por no poder pagar el alquiler.`)
        return
      }

      setPlayers((currentPlayers) =>
        currentPlayers.map((player) => {
          if (player.id === actor.id) return { ...player, money: player.money - moneyPrompt.amount }
          if (owner && player.id === owner.id) return { ...player, money: player.money + moneyPrompt.amount }
          return player
        }),
      )
      showMoneyEffect(moneyPrompt.amount, `Jugador ${actor.token + 1}`, owner ? `Jugador ${owner.token + 1}` : 'Banco', 'payment', actor.position, owner?.position ?? 0)
      addMoneyMovement(moneyPrompt.amount, 'salida', `Alquiler a ${owner ? `Jugador ${owner.token + 1}` : 'banco'}`)
      setNotice(`Has pagado ${moneyPrompt.amount} €.`)
    }

    if (moneyPrompt.action === 'tax') {
      setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === actor.id ? { ...player, money: player.money - moneyPrompt.amount } : player))
      setBankCash((cash) => cash + moneyPrompt.amount)
      setMoneyEffect({ amount: moneyPrompt.amount, source: `Jugador ${actor.token + 1}`, target: 'Caja del tablero', kind: 'bank', from: boardPoint(actor.position), to: { x: 50, y: 50 } })
      addMoneyMovement(moneyPrompt.amount, 'salida', 'Impuestos al tablero')
      setNotice(`Has pagado ${moneyPrompt.amount} € al tablero.`)
    }

    if (moneyPrompt.action === 'start') {
      setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === actor.id ? { ...player, money: player.money + moneyPrompt.amount } : player))
      showMoneyEffect(moneyPrompt.amount, 'Salida', `Jugador ${actor.token + 1}`, 'gain', startAnimationPosition, actor.position)
      addMoneyMovement(moneyPrompt.amount, 'entrada', 'Cobro de Salida')
      setNotice(`Has cobrado ${moneyPrompt.amount} € por pasar por Salida.`)
    }

    if (moneyPrompt.action === 'gain') {
      setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === actor.id ? { ...player, money: player.money + moneyPrompt.amount } : player))
      showMoneyEffect(moneyPrompt.amount, 'Premio', `Jugador ${actor.token + 1}`, 'gain', actor.position, actor.position)
      addMoneyMovement(moneyPrompt.amount, 'entrada', 'Premio de la casilla')
      setNotice(`Has cobrado ${moneyPrompt.amount} €.`)
    }

    if (moneyPrompt.action === 'bank') {
      setPlayers((currentPlayers) => currentPlayers.map((player) => player.id === actor.id ? { ...player, money: player.money + moneyPrompt.amount } : player))
      setBankCash(0)
      setMoneyEffect({ amount: moneyPrompt.amount, source: 'Caja del tablero', target: `Jugador ${actor.token + 1}`, kind: 'gain', from: { x: 50, y: 50 }, to: walletPoint() })
      addMoneyMovement(moneyPrompt.amount, 'entrada', 'Cobro de la caja')
      setNotice(`Has cobrado ${moneyPrompt.amount} € de la caja.`)
    }

    setMoneyPrompt(null)
  }

  const rollDice = () => {
    if (pendingProperty || moneyPrompt || luckCard || current.jailed || current.bankrupt || movement) return

    const rolledDice = mode === 'test'
      ? [testDiceValue]
      : [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
    const result = rolledDice.reduce((total, value) => total + value, 0)
    const path = Array.from({ length: result + 1 }, (_, index) => (current.position + index) % spaces.length)

    setDice(rolledDice)
    setMovement({ playerId: current.id, path, index: 0 })
  }

  const buyProperty = () => {
    if (!pendingProperty) return

    const property = pendingProperty
    const price = property.price ?? 0
    const propertyName = property.name

    updateCurrent({
      money: current.money - price,
      properties: [...current.properties, propertyName],
    })

    setMoneyEffect({
      amount: price,
      source: `Jugador ${current.token + 1}`,
      target: 'Compra de propiedad',
      kind: 'purchase',
      from: walletPoint(),
      to: { x: -15, y: 50 },
    })
    addMoneyMovement(price, 'salida', `Compra de ${propertyName}`)

    setNotice(`Has comprado ${propertyName}.`)
    setPendingProperty(null)
  }

  const buyLotteryTicket = () => {
    if (lotteryPosition === null || current.money < 20) return
    updateCurrent({ money: current.money - 20 })
    setLotteryTicketBought(true)
    setMoneyEffect({ amount: 20, source: `Jugador ${current.token + 1}`, target: 'Billete de lotería', kind: 'purchase', from: walletPoint(), to: { x: 50, y: 50 } })
    addMoneyMovement(20, 'salida', 'Billete de lotería')
  }

  const rollLottery = () => {
    if (!lotteryTicketBought) return
    const result = Math.floor(Math.random() * 6) + 1
    setLotteryRoll(result)
    if (result === 6) {
      setPlayers((currentPlayers) => currentPlayers.map((player, index) => index === currentPlayer ? { ...player, money: player.money + 100 } : player))
      showMoneyEffect(100, 'Banco', `Jugador ${current.token + 1}`, 'gain', 0, current.position)
      addMoneyMovement(100, 'entrada', 'Premio de lotería')
    }
  }

  const closeLottery = () => {
    setLotteryPosition(null)
    setLotteryTicketBought(false)
    setLotteryRoll(null)
  }

  const declineProperty = () => {
    if (!pendingProperty) return
    setNotice(`Has decidido no comprar ${pendingProperty.name}.`)
    setPendingProperty(null)
  }

  const buyHouse = () => {
    const buildCost = managedProperty ? getBuildCost(managedProperty) : 0
    if (!managedProperty || current.money < buildCost) return

    const details = getPropertyDetails(managedProperty)
    if (details.houses >= 4 || details.hotel || details.mortgaged || !ownsCompleteGroup(managedProperty, current)) return

    setPlayers((currentPlayers) => currentPlayers.map((player, index) => index === currentPlayer ? { ...player, money: player.money - buildCost } : player))
    setPropertyDetails((currentDetails) => ({
      ...currentDetails,
      [managedProperty]: { ...details, houses: details.houses + 1 },
    }))
    setMoneyEffect({ amount: buildCost, source: `Jugador ${current.token + 1}`, target: 'Compra de casa', kind: 'purchase', from: walletPoint(), to: { x: 50, y: 50 } })
    addMoneyMovement(buildCost, 'salida', `Casa en ${managedProperty}`)
    setNotice(`Has comprado una casa para ${managedProperty}.`)
    setManagedProperty(null)
  }

  const buyHotel = () => {
    const hotelCost = managedProperty ? getHotelCost(managedProperty) : 0
    if (!managedProperty || current.money < hotelCost) return

    const details = getPropertyDetails(managedProperty)
    if (details.hotel || details.houses < 4 || details.mortgaged || !ownsCompleteGroup(managedProperty, current)) return

    setPlayers((currentPlayers) => currentPlayers.map((player, index) => index === currentPlayer ? { ...player, money: player.money - hotelCost } : player))
    setPropertyDetails((currentDetails) => ({
      ...currentDetails,
      [managedProperty]: { ...details, hotel: true },
    }))
    setMoneyEffect({ amount: hotelCost, source: `Jugador ${current.token + 1}`, target: 'Compra de hotel', kind: 'purchase', from: walletPoint(), to: { x: 50, y: 50 } })
    addMoneyMovement(hotelCost, 'salida', `Hotel en ${managedProperty}`)
    setNotice(`Has comprado un hotel para ${managedProperty}.`)
    setManagedProperty(null)
  }

  const mortgageProperty = () => {
    if (!managedProperty) return

    const details = getPropertyDetails(managedProperty)
    if (details.mortgaged) return
    const property = spaces.find((space) => space.name === managedProperty)
    const amount = Math.floor((property?.price ?? 0) / 2)

    setPlayers((currentPlayers) => currentPlayers.map((player, index) => index === currentPlayer ? { ...player, money: player.money + amount } : player))
    setPropertyDetails((currentDetails) => ({
      ...currentDetails,
      [managedProperty]: { ...details, mortgaged: true },
    }))
    setMoneyEffect({ amount, source: 'Hipoteca', target: `Jugador ${current.token + 1}`, kind: 'gain', from: { x: 50, y: 50 }, to: walletPoint() })
    addMoneyMovement(amount, 'entrada', `Hipoteca de ${managedProperty}`)
    setNotice(`Has hipotecado ${managedProperty} por ${amount} €.`)
    setManagedProperty(null)
  }

  const createPropertyOffer = () => {
    if (!managedProperty || offerTargetId === null) return
    const property = spaces.find((space) => space.name === managedProperty)
    const price = Number(offerPrice)
    if (!property || !Number.isFinite(price) || price <= 0) return

    setPropertyOffer({ property: managedProperty, price, sellerId: current.id, buyerId: offerTargetId })
    setManagedProperty(null)
    setOfferTargetId(null)
    setOfferPrice('')
  }

  const rejectPropertyOffer = () => {
    setPropertyOffer(null)
    setNotice('La oferta de propiedad ha sido rechazada.')
  }

  const acceptPropertyOffer = () => {
    if (!propertyOffer) return
    const buyer = players.find((player) => player.id === propertyOffer.buyerId)
    const seller = players.find((player) => player.id === propertyOffer.sellerId)
    if (!buyer || !seller || buyer.money < propertyOffer.price) return

    setPlayers((currentPlayers) => currentPlayers.map((player) => {
      if (player.id === buyer.id) return { ...player, money: player.money - propertyOffer.price, properties: [...player.properties, propertyOffer.property] }
      if (player.id === seller.id) return { ...player, money: player.money + propertyOffer.price, properties: player.properties.filter((property) => property !== propertyOffer.property) }
      return player
    }))
    setMoneyEffect({ amount: propertyOffer.price, source: `Jugador ${buyer.token + 1}`, target: `Jugador ${seller.token + 1}`, kind: 'payment', from: { x: 50, y: 50 }, to: { x: 50, y: 50 } })
    addMoneyMovement(propertyOffer.price, 'entrada', `Venta de ${propertyOffer.property}`)
    setNotice(`${propertyOffer.property} se ha vendido por ${propertyOffer.price} €.`)
    setPropertyOffer(null)
  }

  const handleLuck = () => {
    if (!luckCard) return

    const card = luckCard

    if (card.action === 'collect') {
      updateCurrent({ money: current.money + 100 })
      showMoneyEffect(100, 'Carta de Suerte', `Jugador ${current.token + 1}`, 'gain', current.position, current.position)
      addMoneyMovement(100, 'entrada', 'Premio de Suerte')
      setNotice('La lotería te da 100 €.')
    }

    if (card.action === 'pay-all') {
      const amount = 100
      const others = players.filter((player) => player.id !== current.id)
      const totalPaid = others.length * amount
      setPlayers((currentPlayers) => currentPlayers.map((player) => {
        if (player.id === current.id) return { ...player, money: player.money - totalPaid }
        return { ...player, money: player.money + amount }
      }))
      setMoneyEffect({ amount: totalPaid, source: `Jugador ${current.token + 1}`, target: 'Todos los jugadores', kind: 'payment', from: { x: 50, y: 50 }, to: { x: 50, y: 50 } })
      addMoneyMovement(totalPaid, 'salida', 'Pago a todos por carta')
      setNotice(`Has pagado ${amount} € a cada jugador.`)
    }

    if (card.action === 'collect-all') {
      const amount = 100
      const others = players.filter((player) => player.id !== current.id)
      const totalPaid = others.length * amount
      setPlayers((currentPlayers) =>
        currentPlayers.map((player) =>
          player.id === current.id ? { ...player, money: player.money + totalPaid } : { ...player, money: player.money - amount },
        ),
      )
      setMoneyEffect({ amount: totalPaid, source: 'Todos los jugadores', target: `Jugador ${current.token + 1}`, kind: 'gain', from: { x: 50, y: 50 }, to: { x: 50, y: 50 } })
      addMoneyMovement(totalPaid, 'entrada', 'Cobro de otros jugadores')
      setNotice(`Todos los jugadores te pagan ${amount} €.`)
    }

    if (card.action === 'start') {
      updateCurrent({ position: 0 })
      setNotice('Vuelves al principio del tablero.')
    }

    if (card.action === 'jail') {
      updateCurrent({ position: jailPosition, jailed: true })
      setNotice('Te envían a la cárcel.')
    }

    if (card.action === 'extra-turn') {
      setExtraTurn(true)
      setDice([])
      setNotice('Tira otra vez.')
    }

    setLuckCard(null)
  }

  const finishTurn = () => {
    if (!dice.length || movement || pendingProperty || moneyPrompt || luckCard) return

    if (extraTurn) {
      setExtraTurn(false)
      setDice([])
      setNotice('Tienes un turno extra. Vuelve a tirar.')
      return
    }

    if (current.money < 0) {
      setPlayers((currentPlayers) =>
        currentPlayers.map((player, index) =>
          index === currentPlayer ? { ...player, bankrupt: true } : player,
        ),
      )
    }

    if (mode === 'express' && turns + 1 >= 30) {
      setStage('ranking')
      return
    }

    nextTurn()
  }

  const visibleBoard = spaces.map((space, index) => ({ ...space, index, rect: logicalBoardRects[index] ?? logicalBoardRects[0] }))

  const getTokenPosition = (player: Player) => {
    if (!movement || movement.playerId !== player.id) {
      return player.position
    }

    return movement.path[Math.min(movement.index, movement.path.length - 1)] ?? player.position
  }

  if (stage === 'setup' || stage === 'tokens') {
    return (
      <main className="monopoly-page">
        <header className="monopoly-header">
          <button className="monopoly-back" type="button" onClick={onBack} aria-label="Volver">
            <ArrowLeft size={19} />
          </button>
          <span>MONOPOLY SVC</span>
        </header>

        <section className="monopoly-setup">
          {stage === 'setup' ? (
            <>
              <p className="room-kicker">SANT VICENÇ DE CASTELLET</p>
              <h1>
                Prepara tu
                <br />
                <em>partida.</em>
              </h1>

              <div className="mode-picker">
                <button
                  type="button"
                  className={mode === 'normal' ? 'active' : ''}
                  onClick={() => setMode('normal')}
                >
                  <strong>Modo normal</strong>
                  <small>Juega hasta que quede un ganador.</small>
                </button>

                <button
                  type="button"
                  className={mode === 'express' ? 'active' : ''}
                  onClick={() => setMode('express')}
                >
                  <strong>Modo express</strong>
                  <small>30 turnos y gana el mayor patrimonio.</small>
                </button>

                <button
                  type="button"
                  className={mode === 'test' ? 'active' : ''}
                  onClick={() => setMode('test')}
                >
                  <strong>Modo prueba</strong>
                  <small>20.000 € y eliges cuánto avanzar.</small>
                </button>
              </div>

              {mode === 'test' && (
                <label className="test-dice-picker">
                  Avance del dado de prueba
                  <select value={testDiceValue} onChange={(event) => setTestDiceValue(Number(event.target.value))}>
                    {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} casilla{value === 1 ? '' : 's'}</option>)}
                  </select>
                </label>
              )}

              <label className="player-picker">
                Jugadores
                <select
                  value={playerCount}
                  onChange={(event) => setPlayerCount(Number(event.target.value))}
                >
                  {[2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>

              <button className="monopoly-primary" type="button" onClick={configurePlayers}>
                Elegir fichas
              </button>
            </>
          ) : (
            <>
              <p className="room-kicker">FICHAS DE LA PARTIDA</p>
              <h2>Elige tu ficha</h2>
              <p className="setup-copy">Cada jugador tendrá un número distinto.</p>

              <div className="token-picker">
                {tokens.slice(0, playerCount).map((token) => (
                  <button
                    key={token}
                    type="button"
                    className={selectedToken === Number(token) - 1 ? 'selected' : ''}
                    onClick={() => chooseToken(Number(token) - 1)}
                  >
                    <span>{token}</span>
                    <small>Jugador {token}</small>
                  </button>
                ))}
              </div>

              <button
                className="monopoly-primary"
                type="button"
                onClick={() => selectedToken !== null && setStage('game')}
                disabled={selectedToken === null}
              >
                Empezar partida
              </button>
            </>
          )}
        </section>
      </main>
    )
  }

  if (stage === 'ranking') {
    return (
      <main className="monopoly-page ranking-page">
        <Sparkles size={32} />
        <p className="room-kicker">FIN DE LA PARTIDA</p>
        <h1>Clasificación final</h1>

        <div className="ranking-list">
          {[...players]
            .sort((a, b) => b.money - a.money)
            .map((player, index) => (
              <div key={player.id}>
                <b>#{index + 1}</b>
                <span>Jugador {player.token + 1}</span>
                <strong>{Math.max(0, player.money)} €</strong>
              </div>
            ))}
        </div>

        <button className="monopoly-primary" type="button" onClick={onBack}>
          Volver a la sala
        </button>
      </main>
    )
  }

  return (
    <main className="monopoly-page game-monopoly-page">
      <header className="monopoly-header">
        <button className="monopoly-back" type="button" onClick={onBack} aria-label="Salir">
          <ArrowLeft size={19} />
        </button>

        <div>
          <span>MONOPOLY SVC</span>
          <small>{mode === 'express' ? 'MODO EXPRESS' : mode === 'test' ? 'MODO PRUEBA' : 'MODO NORMAL'} · TURNO {turns + 1}</small>
        </div>

        <div className="monopoly-turn">JUGADOR {current.token + 1}</div>
      </header>

      <section className="monopoly-layout">
        <div className="monopoly-board" aria-label="Tablero de Monopoly SVC">
          {visibleBoard.map((space) => (
            <button
              key={`${space.name}-${space.index}`}
              type="button"
              className={`monopoly-space ${space.kind} ${current.position === space.index ? 'current-space' : ''}`}
              style={
                {
                  '--space-color': space.color ?? 'transparent',
                  left: `${space.rect.x}%`,
                  top: `${space.rect.y}%`,
                  width: `${space.rect.w}%`,
                  height: `${space.rect.h}%`,
                } as CSSProperties
              }
            >
              <span className="space-color" />
              <small>{space.name}</small>
              {space.price ? <b>{space.price} €</b> : null}
              {owned.get(space.name) && (
                <i>
                  J{(players.find((player) => player.name === owned.get(space.name))?.token ?? 0) + 1}
                </i>
              )}
            </button>
          ))}

          {players.map((player) => {
            const displayPosition = getTokenPosition(player)
            const playerRect = logicalBoardRects[displayPosition] ?? logicalBoardRects[0]
            const playerCenter = tokenCenters[displayPosition] ?? tokenCenters[0]
            return (
              <span
                key={player.id}
                className={`monopoly-token monopoly-token-${player.token}`}
                style={{
                  left: `${playerCenter.x}%`,
                  top: `${playerCenter.y}%`,
                  width: `${Math.max(2.8, playerRect.w * 0.36)}%`,
                  height: `${Math.max(2.8, playerRect.h * 0.36)}%`,
                }}
              >
                {player.token + 1}
              </span>
            )
          })}

          {luckAnimation && (
            <div
              className="luck-card-fly"
              style={
                {
                  left: `${boardPoint(luckAnimation.position).x}%`,
                  top: `${boardPoint(luckAnimation.position).y}%`,
                } as CSSProperties
              }
            >
              <strong>SUERTE</strong>
              <span>{luckAnimation.card.title}</span>
            </div>
          )}

          {moneyEffect && (
            <div
              className={`money-effect money-effect-${moneyEffect.kind}`}
              aria-live="polite"
              style={
                {
                  '--from-x': `${moneyEffect.from.x}%`,
                  '--from-y': `${moneyEffect.from.y}%`,
                  '--to-x': `${moneyEffect.to.x}%`,
                  '--to-y': `${moneyEffect.to.y}%`,
                } as CSSProperties
              }
            >
              <div className="money-effect-bills">
                {billValues(moneyEffect.amount).map((bill, index) => (
                  <img
                    key={`${moneyEffect.amount}-${bill}-${index}`}
                    src={`/billetes/${bill}.png`}
                    alt={`${bill} euros`}
                  />
                ))}
              </div>
              <small>
                {moneyEffect.source} → {moneyEffect.target}
              </small>
            </div>
          )}

          {bankCash > 0 && (
            <div className="board-cash" aria-label={`Caja del tablero: ${bankCash} euros`}>
              <div className="board-cash-bills">
                {billValues(bankCash).map((bill, index) => (
                  <img key={`${bill}-${index}`} src={`/billetes/${bill}.png`} alt={`${bill} euros en la caja`} />
                ))}
              </div>
              <span>{bankCash}€</span>
              <small>Caja</small>
            </div>
          )}
        </div>

        <aside className="monopoly-side">
          <details className="legend-panel">
            <summary>Leyenda de alquileres</summary>
            <div className="legend-list">
              {Object.values(economyGroups).map((group) => (
                <button key={group.level} type="button" className="legend-group-button" onClick={() => setSelectedEconomyGroup(group)}>
                  <span className={`legend-swatch legend-swatch-${group.level}`} />
                  <span>{group.label}</span>
                  <b>Ver precios</b>
                </button>
              ))}
              <div className="legend-railway"><span className="legend-swatch legend-swatch-railway" />Trenes · grupo gris · sin alquiler</div>
            </div>
          </details>
          <div ref={walletRef} className="money-card">
            <Wallet size={18} />
            <span>Tu dinero</span>
            <strong>{current.money} €</strong>
            <div className="money-history">
              <h3>Últimos movimientos</h3>
              {(moneyMovements[current.id] ?? []).length ? (moneyMovements[current.id] ?? []).map((movement) => (
                <div className="money-history-row" key={movement.id}>
                  <span className={`movement-sign movement-${movement.direction}`}>
                    {movement.direction === 'entrada' ? '+' : '-'}{movement.amount} €
                  </span>
                  <small>{movement.label}</small>
                </div>
              )) : <small className="money-history-empty">Todavía no hay movimientos.</small>}
            </div>
          </div>

          <div className="turn-card">
            {current.jailed ? (
              <p className="notice jail-notice">Turno bloqueado. La cárcel está saltando automáticamente tus dos turnos.</p>
            ) : (
              <>
                <p>Es tu turno, Jugador {current.token + 1}</p>
                <button
                  className="dice-button"
                  type="button"
                  onClick={rollDice}
                  disabled={Boolean(dice.length || pendingProperty || moneyPrompt || managedProperty || propertyOffer || luckCard || movement)}
                >
                  <Dice5 size={22} />
                  Tirar dados {dice.length > 0 && <b>{dice.join(' + ')}</b>}
                </button>
                <p className="notice">{notice}</p>
              </>
            )}
          </div>

          <details className="properties-panel">
            <summary>
              <Home size={17} /> Mis propiedades <b>{current.properties.length}</b>
            </summary>

            {current.properties.length ? (
              current.properties.map((property) => {
                const details = getPropertyDetails(property)
                return (
                  <div className="property-row" key={property}>
                    <span>
                      {property}
                      {details.hotel ? ' · Hotel' : details.houses ? ` · ${details.houses} casa${details.houses > 1 ? 's' : ''}` : ''}
                      {details.mortgaged ? ' · Hipotecada' : ''}
                    </span>
                    <button type="button" onClick={() => setManagedProperty(property)}>Gestionar</button>
                  </div>
                )
              })
            ) : (
              <small>No tienes propiedades aún.</small>
            )}
          </details>

          <button className="finish-monopoly-turn" type="button" onClick={finishTurn} disabled={current.jailed || !dice.length || Boolean(movement || pendingProperty || moneyPrompt || luckCard)}>
            Terminar turno
          </button>
        </aside>
      </section>

      {pendingProperty && (
        <div className="monopoly-modal">
          <div className="monopoly-dialog">
            <p className="room-kicker">PROPIEDAD DISPONIBLE</p>
            <h2>{pendingProperty.name}</h2>
            <strong>{pendingProperty.price} €</strong>
            <p>¿Quieres comprar esta propiedad antes de seguir con el turno?</p>
            <div>
              <button type="button" onClick={buyProperty}>
                Comprar
              </button>
              <button type="button" onClick={declineProperty}>
                No comprar
              </button>
            </div>
          </div>
        </div>
      )}

      {moneyPrompt && (
        <div className="monopoly-modal money-prompt-modal">
          <div className="monopoly-dialog money-prompt-dialog">
            <p className="room-kicker">MOVIMIENTO DE DINERO</p>
            <h2>{moneyPrompt.title}</h2>
            <strong>{moneyPrompt.amount} €</strong>
            <p>{moneyPrompt.description}</p>
            <button type="button" onClick={confirmMoney}>{moneyPrompt.button}</button>
          </div>
        </div>
      )}

      {lotteryPosition !== null && (
        <div className="monopoly-modal">
          <div className="monopoly-dialog lottery-dialog">
            <p className="room-kicker">LOTERÍA</p>
            <h2>Billete de lotería</h2>
            {!lotteryTicketBought ? (
              <>
                <strong>20 €</strong>
                <p>Compra un billete y tira un dado. Si sacas un 6, recibes 100 € del banco.</p>
                <button type="button" onClick={buyLotteryTicket} disabled={current.money < 20}>Comprar billete · 20 €</button>
              </>
            ) : (
              <>
                <p>Tu billete está comprado. Tira el dado.</p>
                <strong>{lotteryRoll ?? '?'}</strong>
                {!lotteryRoll && <button type="button" onClick={rollLottery}>Tirar dado</button>}
                {lotteryRoll === 6 && <p>¡Has sacado un 6! Cobras 100 €.</p>}
                {lotteryRoll !== null && lotteryRoll !== 6 && <p>No ha salido un 6. El billete no tiene premio.</p>}
                {lotteryRoll !== null && <button type="button" className="secondary-action" onClick={closeLottery}>Cerrar</button>}
              </>
            )}
          </div>
        </div>
      )}

      {managedProperty && (
        <div className="monopoly-modal">
          <div className="monopoly-dialog property-manager-dialog">
            <p className="room-kicker">GESTIONAR PROPIEDAD</p>
            <h2>{managedProperty}</h2>
            <p>
              {spaces.find((space) => space.name === managedProperty)?.railway
                ? 'Tren'
                : `Nivel ${spaces.find((space) => space.name === managedProperty)?.level ?? '-'}`}
              {' · '}{getPropertyDetails(managedProperty).houses} casas · {getPropertyDetails(managedProperty).hotel ? 'Tiene hotel' : 'Sin hotel'} · {getPropertyDetails(managedProperty).mortgaged ? 'Hipotecada' : 'Sin hipoteca'}
            </p>
            {getMissingGroupProperties(managedProperty).length > 0 && (
              <p className="property-rule-note">
                Para construir necesitas todo el grupo. Te falta: {getMissingGroupProperties(managedProperty).join(', ')}.
              </p>
            )}
            <div className="property-actions">
              <button type="button" disabled={getPropertyDetails(managedProperty).houses >= 4 || getPropertyDetails(managedProperty).hotel || getPropertyDetails(managedProperty).mortgaged || !ownsCompleteGroup(managedProperty, current) || current.money < getBuildCost(managedProperty)} onClick={buyHouse}>Comprar casa · {getBuildCost(managedProperty)} €</button>
              <button type="button" disabled={getPropertyDetails(managedProperty).houses < 4 || getPropertyDetails(managedProperty).hotel || getPropertyDetails(managedProperty).mortgaged || !ownsCompleteGroup(managedProperty, current) || current.money < getHotelCost(managedProperty)} onClick={buyHotel}>Comprar hotel · {getHotelCost(managedProperty)} €</button>
              <label>Vender a jugador
                <select value={offerTargetId ?? ''} onChange={(event) => setOfferTargetId(event.target.value ? Number(event.target.value) : null)}>
                  <option value="">Seleccionar jugador</option>
                  {players.filter((player) => player.id !== current.id).map((player) => <option key={player.id} value={player.id}>Jugador {player.token + 1}</option>)}
                </select>
              </label>
              <label>Precio de venta (€)
                <input type="number" min="1" value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} placeholder="Ej. 150" />
              </label>
              <button type="button" disabled={offerTargetId === null || !offerPrice || Number(offerPrice) <= 0} onClick={createPropertyOffer}>Enviar oferta de venta</button>
              <button type="button" disabled={getPropertyDetails(managedProperty).mortgaged} onClick={mortgageProperty}>Hipotecar propiedad</button>
              <button type="button" className="secondary-action" onClick={() => setManagedProperty(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {propertyOffer && (
        <div className="monopoly-modal">
          <div className="monopoly-dialog property-offer-dialog">
            <p className="room-kicker">OFERTA DE PROPIEDAD</p>
            <h2>Jugador {(players.find((player) => player.id === propertyOffer.sellerId)?.token ?? 0) + 1} te ofrece:</h2>
            <strong>{propertyOffer.property}</strong>
            <p>Precio de venta</p>
            <strong>{propertyOffer.price} €</strong>
            <div>
              <button type="button" onClick={acceptPropertyOffer} disabled={(players.find((player) => player.id === propertyOffer.buyerId)?.money ?? 0) < propertyOffer.price}>Comprar</button>
              <button type="button" className="secondary-action" onClick={rejectPropertyOffer}>Rechazar</button>
            </div>
          </div>
        </div>
      )}

      {selectedEconomyGroup && (
        <div className="monopoly-modal economy-card-modal" onClick={() => setSelectedEconomyGroup(null)}>
          <article className={`economy-card economy-card-level-${selectedEconomyGroup.level}`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="economy-card-close" onClick={() => setSelectedEconomyGroup(null)} aria-label="Cerrar carta">×</button>
            <p className="room-kicker">TABLA DE ECONOMÍA</p>
            <div className={`economy-card-band economy-band-${selectedEconomyGroup.level}`} />
            <h2>{selectedEconomyGroup.label}</h2>
            <div className="economy-card-prices">
              <div><small>Compra</small><strong>{selectedEconomyGroup.price} €</strong></div>
                  <div><small>Casa</small><strong>{selectedEconomyGroup.buildCost} €</strong></div>
                  <div><small>Hotel</small><strong>{selectedEconomyGroup.hotelCost} €</strong></div>
            </div>
            <div className="economy-rent-table">
              <div><span>Sin casas</span><b>{selectedEconomyGroup.rents[0]} €</b></div>
              <div><span>Monopolio</span><b>{selectedEconomyGroup.rents[0] * 2} €</b></div>
              <div><span>1 casa</span><b>{selectedEconomyGroup.rents[1]} €</b></div>
              <div><span>2 casas</span><b>{selectedEconomyGroup.rents[2]} €</b></div>
              <div><span>3 casas</span><b>{selectedEconomyGroup.rents[3]} €</b></div>
              <div><span>4 casas</span><b>{selectedEconomyGroup.rents[4]} €</b></div>
              <div><span>Hotel</span><b>{selectedEconomyGroup.rents[5]} €</b></div>
            </div>
          </article>
        </div>
      )}

      {luckCard && (
        <div className="monopoly-modal">
          <div className="monopoly-dialog luck-dialog">
            <p className="room-kicker">CARTA DE SUERTE</p>
            <h2>{luckCard.title}</h2>
            <p>{luckCard.text}</p>
            <button type="button" onClick={handleLuck}>
              Aceptar
            </button>
          </div>
        </div>
      )}

    </main>
  )
}

export { Monopoly }
