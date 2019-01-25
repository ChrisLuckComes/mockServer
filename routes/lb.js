let router = require("express").Router();
let db = require("../dataStore").lb;
let uuidv1 = require("uuid/v1");

db.loadDatabase();

router.post("/getInstanceList", (req, res, next) => {
  let area = req.body.area;
  let page = req.body.page - 1;
  let pageSize = req.body.pageSize;
  db.find(
    {
      "instanceList.area": area
    },
    { instanceList: 1 }
  )
    .skip(page * pageSize)
    .limit(pageSize)
    .exec(function(err, docs) {
      if (err) {
        console.log(err);
        res.send({ code: 1001, message: "fail" });
      }
      res.send({
        code: 1000,
        data: docs.length > 0 ? docs[0].instanceList : []
      });
    });
});

router.post("/addInstance", (req, res, next) => {
  console.log(req.body);
  db.insert({ instanceList: { $push: req.body } });
  res.send({ code: 1000, message: "新增实例成功" });
});

router.post("/addWatcher", (req, res, next) => {
  console.log(req.body);
  let w = req.body;
  w.id = uuidv1();
  db.update(
    { _id: "oQKRQmxJPpIvNZAV" },
    { $addToSet: { watchers: w } },
    (err, doc) => {
      console.log(err);
      if (err) {
        console.log(err);
        res.send({ code: 1001, message: "新增监听器失败" });
      } else {
        console.log(doc);
        res.send({ code: 1000, message: "新增监听器成功" });
      }
    }
  );
});

router.post("/getWatchers", (req, res, next) => {
  db.find(
    {
      "watchers.instanceId": req.body.instanceId
    },
    { watchers: 1 }
  ).exec((err, docs) => {
    if (err) {
      console.log(err);
      res.send({ code: 1001, message: "fail" });
    }
    res.send({
      code: 1000,
      data: docs.length > 0 ? docs[0].watchers : []
    });
  });
});

module.exports = router;
