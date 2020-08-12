import {getRepository} from 'typeorm';
import {SubscriptionPlan} from '../entity/SubscriptionPlan';
import {getConnection} from "typeorm";
const PaymentController = require('./PaymentController');

const auth = require('../config/auth');

async function createPlan(name,description,price, res) {
  try {
    //verificar si hay un usuario con el mismo email
    let verifyPlan = await getRepository(SubscriptionPlan).findOne({name: name.trim().toUpperCase() });

    if(verifyPlan){
      //Signfica que se encontró un plan
      console.log("Plan repetido");
      return res.status(500).send({message:"Plan already exists"})

    } else {
      //crear el nuevo plan
      if(price === 0){
        let newPlan = new SubscriptionPlan();
        newPlan.name = name;
        newPlan.description = description;
        newPlan.price = price;
        newPlan.id = 'P-00';
        newPlan.free = 1;
        //guardar en bd
        await getRepository(SubscriptionPlan).save(newPlan);
        return res.status(200).send(newPlan);
      } else {
        return await PaymentController.createSubscriptionPlan(name,description,price, res);
      }

      //en este caso una vez que se llame esta funcion el objeto newPlan tendrá el id automáticamente generadp

      //colocar aqui el servicio de notificacion por corre
    }
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function listPlans(req, res) {
  try {
    //verificar si hay un usuario con el mismo email
      let listPlans = await getRepository(SubscriptionPlan).find();
      return res.status(200).send(listPlans);

  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function RelateContent(Subscriptions,res) {
  try {
    //verificar si hay un usuario con el mismo email
      let listPlans = await getRepository(SubscriptionPlan).find();
      return res.status(200).send(listPlans);

  } catch (e) {
    return res.status(500).send(e.message)
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
    createPlan: createPlan,
    listPlans: listPlans,
  };
