var express = require('express');
var router = express.Router();

const UserController = require('../controller/UserController');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* router.get('/test', function(req, res) {
  var obj = useragent.parse(req.headers['user-agent']);
  console.log(obj.toJSON);
  res.send(obj);
}); */

router.get('/verifyEmail',async function(req, res, next) {
  try {
    return await UserController.verifyEmail(req,res);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    let newUser = await UserController.createUser(req.body.name, req.body.lastName, req.body.password,
      req.body.email, req.body.countryId, res);
    return res.status(200).send(newUser);

  } catch (e) {
    return res.status(500).send({message:e.message});
  }

});


router.post('/login',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    return await UserController.loginUser(req, res);

  } catch (e) {
    return res.status(500).send({message:e.message});
  }

});





module.exports = router;
