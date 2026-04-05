import { createApp } from './app'
import { env } from './config/env'

const app = createApp().listen(env.port)

console.log(`API: http://localhost:${env.port}`)

export type AppInstance = typeof app
