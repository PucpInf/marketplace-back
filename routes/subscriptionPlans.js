var express = require('express');
var router = express.Router();
const PaymentController = require('../controller/PaymentController');
const PlanController = require('../controller/SubscriptionPlanController');
const bodyParser = require('body-parser');
/* GET users listing. */
router.get('/',async function(req, res, next) {
  try {
    return await PlanController.listPlans(req, res);
  }catch (e) {
    return res.status(500).send(e.message)
  }
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    return await PlanController.createPlan(req.body.name, req.body.description, req.body.price, res);


  } catch (e) {
    return res.status(500).send({message:e.message});
  }

});

router.post('/receiveSubPay', bodyParser.raw({type: 'application/json'}), async function (req, res) {
  try {
    return await PaymentController.paySubscription(req, res);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
});

router.post('/registerCustomer',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    return await PlanController.registerCostumer(req.body.clientId, req.body.customerId, res);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
});

router.post('/createSubscription',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    return await PlanController.createSubscriptionAgreement(req.body.clientId, req.body.planId, res);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
});

module.exports = router;
