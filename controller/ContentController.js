import {createQueryBuilder, getRepository} from 'typeorm';
import {getConnection} from "typeorm";
import {Content} from '../entity/Content';
import {Provider} from '../entity/Provider';
import {Downloads} from '../entity/Downloads';
import {Category} from  '../entity/Category';
import {Region} from  '../entity/Region';
import {Client} from  '../entity/Client';
import {ContentXType} from  '../entity/ContentXType';
import {Country} from "../entity/Country";
import {ContentType} from  '../entity/ContentType';
import {SubscriptionPlan} from "../entity/SubscriptionPlan";
import {User} from "../entity/User";
import {Calification} from "../entity/Calification";
import {IosCode} from "../entity/IosCode";
const IosCodeController = require('../controller/IosCodeController');
const MailController = require('../controller/MailController');
const auth = require('../config/auth');

async function upload(Title,Description,OwnerId,Price,Categorys,Regions,Subscriptions,Types,file,res) {
  try {
    if (file.originalname != "") {
      Title = Title + "." + file.originalname.split('.')[1];  
    }
    let newContent = new Content();
    newContent.title = Title;
    newContent.description = Description;
    newContent.price = Price;
    let FullCategorys = [];
    for (var i = 0; i < Categorys.length; i+=1) {
        FullCategorys.push(await getRepository(Category).findOne({id: Categorys[i]}));
      }
    newContent.categories = FullCategorys;
    let FullRegions = [];
    for (var i = 0; i < Regions.length; i+=1) {
        FullRegions.push(await getRepository(Region).findOne({id: Regions[i]}));
      }
    newContent.regions = FullRegions;
    newContent.owner = await getRepository(Provider).findOne({id: OwnerId});
    newContent.state = 0;
    newContent.location = file.path;
    newContent.size = file.size;
    await getRepository(Content).save(newContent);

    for (var i = 0; i < Types.length; i+=1) {
        let newContentXType = new ContentXType();
        newContentXType.TypeId = Types[i];
        newContentXType.ContentId = newContent.id;
        console.log(newContentXType);
        await getRepository(ContentXType).save(newContentXType);
      }

    for (var i = 0; i < Subscriptions.length; i+=1) {
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into('subscription_plan_contents_content')
        .values([
            { contentId: newContent.id, subscriptionPlanId: Subscriptions[i] }
         ])
        .execute();
      }
    return res.status(200).send(newContent);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function getByState(req, res){
  try {
    let list = await createQueryBuilder(Content, "content")
      .leftJoinAndSelect("content.categories","category")
      .where(`content.state = ${req.query.state}`)
      .getMany();

    let newList = await Promise.all(list.map(async (item) => {
      let obj = item;
      obj.regions = await createQueryBuilder().select("rg").from("content_regions_region","crr")
        .from(Region,"rg")
        .where(`crr.contentId = ${item.id} and rg.id = crr.regionId`)
        .getRawMany();
      obj.plans = await createQueryBuilder().select("sp").from("subscription_plan_contents_content","spcc")
        .from(SubscriptionPlan,"sp")
        .where(`spcc.contentId = ${item.id} and sp.id = spcc.subscriptionPlanId`)
        .getRawMany();
      obj.types = await createQueryBuilder().select("type").from("content_x_type","cxt")
        .from(ContentType,"type")
        .where(`cxt.contentId = ${item.id} and type.id = cxt.typeId`)
        .getRawMany();

      return obj;

    }));
    return res.status(200).send(newList);
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function UploadFile(req, res){
  try {
    return await getRepository(Content).find({where:{state:req.query.state}});
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function FileData(req, res){
  try {
    let content = await getRepository(Content).findOne({id: req.contentid});
    if(content){
      let downloaded = await getRepository(Downloads).findOne({ where: { ClientId: req.clientid, ContentId: req.contentid } });
      if(downloaded){
        //ya se descargo antes
        console.log("already");
      }
      else{
        //actualizar tabla downloads
        console.log("registrar descarga");
        let newDownload = new Downloads();
        newDownload.ClientId = req.clientid;
        newDownload.ContentId = req.contentid;
        await getRepository(Downloads).save(newDownload);
        console.log(newDownload);
      }
      return content;
    }
    else{
      return null;
    }
  }
  catch (e) {
    return res.status(500).send(e.message)
  }
}

async function respondRequest(req, res){
  try {
    let content = await getRepository(Content).findOne({where:{id : req.body.contentId},relations:["owner"]});
    console.log(content);
    let provider = await getRepository(Provider).findOne({where:{id:content.owner.id},relations:["user"]});
    content.state = req.body.newState;
    await getRepository(Content).save(content);
    MailController.requestResponded(req.body.newState, content, provider.user );
    return res.status(200).send(content);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}
async function getAllContentCategory(req, res){
  try {

    let newContents = {};

    newContents.list = await getRepository(Content).find({
      join: {
        alias: "content",
        leftJoinAndSelect: {
          category: "content.categories"
        }
      }
    });

    newContents.categories = await getRepository(Category)
                             .createQueryBuilder("category")
                             .select("category.id")
                             .addSelect("category.code")
                             .addSelect("COUNT(*) AS count")
                             .leftJoinAndSelect("category.contents", "content")
                             .groupBy("category.id")
                             .getRawMany();

    //newContents.list = allCategories;
    //newContents.count = categoriesCount;

    return newContents;
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function allContentLocation(req, res){
  try {

    let countryId = req.ipInfo.country;
    let userCountry = await getRepository(Country).findOne({where:{code: countryId}, relations:["region"]});
    let region = userCountry.region.id;

    let newContents = {};

    newContents.list = await createQueryBuilder(Content, "content")
      .leftJoinAndSelect("content.categories","category")
      .leftJoin("content.regions", "region", "region.id = :regionId", { regionId:region }).
      where("content.state = 1")
      .getMany();

    newContents.categories = await getRepository(Category)
      .createQueryBuilder("category")
      .select("category.id")
      .addSelect("category.code")
      .addSelect("COUNT(*) AS count")
      .leftJoinAndSelect("category.contents", "content")
      .groupBy("category.id")
      .getRawMany();

    //newContents.list = allCategories;
    //newContents.count = categoriesCount;

    return res.status(200).send(newContents);
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function findContent(contentId,clientId, res){
  try { 
    let content = await getRepository(Content).find({
      relations: ["categories", "regions", "owner","payment"],
      where: {id: contentId}
    });

    let suscripciones = await getConnection()
    .createQueryBuilder()
    .select()
    .from("subscription_plan_contents_content", "sus")
    .where("sus.contentId = :id", { id: contentId })
    .getRawMany();

    let client = await getRepository(Client).find({
      relations: ["plan","user"],
      where: {id: clientId}
    });
    let FlagPlan = false;
    let FlagDownload = false;
    let FlagBuy = false;
    let codeClientIos = null;
    if(clientId != 0)
    {
      for (var i = 0; i < suscripciones.length; i+=1) {
          if (suscripciones[i].subscriptionPlanId == client[0].plan.id){
            FlagPlan = true;
            break;
          }
        }
      
      let downloaded = await getRepository(Downloads).findOne({ where: { UserId: client[0].user.id, ContentId: contentId } });
      if (downloaded) FlagDownload = true;

      let comprados = await getConnection()
      .createQueryBuilder()
      .select()
      .from("user_contents_content", "cuu")
      .where("cuu.contentId = :id1", { id1: contentId })
      .andWhere("cuu.userId = :id2", { id2: client[0].user.id })
      .getRawMany();
      console.log(comprados);
      
      if(comprados.length) FlagBuy = true;

      codeClientIos = await IosCodeController.getCodeUser(client[0].id,contentId);
      console.log(codeClientIos);
    }
      
      let calif = await getRepository(Calification).find({ContentId: contentId});
      /*
      if(clientId != 0)
      {
        for (var j = 0; j < calif.length; j+=1) {
          let user = await getRepository(User).findOne({id: calif[i].UserId});
          let client = await getRepository(Client).findOne({user: user})
          calif[i].userinfo = { firstName: user.firstName, lastName: user.lastName, ClientId: client.id };
        }
      }
      */
      
      let CxT = await getRepository(ContentXType).find({ContentId: contentId});
      let tipos = [];
      for (var j = 0; j < CxT.length; j+=1) {
        let cTypes = await getRepository(ContentType).findOne({id: CxT[j].TypeId});

        if( CxT[j].TypeId === 4){
          let count = await createQueryBuilder(IosCode, "ios").select("count(*)", "count")
            .where(`ios.assigned = 0 and ios.contentId = ${contentId}`).getRawMany();
          console.log(count[0].count);
          cTypes.unassignedCodes = count[0].count;
        }
        tipos.push(cTypes);
      }

    var contenido = {
      FlagPlan : FlagPlan,
      FlagDownload : FlagDownload,
      FlagBuy : FlagBuy,
      info : content[0],
      types : tipos,
      calification: calif,
      iosCode:codeClientIos
    };
    return res.status(200).send(contenido);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

async function FindAll(res){
  try {
    let ListContent = await getRepository(Content).find({relations: ["categories", "regions", "owner","payment"]});
    for (var i = 0; i < ListContent.length; i+=1) {
        let calif = await getRepository(Calification).find({ContentId: ListContent[i].id});
        let CxT = await getRepository(ContentXType).find({ContentId: ListContent[i].id});
        let tipos = [];
        for (var j = 0; j < CxT.length; j+=1) {
          tipos.push(await getRepository(ContentType).findOne({id: CxT[j].TypeId}));
        }
        ListContent[i].types = tipos;
        ListContent[i].calification = calif;
        let suscripciones = await getConnection()
        .createQueryBuilder()
        .select()
        .from("subscription_plan_contents_content", "sus")
        .where("sus.contentId = :id", { id: ListContent[i].id })
        .getRawMany();
        ListContent[i].suscripciones = suscripciones;
      }

    return res.status(200).send(ListContent);
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function Calificate(userid,contentid,calification,description,res){
  try {
    let newCalification = new Calification();
    newCalification.UserId = userid;
    newCalification.ContentId = contentid;
    newCalification.calification = calification;
    newCalification.description = description;
    await getRepository(Calification).save(newCalification);
    return res.status(200).send(newCalification);
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function Modificate(Id,Title,Description,Price,Categorys,Regions,Subscriptions,Types,res){
  try {
    let content = await getRepository(Content).find({
      relations: ["categories", "regions", "owner","payment"],
      where: {id: Id}
    });

    content[0].title = Title + '.' + content[0].title.split('.')[1];
    content[0].description = Description;
    content[0].price = Price;

    let FullCategorys = [];
    for (var i = 0; i < Categorys.length; i+=1) {
        FullCategorys.push(await getRepository(Category).findOne({id: Categorys[i]}));
      }
    content[0].categories = FullCategorys;

    let FullRegions = [];
    for (var i = 0; i < Regions.length; i+=1) {
        FullRegions.push(await getRepository(Region).findOne({id: Regions[i]}));
      }
    content[0].regions = FullRegions;

    let retorno = await getRepository(Content).save(content[0]);

    let ContentTypes = await getRepository(ContentXType).find({
      where: {ContentId: Id}
    });

    for (var i = 0; i < ContentTypes.length; i += 1){
       await getRepository(ContentXType).remove(ContentTypes[i]);
    }
    
    for (var i = 0; i < Types.length; i+=1) {
        let newContentXType = new ContentXType();
        newContentXType.TypeId = Types[i];
        newContentXType.ContentId = Id;
        await getRepository(ContentXType).save(newContentXType);
      }

    await getConnection()
      .createQueryBuilder()
      .delete()
      .from('subscription_plan_contents_content')
      .where("contentId = :id", { id: Id })
      .execute();

    for (var i = 0; i < Subscriptions.length; i+=1) {
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into('subscription_plan_contents_content')
        .values([
            { contentId: Id, subscriptionPlanId: Subscriptions[i] }
         ])
        .execute();
      }

    content = await getRepository(Content).find({
      relations: ["categories", "regions", "owner","payment"],
      where: {id: Id}
    });
    
    return res.status(200).send(content);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function findContentByOwner(OwnerId, res){
  try { 
    let Owner = await getRepository(Provider).findOne({id: OwnerId});

    let ListContent = await getRepository(Content).find({
      relations: ["categories", "regions", "owner"],
      where: {owner: Owner}
    });

    for (var i = 0; i < ListContent.length; i+=1) {
        let calif = await getRepository(Calification).find({ContentId: ListContent[i].id});
        let CxT = await getRepository(ContentXType).find({ContentId: ListContent[i].id});
        let tipos = [];
        for (var j = 0; j < CxT.length; j+=1) {
          let cTypes = await getRepository(ContentType).findOne({id: CxT[j].TypeId});

          if( CxT[j].TypeId === 4){
            let count = await createQueryBuilder(IosCode, "ios").select("count(*)", "count")
              .where(`ios.assigned = 0 and ios.contentId = ${ListContent[i].id}`).getRawMany();
            console.log(count[0].count);
           cTypes.unassignedCodes = count[0].count;
          }
          tipos.push(cTypes);
        }
        ListContent[i].types = tipos;
        ListContent[i].calification = calif;
        ListContent[i].plans = [];

        let suscripciones = await getConnection()
        .createQueryBuilder()
        .select()
        .from("subscription_plan_contents_content", "sus")
        .where("sus.contentId = :id", { id: ListContent[i].id })
        .getRawMany();
        ListContent[i].suscripciones = suscripciones;
      }
    return res.status(200).send(ListContent);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  upload: upload,
  getByState: getByState,
  FileData: FileData,
  getAllContentCategory: getAllContentCategory,
  respondRequest: respondRequest,
  allContentLocation: allContentLocation,
  findContent: findContent,
  FindAll : FindAll,
  Calificate: Calificate,
  Modificate: Modificate,
  findContentByOwner: findContentByOwner
};

