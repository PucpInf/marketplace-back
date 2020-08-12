var express = require('express');
var router = express.Router();

const CategoryController = require('../controller/CategoryController');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
  	let Categorys = await CategoryController.Categorys(res);
  	return res.status(200).send(Categorys);
  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
  	let Category = await CategoryController.create(req.body.name,res);
  	return res.status(200).send(Category);
  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});


module.exports = router;
