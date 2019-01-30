let router = require("express").Router();
// let instance = require("../dataStore").lb.instance;
// let watcher = require("../dataStore").lb.watcher;
// let os = require("../dataStore").os;
// let watchData = require("../dataStore").lb.watchData;

// instance.loadDatabase();
// watcher.loadDatabase();
// os.loadDatabase();
// watchData.loadDatabase();
let db, instance, watcher, os, os_watcher;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url, {
  useNewUrlParser: true,
  autoReconnect: true,
  poolSize: 10,
  keepAlive: 1,
  connectTimeoutMS: 30000
});
client.connect((err, c) => {
  if (err) {
    console.log(err);
  } else {
    db = c.db("lb");
    instance = db.collection("instance");
    watcher = db.collection("watcher");
    os = db.collection("os");
    os_watcher = db.collection("os-watcher");
  }
});

let uuidv1 = require("uuid/v1");

router.post("/os", (req, res, next) => {
  console.log(req.body);
  let list = req.body.list;
  os_watcher.insertMany(list, (err, doc) => {
    if (err) {
      console.log(err);
      res.send({ code: 1001, message: "绑定失败" });
    } else {
      res.send({ code: 1000, message: "绑定成功" });
    }
  });
});

router.get("/os", (req, res, next) => {
  let ip = req.query.ip;
  let query = {};
  if (ip) {
    query.ip = ip;
  }

  os.find(query).toArray((err, docs) => {
    if (err) {
      res.send({ code: 1001, message: "查询失败" });
    } else {
      res.send({ code: 1000, data: docs });
    }
  });
});

router.get("/os-watcher", (req, res, next) => {
  let watcherId = req.query.watcherId;
  os_watcher.find({ watcherId: watcherId }).toArray((err, docs) => {
    if (err) {
      res.send({ code: 1001, message: "查询失败" });
    } else {
      res.send({ code: 1000, data: docs });
    }
  });
});

router.put("/os", (req, res, next) => {
  let port = req.query.port;
  let weight = req.query.weight;
  let instanceId = req.query.instanceId;
  let data = { $set: {} };
  if (port) {
    data.$set.port = port;
  }
  if (weight) {
    data.$set.weight = weight;
  }
  console.log(data);
  os.update({ instanceId: instanceId }, data, (err, doc) => {
    if (err) {
      res.send({ code: 1001, message: "修改失败" });
    } else {
      res.send({ code: 1000, message: "修改成功" });
    }
  });
});

router.delete("/os-watcher", (req, res, next) => {
  console.log(req.body)
  os_watcher.deleteOne(
    {
      ip: req.body.ip,
      port: req.body.port
    },
    (err, doc) => {
      if (err) {
        res.send({ code: 1001, message: "解绑失败" });
      } else {
        res.send({ code: 1000, message: "解绑成功" });
      }
    }
  );
});

router.get("/instances", (req, res, next) => {
  let area = req.query.area;
  let system = req.query.system;
  let page = req.query.page - 1;
  let pageSize = +req.query.pageSize;

  let query = {
    area: area
  };
  if (system) {
    query.system = system;
  }

  instance
    .find(query)
    .skip(page * pageSize)
    .limit(pageSize)
    .toArray(function(err, docs) {
      console.log(docs);
      if (err) {
        console.log(err);
        res.send({ code: 1001, message: "fail" });
      } else {
        res.send({
          code: 1000,
          data: docs
        });
      }
    });
});

router.post("/instances", (req, res, next) => {
  console.log(req.body);
  instance.insert(req.body);
  res.send({ code: 1000, message: "新增实例成功" });
});

router.put("/instances", (req, res, next) => {
  instance.updateOne(
    { id: req.query.id },
    { $set: { bandwidth: req.query.bandwidth } },
    (err, doc) => {
      if (err) {
        res.send({ code: 1001, message: "带宽升级失败" });
      } else {
        res.send({ code: 1000, message: "带宽升级成功" });
      }
      client.close();
    }
  );
});

router.post("/watchers", (req, res, next) => {
  console.log(req.body);
  let w = req.body;
  w.id = uuidv1();
  watcher.insertOne(w, (err, doc) => {
    console.log(err);
    if (err) {
      console.log(err);
      res.send({ code: 1001, message: "新增监听器失败" });
    } else {
      console.log(doc);
      res.send({ code: 1000, message: "新增监听器成功" });
    }
  });
});

router.get("/watchers", (req, res, next) => {
  let instanceId = req.query.instanceId;
  watcher
    .find({
      instanceId: instanceId
    })
    .toArray((err, docs) => {
      if (err) {
        console.log(err);
        res.send({ code: 1001, message: "fail" });
      } else {
        res.send({
          code: 1000,
          data: docs
        });
      }
    });
});

router.put("/watchers", (req, res, next) => {
  console.log(req.query);
  let id = req.query.id;
  let updateObj = { $set: { name: req.query.name } };
  if (req.query.hasOwnProperty("healthCheck")) {
    updateObj.$set.healthCheck = req.query.healthCheck;
    updateObj.$set.hold = req.query.hold;
  }
  console.log(updateObj);
  watcher.updateOne({ id: id }, updateObj, (err, doc) => {
    if (err) {
      console.log(err);
      res.send({ code: 1001, message: "编辑监听器失败" });
    } else {
      console.log(doc);
      res.send({ code: 1000, message: "编辑监听器成功" });
    }
  });
});

router.delete("/watchers", (req, res, next) => {
  watcher.remove({ id: req.body.id }, { multi: true }, (err, numremoved) => {
    if (err) {
      console.log(err);
      res.send({ code: 1001, message: "删除监听器失败" });
    } else {
      if (numremoved > 0) {
        res.send({ code: 1000, message: "删除监听器成功" });
      }
    }
  });
});

router.get("/watchDatas", (req, res, next) => {
  watchData.find({}, (err, docs) => {
    if (err) {
      res.send({ code: 1001, message: "查询监控数据失败" });
    } else {
      res.send({ code: 1000, data: docs });
    }
  });
});

module.exports = router;
