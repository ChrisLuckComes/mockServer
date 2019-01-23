let Datastore = require("nedb");

let db = {};
db.redis = new Datastore("./data/redis.db");
db.lb = new Datastore("./data/lb.db");

module.exports = db;
