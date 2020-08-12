import {createQueryBuilder, getRepository} from 'typeorm';
import {Solicitud} from '../entity/Solicitud';
import {Content} from '../entity/Content';
const auth = require('../config/auth');

async function create(contentid,clientid,typeid,date,res) {
  try {
    let verify = await getRepository(Solicitud).findOne({
      where: {contentid : contentid, clientid : clientid, typeid : typeid}
    });

    if(!verify)
    {
      let ContentSearch = await getRepository(Content).findOne({ 
        relations: ["owner"],
        where: {id : contentid}
      });

      let newSolicitud = new Solicitud();
      newSolicitud.contentid = ContentSearch.id;
      newSolicitud.ownerid = ContentSearch.owner.id;
      newSolicitud.clientid = clientid;
      newSolicitud.typeid = typeid;
      newSolicitud.state = 0;

      if(typeid == 4)
      {
        // si es ios se llenan estos datos
      }
      else
      {
        // si es VR se llanan estos datos
      }

      let retorno = await getRepository(Solicitud).save(newSolicitud);

      return res.status(200).send(retorno);
    }
    else
    {
      return res.status(200).send("ya existe solicitud");
    }
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function FindbyOwner(Id,res) {
  try {
    let ListSolicitud = await getRepository(Solicitud).find({
      where: {ownerid : Id}
    });

    for (var i = 0; i < ListSolicitud.length; i+=1) {
        let content = await getRepository(Content).findOne({id: ListSolicitud[i].contentid});
        ListSolicitud[i].ContentInfo = content;
      }

    return res.status(200).send(ListSolicitud);

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function UpdateState(solicitudid,state,res) {
  try {
    let solicitud = await getRepository(Solicitud).findOne({
      where: {id : solicitudid}
    });
    solicitud.state = state;
    let retorno = await getRepository(Solicitud).save(solicitud);    

    return res.status(200).send(retorno);

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function UploadFile(solicitudid,file,res) {
  try {
    let solicitud = await getRepository(Solicitud).findOne({
      where: {id : solicitudid}
    });
    solicitud.location = file.path;
    solicitud.size = file.size;
    solicitud.extension = file.originalname.split('.')[1];
    let retorno = await getRepository(Solicitud).save(solicitud);    

    return res.status(200).send(retorno);

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function UploadCode(solicitudid,code,res) {
  try {
    let solicitud = await getRepository(Solicitud).findOne({
      where: {id : solicitudid}
    });
    solicitud.activecode = code;
    let retorno = await getRepository(Solicitud).save(solicitud);    

    return res.status(200).send(retorno);

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function FindOne(clientid,contentid,typeid,res) {
  try {
    let solicitud = await getRepository(Solicitud).findOne({
      where: {contentid : contentid, clientid : clientid, typeid : typeid}
    });    
    if (solicitud)
      return solicitud;
    else
      return null;

  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  create: create,
  FindbyOwner: FindbyOwner,
  UpdateState: UpdateState,
  UploadFile: UploadFile,
  UploadCode: UploadCode,
  FindOne: FindOne
};

