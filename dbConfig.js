let db;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  autoReconnect: true,
  poolSize: 10,
  keepAlive: 1,
  connectTimeoutMS: 30000
});

module.exports = client;
