/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import socketIo from 'socket.io'
import http from 'http'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'
import { inviteUserToBoardSocket } from '~/sockets/inviteUserToBoardSocket'

const START_SERVER = () => {
  const app = express()

  // Fix from disk cache of ExpressJS
  // https://stackoverflow.com/a/53240717/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Config cookie parser
  app.use(cookieParser())

  // Enable CORS with options from corsOptions in config/cors.js
  app.use(cors(corsOptions))

  // Enable JSON parsing for request body
  app.use(express.json())

  // Use APIs_V1
  app.use('/v1', APIs_V1)

  // Middleware to handle error
  app.use(errorHandlingMiddleware)

  // Create new server wrap Express server to make realtime feature using SocketIO
  const server = http.createServer(app)
  const io = socketIo(server, {
    cors: corsOptions
  })

  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    // Production environment (supported by Render)
    server.listen(process.env.PORT, () => {
      console.log(`Production: Hello ${env.AUTHOR}, I am running at Port: ${process.env.PORT}`)
    })
  } else {
    // Dev environment
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Hello ${env.AUTHOR}, I am running at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  // Doing cleanup before shutdown the server
  exitHook((signal) => {
    console.log('Closing connection to Database....')
    CLOSE_DB()
    console.log('Successfully closed connection to Database!')
  })
}

CONNECT_DB()
  .then(() => console.log('Connected to Mongo Atlas'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })