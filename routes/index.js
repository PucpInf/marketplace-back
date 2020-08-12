import {getRepository} from "typeorm";
import {Country} from "../entity/Country";
const auth = require('../config/auth');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.connection.remoteAddress);
  res.status(200).send(req.ipInfo);
});

router.get('/allCountry', async function(req, res, next) {
  try {
    let countryList = await getRepository(Country).find();
    res.status(200).send(countryList);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});
/*
router.get('/countryDet', async function(req, res, next) {
  try {
    let list = await auth.isProductAvailable(req, res, next);
    return res.status(200).send(list);
  } catch (e) {
    return res.status(500).send(e.message);
  }
});
*/

module.exports = router;
