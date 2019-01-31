let router = require("express").Router();
let client = require("../dbConfig");
let db, instance

client.connect((err, c) => {
  if (err) {
    console.log(err);
  } else {
    db = c.db("redis");
    instance = db.collection("instance");
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
        res.send({
          code: 1000,
          data: docs
        });
      }
    });
});

router.put("/instances", (req, res, next) => {
  console.log(req.query)
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


module.exports = router;
