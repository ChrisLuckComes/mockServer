let router = require("express").Router();
let client = require("../dbConfig");
let db, area, system;
client.connect((err, cli) => {
  if (err) {
    console.log(err);
  } else {
    db = cli.db("config");
    area = db.collection("area");
    system = db.collection("system");
  }
});

router.get("/area", (req, res) => {
  area.find({}).toArray((err, docs) => {
    if (err) {
      res.send({ code: 1001, message: "查询地区列表失败" });
    } else {
      res.send({ code: 1000, data: docs });
    }
  });
});

router.get("/system", (req, res) => {
  system.find({}).toArray((err, docs) => {
    if (err) {
      res.send({ code: 1001, message: "查询系统列表失败" });
    } else {
      res.send({ code: 1000, data: docs });
    }
  });
});

module.exports = router;
