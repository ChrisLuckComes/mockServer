let router = require("express").Router();
let client = require("../dbConfig");
let db, instance, parameter;

client.connect((err, c) => {
  if (err) {
    console.log(err);
  } else {
    db = c.db("redis");
    instance = db.collection("instance");
    parameter = db.collection("parameter");
  }
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
      if (err) {
        console.log(err);
        res.send({ code: 1001, message: "fail" });
      } else {
        instance.countDocuments(function(err, count) {
          res.send({
            code: 1000,
            data: { list: docs, count: count }
          });
        });
      }
    });
});

router.put("/instances", (req, res, next) => {
  instance.updateOne(
    { instanceId: req.query.instanceId },
    { $set: { storageLimit: req.query.storageLimit } },
    (err, doc) => {
      if (err) {
        res.send({ code: 1001, message: "扩容失败" });
      } else {
        res.send({ code: 1000, message: "扩容成功" });
      }
    }
  );
});

router.delete("/instances", (req, res) => {
  instance.deleteOne({ instanceId: req.body.instanceId }, (err, doc) => {
    if (err) {
      res.send({ code: 1001, message: "删除失败" });
    } else {
      res.send({ code: 1000, message: "删除成功" });
    }
  });
});

router.get("/parameters", (req, res) => {
  parameter.find({}).toArray((err, docs) => {
    if (err) {
      res.send({ code: 1001, message: "获取参数信息失败" });
    } else {
      res.send({ code: 1000, data: docs });
    }
  });
});

router.put("/parameters", (req, res) => {
  parameter.updateOne(
    { name: req.query.name },
    { $set: { running: req.query.running } },
    err => {
      if (err) {
        res.send({ code: 1001, message: "修改参数失败" });
      } else {
        res.send({ code: 1000, message: "修改成功" });
      }
    }
  );
});

module.exports = router;
