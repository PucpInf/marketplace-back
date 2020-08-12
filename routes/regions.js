var express = require('express');
var router = express.Router();

const RegionController = require('../controller/RegionController');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    return await RegionController.Regions(res);

  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
  	let Region = await RegionController.create(req.body.name,res);
  	return res.status(200).send(Region);
  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});


module.exports = router;
