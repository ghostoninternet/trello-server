import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

// Initialize a trelloDatabaseInstance object equal null (because we haven't connected yet)
let trelloDatabaseInstance = null

// Initialize a MongoClient instance to connect to MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Note: serverApi only available to MongoDB version 5.0.0 and above, we may not need to use it, but if
  // we use it then it will specify a Stable API Version of MongoDB
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Connect to database
export const CONNECT_DB = async () => {
  // Connect to Mongo Atlas with the given URI inside mongoClientInstance
  await mongoClientInstance.connect()

  // After successfully connected to Mongo Atlas, we will take the Database that we want by providing
  // the database name to db() method of mongoClientInstance and assign it to trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// function GET_DB (no async/await) will return trelloDatabaseInstance after it has successfully connected
// to MongoDB so we will be able to use the Database in many places of our server.
// Note: Must only call GET_DB after successfully connected to MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first!')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  console.log('Disconnecting Database....')
  await mongoClientInstance.close()
}