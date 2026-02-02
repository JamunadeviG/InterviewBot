const router = require("express").Router();

router.get("/", (req, res) => {
  res.json(["Software Engineer", "Data Analyst", "ML Engineer"]);
});

module.exports = router;
