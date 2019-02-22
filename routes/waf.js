let router = require("express").Router();
let client = require("../dbConfig");
let db, instance;
client.connect((err, c) => {
  if (err) {
    console.log(err);
  } else {
    db = c.db("waf");
    instance = db.collection("instance");
  }
});

router.get("/instances", (req, res) => {
  let name = req.query.name;
  let page = req.query.page - 1;
  let pageSize = +req.query.pageSize;

  let query = {};
  if (name) {
    query.name = new RegExp(name);
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

module.exports = router;
