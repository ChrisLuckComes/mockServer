let router = require("express").Router();
let db = require("../dataStore").redis;

db.loadDatabase();

router.post("/getInstanceList", (req, res, next) => {
  let area = req.body.area;
  let page = req.body.page - 1;
  let pageSize = req.body.pageSize;
  db.find(
    { instanceList: { area: area } }.skip(page * pageSize).limit(pageSize)
  ).exec((err, docs) => {
    if (err) {
      // console.log(err);
      // res.end({ code: 1001, msg: "fail" });
      next(err)
    }
    res.send({ code: 1000, data: docs });
  });
});

router.post("/addInstance", (req, res, next) => {
  console.log(req.body);
  db.insert({ instanceList: { $push: req.body } });
  res.send("Inserted:" + req.body.id);
});

module.exports = router;
