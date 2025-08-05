const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let cachedDb = null;

async function connectDB() {
  try {
    if (cachedDb) {
      console.log("Usando conexão com o banco de dados em cache");
      return cachedDb;
    }
    if (process.env.NODE_ENV === 'development' || !process.env.MONGO_URI) {
      // Iniciar MongoDB em memória para desenvolvimento
      const mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      const db = await mongoose.connect(mongoUri);
      cachedDb = db;
      console.log("Conectado ao MongoDB em memória"); 
      return db;
    } else {
      // Conectar ao MongoDB real em produção
      const db = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      cachedDb = db;
      console.log('Conectado ao MongoDB');
    }
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
}

module.exports = connectDB;