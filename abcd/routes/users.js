var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('./board1/login', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
