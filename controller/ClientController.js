import {getRepository, createQueryBuilder} from 'typeorm';
import {User} from '../entity/User';
import {Country} from '../entity/Country';
import {Client} from '../entity/Client';
import {SubscriptionPlan} from "../entity/SubscriptionPlan";
import {Content} from "../entity/Content";
const UserController = require('../controller/UserController');
const PaymentController = require('../controller/PaymentController');
const MailController = require('../controller/MailController');
const auth = require('../config/auth');

async function createClient(name,lastName,password,email,countryId,planId,req, res) {
  try {
    //verificar si hay un cliente con el mismo email

    let verifyUser = await UserController.createUser(name, lastName, password, email, countryId, res);

    console.log(verifyUser);

    if(verifyUser){
      let plan = await getRepository(SubscriptionPlan).findOne({id:planId});

      let newClient = new Client();
      newClient.user = verifyUser;
      newClient.plan = plan;
      console.log(newClient);
      await getRepository(Client).save(newClient);
      if (plan.free === 0){
        await PaymentController.createSubscriptionAgreement(req.body.agreementId,plan.id,newClient.id);
      }
      return newClient;

    }else{
      return res.status(500).send({message:"Cliente repetido"});
    }

    
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function newClient(name,lastName,password,email,countryId,planId,req, res) {
  try {

    let user = await UserController.createUser(name, lastName, password, email, countryId, res);

    if(user){
      let plan = await getRepository(SubscriptionPlan).findOne({id:planId});
      console.log("creando cleinte");
      let newClient = new Client();
      newClient.user = user;
      newClient.plan = plan;
      newClient.customer = req.body.costumerId;
      await getRepository(Client).save(newClient);
      MailController.sendRegisterConfirmationClient(user,plan);
      return newClient;

    }
    return res.status(500).send({message:"Cliente repetido"});
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function suscribePlan(client, idPLan) {
  try {
    //verificar si hay un cliente con el mismo email

    let findClient = await getRepository(Client).findOne({id: client.id});

    console.log(findClient);

    if(findClient){

      findClient.plan = idPlan;
      console.log(findClient);
      await getRepository(Client).save(findClient);

      return findClient;

    }else{
      return res.status(500).send({message:"El Cliente debe registrarse primero"});
    }

    
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function getClient(req, res){
  try {
    let client = await getRepository(Client)
      .findOne({where:{id:req.query.clientId},relations:["user","plan"]});
    client.user.password="";
    return res.status(200).send(client);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function getClientProducts(req,res){
  try {
    let client = await getRepository(Client).findOne({where:{id:req.query.clientId},relations:["user"]});

    let prodList = await createQueryBuilder().select().from("user_contents_content").
    where("user_contents_content.userId=:uId ", {uId: client.user.id})
      .getRawMany();

    let finalList =await  Promise.all(prodList.map(async (item) => {
      console.log(item);
      return  await getRepository(Content).findOne({where:{id:item.contentId},relations:["regions","owner"]})
    }));
    return res.status(200).send(finalList);
  } catch (e) {
    return res.status(500).send({message:e.message});
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  newClient : newClient,
  createClient: createClient,
  suscribePlan: suscribePlan,
  getClient: getClient,
  getClientProducts: getClientProducts
};

