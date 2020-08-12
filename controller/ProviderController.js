import {createQueryBuilder, getRepository} from 'typeorm';
import {Provider} from '../entity/Provider';
import {User} from '../entity/User';
import {Country} from "../entity/Country";
const auth = require('../config/auth');
const UserController = require('./UserController');
const stripe = require('stripe')('sk_test_ungSgSAYizTDShl0fovt05Ja00m4c1tPJh');

async function registerProviderStripe(user, req, res){
  try {

    let country = await getRepository(Country).findOne({id: req.body.countryId});
    if(country.code === 'US'){
      const connectAccount = await stripe.accounts.create({
        type: 'custom',
        country: country.code,
        email: req.body.email,
        business_type:'individual',
        individual:{
          first_name:user.firstName,
          last_name: user.lastName
        },
        business_profile:{
          product_description:'Digital content'
        },
        requested_capabilities: ['platform_payments'],
        external_account:{
          object:'bank_account',
          country:country.code,
          currency:'USD',
          routing_number:'110000000',
          account_number:req.body.account_number
        }
      });

      await stripe.accounts.update(
        connectAccount.id,
        {
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: req.connection.remoteAddress // Assumes you're not using a proxy
          }
        }
      );

      return connectAccount.id;
    } else {
      const connectAccount = await stripe.accounts.create({
        type: 'custom',
        country: country.code,
        email: req.body.email,
        business_type:'individual',
        individual:{
          first_name:user.firstName,
          last_name: user.lastName
        },
        business_profile:{
          product_description:'Digital content'
        },
        external_account:{
          object:'bank_account',
          country:country.code,
          currency:'USD',
          account_number:req.body.account_number
        }
      });

      await stripe.accounts.update(
        connectAccount.id,
        {
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: req.connection.remoteAddress // Assumes you're not using a proxy
          }
        }
      );

      return connectAccount.id;
    }

  } catch (e) {
    return e;
  }
}

async function createProvider(CompanyName,emailAccount,UserId, req,res) {
  try {
    //verificar si hay un Provider con el mismo nombre
    let verifyProvider = await getRepository(Provider).findOne({companyName:CompanyName});
    
    if(verifyProvider){
      //Signfica que encontró un usueario
      return res.status(500).send({message:"Provider already exists"});
    } else {
      //crear el nuevo provider
      let user = await getRepository(User).findOne({id:UserId});
      let newProvider = new Provider();
      newProvider.companyName = CompanyName;
      newProvider.user= user;
      newProvider.emailAccount = emailAccount;
      newProvider.stripeAccountId = await registerProviderStripe(user,req, res);
      //guardar en bd
      await getRepository(Provider).save(newProvider);
      //en este caso una vez que se llame esta funcion el objeto newUser tendrá el id automáticamente generadp

      //colocar aqui el servicio de notificacion por correo

      return res.status(200).send(newProvider);
    }
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  createProvider: createProvider,
};

