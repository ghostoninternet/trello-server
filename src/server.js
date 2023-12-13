/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs_V1
  app.use('/v1', APIs_V1)

  // Middleware to handle error
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    // Production environment (supported by Render)
    app.listen(process.env.PORT, () => {
      console.log(`Production: Hello ${env.AUTHOR}, I am running at Port: ${process.env.PORT}`)
    })
  } else {
    // Dev environment
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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