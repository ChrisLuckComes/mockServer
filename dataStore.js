let Datastore = require("nedb");

let db = { lb: {} };
db.redis = new Datastore("./data/redis.db");
db.area = new Datastore("./data/area.db");
db.system = new Datastore("./data/system.db");
db.os = new Datastore("./data/os.db");
db.lb.instance = new Datastore("./data/lb/instance.db");
db.lb.watcher = new Datastore("./data/lb/watcher.db");
db.lb.watchData = new Datastore("./data/lb/watchData.db");
db.lb.osWatcher = new Datastore("./data/lb/os-watcher.db");

module.exports = db;
