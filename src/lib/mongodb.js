import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined in environment variables')
}


let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, listenersAdded: false }
}

const connectDb = async () => {
  if (cached.conn) {
    console.log('✅ MongoDB already connected')
    return cached.conn
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', false)
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
  }

  cached.conn = await cached.promise
  console.log('✅ Mongoose connected to MongoDB')

  // Add listeners only once
  if (!cached.listenersAdded) {
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected')
      cached.conn = null
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
      cached.conn = null
    })

    process.once('SIGINT', gracefulShutdown)
    process.once('SIGTERM', gracefulShutdown)
    cached.listenersAdded = true
  }

  return cached.conn
}

const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close()
    console.log('🛑 Mongoose connection closed gracefully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error)
    process.exit(1)
  }
}

export default connectDb
