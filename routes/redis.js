let router = require("express").Router();
let client = require("../dbConfig");
let db, instance, parameter, slowQuery;

client.connect((err, c) => {
  if (err) {
    console.log(err);
  } else {
    db = c.db("redis");
    instance = db.collection("instance");
    parameter = db.collection("parameter");
    slowQuery = db.collection("slowQuery");
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
  let count;
  instance.countDocuments(query, (err, num) => {
    count = num;
    instance
      .find(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray(function(err, docs) {
        if (err) {
          console.log(err);
          res.status(500).send({ status: 1001, message: "查询失败" });
        } else {
          res.send({
            code: 1000,
            data: { list: docs, count: count }
          });
        }
      });
  });
});

router.put("/instances", (req, res, next) => {
  let setObj = {
    $set: {}
  };
  let message, errorMessage;
  let storageLimit = req.query.storageLimit;
  let password = req.query.password;
  if (storageLimit) {
    setObj.$set.storageLimit = storageLimit;
    message = "扩容成功";
    errorMessage = "扩容失败";
  }
  if (password) {
    setObj.$set.password = password;
    message = "修改密码成功";
    errorMessage = "修改密码失败";
  }
  instance.updateOne(
    { instanceId: req.query.instanceId },
    setObj,
    (err, doc) => {
      if (err) {
        res.status(500).send({ code: 1001, message: errorMessage });
      } else {
        res.send({ code: 1000, message: message });
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

router.get("/slowQuerys", (req, res) => {
  let page = req.query.page - 1;
  let pageSize = +req.query.pageSize;
  let query = {};
  let count;
  slowQuery.countDocuments(query, (err, num) => {
    count = num;
    slowQuery
      .find(query)
      .skip(page * pageSize)
      .limit(pageSize)
      .toArray(function(err, docs) {
        if (err) {
          console.log(err);
          res.status(500).send({ code: 1001, message: "查询失败" });
        } else {
          res.send({
            code: 1000,
            data: { list: docs, count: count }
          });
        }
      });
  });
});

module.exports = router;
