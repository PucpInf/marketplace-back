var express = require('express');
var router = express.Router();
const ProviderController = require('../controller/ProviderController');
const UserController = require('../controller/UserController');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    let newUser = await UserController.createUser(req.body.name,req.body.lastName,req.body.password,
      req.body.email,req.body.countryId,res);
    if (newUser == null){
      return res.status(500).send({message:"Email Repetido de Usuario"});
    }
    return await ProviderController.createProvider(req.body.companyName,req.body.email
      ,newUser.id,req,res);
  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});
module.exports = router;
