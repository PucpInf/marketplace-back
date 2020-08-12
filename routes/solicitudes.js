var express = require('express');
var router = express.Router();

const SolicitudController = require('../controller/SolicitudController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/create',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
  	let retorno = await SolicitudController.create(req.body.contentid,req.body.clientid,
      req.body.typeid,req.body.date,res);
  	return res.status(200).send(retorno);
  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});

router.get('/findbyowner',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    let retorno = await SolicitudController.FindbyOwner(req.query.ownerid,res);
    return res.status(200).send(retorno);
  } catch(e) {
    return res.status(500).send({message:e.message})
  }
  
});

router.post('/updatestate',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    let retorno = await SolicitudController.UpdateState(req.body.solicitudid,req.body.state,res);
    return res.status(200).send(retorno);
  } catch(e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/upfile', upload.single("attachment"), async function (req, res) {
  try{
    console.log(req.body.solicitudid);
    if(req.file) {
      //si es realidad virtual
      let retorno = await SolicitudController.UploadFile(req.body.solicitudid,req.file,res);
      return res.status(200).send(retorno);
    } else {
      let retorno = await SolicitudController.UploadCode(req.body.solicitudid,req.body.activecode,res);
      return res.status(200).send(retorno);
    }
  } catch(e) {
    return res.status(500).send({message:e.message})
  }
});

router.get('/findone',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{
    let retorno = await SolicitudController.FindOne(req.query.clientid,req.query.contentid,req.query.typeid,res);
    if (retorno != null)
      return res.status(200).send(retorno);
    else
      return res.status(200).send("no found");
  } catch(e) {
    return res.status(500).send({message:e.message})
  }
  
});


module.exports = router;
