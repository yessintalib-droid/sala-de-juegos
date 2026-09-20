const SERVER_HOST = import.meta.env.VITE_SERVER_URL

export const SERVER_HTTP = SERVER_HOST ? `https://${SERVER_HOST}` : 'http://localhost:8787'
export const SERVER_WS = SERVER_HOST ? `wss://${SERVER_HOST}` : 'ws://localhost:8787'
