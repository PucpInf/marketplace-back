var express = require('express');
var router = express.Router();

const ClientController = require('../controller/ClientController');
const PaumentController = require('../controller/PaymentController');
/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    return await ClientController.getClient(req,res);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
});

router.get('/getClientProducts', async function(req, res, next) {
  try {
    return await ClientController.getClientProducts(req,res);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    let newClient =  await ClientController.newClient(req.body.name, req.body.lastName, req.body.password,
      req.body.email, req.body.countryId,req.body.planId, req, res);
    let subscription =  await PaumentController.createCustomerSubscription(newClient, req, res);
    return res.status(200).send({client: newClient, subscription: subscription});
  } catch (e) {
    return res.status(500).send({message:e.message});
  }

});


module.exports = router;
