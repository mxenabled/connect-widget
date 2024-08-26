import { setupServer } from 'msw/node'
import { testServerHandlers } from './testServerHandlers'

export const server = setupServer(...testServerHandlers)
// server.events.on('request:start', ({ request }: any) => {
//   console.log('MSW intercepted:', request.method, request.url)
// })
