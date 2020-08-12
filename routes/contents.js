import {ContentType} from "../entity/ContentType";
import {createQueryBuilder, getRepository} from "typeorm/index";
var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../config/auth');
const ContentController = require('../controller/ContentController');
const SubscriptionController = require('../controller/SubscriptionPlanController');
const PaymentController = require('../controller/PaymentController');
const IosCodeController = require('../controller/IosCodeController');
const SolicitudController = require('../controller/SolicitudController');
/* GET users listing. */
router.get('/allByState', async function(req, res, next) {
  try {
    return await ContentController.getByState(req, res);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/respondRequest', async function (req, res) {
  try {
    return await ContentController.respondRequest(req,res);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});



router.post('/uploadnofile',async function (req,res) {
  //como se crea en bd se mandan los parametros en req.body, en caso de un get leer desde req.query
  try{

  	let content = await ContentController.upload(req.body.Title, req.body.Description, req.body.OwnerId,
      req.body.Price, req.body.Categorys, req.body.Regions,req.body.Subscriptions, res);
  	return res.status(200).send(content);

  } catch(e) {
  	return res.status(500).send({message:e.message})
  }
  
});

router.post('/upload', upload.any(), async function (req, res) {
  try{
    let content;
    let emptyfile =
    {
      originalname : "",
      path : "",
      size : 0
    };
    console.log(req.files);
    if(req.body.Types.length == 1)
    {
      //video audio y apk
      if(req.body.Types[0] == 1 || req.body.Types[0] == 2 || req.body.Types[0] == 3){
        console.log("no empty file");
        content = await ContentController.upload(req.body.Title, req.body.Description, req.body.OwnerId,
        req.body.Price, req.body.Categorys, req.body.Regions,req.body.Subscriptions,req.body.Types,req.files[0],res);
      }
      else
      {
        //5  y 4 virtual reality app
        content = await ContentController.upload(req.body.Title, req.body.Description, req.body.OwnerId,
        req.body.Price, req.body.Categorys, req.body.Regions,req.body.Subscriptions,req.body.Types,emptyfile,res);
      }
    } else {
        for (var i = 0; i < req.body.Types.lenght; i+=1) {
          if(req.body.Types[i] === 3)
            content = await ContentController.upload(req.body.Title, req.body.Description, req.body.OwnerId,
            req.body.Price, req.body.Categorys, req.body.Regions,req.body.Subscriptions,req.body.Types,req.files[i],res);            
        }  
    }
  } catch(e) {
    return res.status(500).send({message:e.message})
  }
  /*
   console.log(`new upload = ${req.file.filename}\n`);
   console.log(req.file);
   res.json({ msg: 'Upload Works' });
   */
});

router.get('/download', async function(req, res, next) {
  try {
    let DataFile = await ContentController.FileData(req.query,res);
    if (DataFile.location != ""){
      var path = require('path');
      let reqPath = path.join(__dirname, '../') + DataFile.location;
      return res.status(200).download(reqPath,DataFile.title);
    } else {
      let solicitud = await SolicitudController.FindOne(req.query.clientid,req.query.contentid,req.query.typeid,res);
      console.log(solicitud);
      if(solicitud) {
        if(solicitud.state == 1)
        {
          if (req.query.typeid == 5) {
            console.log("5");
            var path = require('path');
            let reqPath = path.join(__dirname, '../') + solicitud.location;
            return res.status(200).download(reqPath,DataFile.title + '.' + solicitud.extension);
          } else {
            return res.status(200).send({activecode: solicitud.activecode});
          }
        } else {
          if(solicitud.state == 0)
            return res.status(200).send("solicitud pendiente");
          else
            return res.status(200).send("solicitud denegada");
        }
      } else {
        return res.status(200).send("solicitar producto al proveedor");
      }
    }
    

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/upfile', upload.single("attachment"), async function (req, res) {
  if(req.file) {
    console.log(`new upload = ${req.file.filename}\n`);
    console.log(req.file);
  } else {
    console.log("no file  uploaded");
  }
   res.json({ msg: 'Upload Works' });
});

router.get('/allContentCategory', async function(req, res, next) {
  try {
    let content = await ContentController.getAllContentCategory(req, res);
    return res.status(200).send(content);

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.get('/allContentLocation', async function(req, res, next) {
  try {
    return  await ContentController.allContentLocation(req, res);


  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.get('/types', async function (req,res) {
  try {
  let contList = await getRepository(ContentType).find();
  return res.status(200).send(contList);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});
//,auth.isProductAvailable
router.get('/find',auth.isProductAvailable, async function(req, res, next) {
  try {
    let client = 0;
    if(req.query.clientid){
      client = req.query.clientid;
    }
    await ContentController.findContent(req.query.contentid,client, res);

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.get('/all', async function(req, res, next) {
  try {
    let content = await ContentController.FindAll(res);
    return res.status(200).send(content);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/buyContent',async function( req, res) {
  try {
    return PaymentController.singlePayment(req,res);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/upfiles', upload.any(), async function (req, res) {
  if(req.files.lenght){
    console.log(req.files[1]);
  } else {
    console.log(aber)
  }
});

router.post('/calificate', async function (req, res) {
  try {
    let retorno = await ContentController.Calificate(req.body.userid,req.body.contentid,req.body.calification,req.body.description,res);
    return res.status(200).send(retorno);  
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});


router.post('/modificate', async function (req, res) {
  try {
    let retorno = await ContentController.Modificate(req.body.id,req.body.Title, req.body.Description,
        req.body.Price, req.body.Categorys, req.body.Regions,req.body.Subscriptions,req.body.Types,res);
    return res.status(200).send(retorno);  
    } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/sendActivationCodes', async function (req,res) {
  try {
    return await IosCodeController.uploadCodes(req, res);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.post('/assignCode', async function (req,res) {
  try {
    return await IosCodeController.assignCode(req, res);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

router.get('/findbyowner',async function(req, res, next) {
  try {
    await ContentController.findContentByOwner(req.query.ownerid, res);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
});

module.exports = router;
