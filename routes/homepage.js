var express = require('express');
var router = express.Router();
const { user_db_functions } = require('.././database/database_functions.js');


/* GET home page. */
router.get('/', function (req, res, next) {
  // https://avatars.dicebear.com/api/:pixel-art/:123123.svg
  const avatar_url = `https://avatars.dicebear.com/api/pixel-art/${Math.floor(Math.random() * 999999)
    }.svg`;
  res.render('homepage', { username: req.session.user.username, avatar_url: avatar_url });
});

router.get('/history', async function (req, res, next) {
  const history = await user_db_functions.getGameHistory(req.session.user.user_id);
  res.render('history', { user_id: req.session.user.user_id, username: req.session.user.username, history: history });
});

module.exports = router;
