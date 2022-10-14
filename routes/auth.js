var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const { user_db_functions } = require('.././database/database_functions.js');

const hashPassword = (plaintext_password) => {
  let saltRounds = 10;
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(plaintext_password, salt, function (err, hash) {
        if (err) {
          reject(err);
        }
        return resolve(hash);
      });
    });
  });
}

/* GET users listing. */
router.get('/', async function (req, res, next) {
  return res.send("OK");
});

/* GET users listing. */
router.post('/signup', [check("username").not().isEmpty().isString().isLength({ min: 5 }),
check("password").not().isEmpty().isString().isLength({ min: 5 })], async function (req, res, next) {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ "register": "bad request" });
  }

  try {
    const password_hash = await hashPassword(req.body.password);
    const user = { ...req.body, ["password_hash"]: password_hash };
    await user_db_functions.addNewUser(user);
    return res.status(400).json({ "register": "success" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ "register": "fail" });
  }

});


router.post('/login', [check("username").not().isEmpty().isString().isLength({ min: 5 }),
check("password").not().isEmpty().isString().isLength({ min: 5 })], async function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.redirect('/');
  }

  const login_data = { ...req.body };

  try {
    const db_user = await user_db_functions.getUser(login_data.username);
    if (db_user === undefined || db_user[0] === undefined) {
      return res.status(400).json({ "login": "fail 1" });
    }

    bcrypt.compare(login_data.password, db_user[0].password_hash, function (err, result) {
      if (result) {
        console.log("Korisnik logovan!");
        req.session.user = { ...db_user[0] };
        req.session.save();
        return res.redirect('/');
      } else {
        return res.status(400).json({ "login": "fail 2" });
      }

    });

  } catch (error) {
    console.log(error);
    res.redirect('/');
  }


});

module.exports = router;
