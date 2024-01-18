// LIU Minghao, ZHANG Wengyu
import { MongoClient, ServerApiVersion } from 'mongodb'; 
import config from './config.js'; 

const connect_uri = config.CONNECTION_STR; 

const dbName = "eie4432_concert_db"

const client = new MongoClient(connect_uri, {   
  connectTimeoutMS: 2000,   
  serverSelectionTimeoutMS: 2000,  
  serverApi: {     
    version: ServerApiVersion.v1,     
    strict: true,     
    deprecationErrors: true,   
  }, 
}); 

async function connect() {   
  try {
    await client.connect();
    await client.db(dbName).command({ping: 1});
    console.log('Successfully connected to the database!');   
  } catch (err) {     
    console.log("Unable to establish connection to the database!");
    process.exit(1);
  } 
} 

connect().catch(console.dir); 

export default client;