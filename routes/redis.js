let router = require("express").Router();
let db = require("../dataStore").redis;

db.loadDatabase();

router.post("/getInstanceList", (req, res, next) => {
  db.find({}, (err, docs) => {
    // res.send(docs);
  });
  // res.send(instanceList);
});

router.post("/addInstance", (req, res, next) => {
  console.log(req.body);
  db.insert(req.body);
  res.send("Inserted" + req.body.id);
});

module.exports = router;
