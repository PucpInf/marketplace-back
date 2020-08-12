import {getRepository, createQueryBuilder} from 'typeorm';
import {User} from '../entity/User';
import {Country} from '../entity/Country';
import {Session} from '../entity/Session';
import {Provider} from "../entity/Provider";
import {Client} from "../entity/Client";
import {Admin} from "../entity/Admin";

const MailController = require('./MailController');
const useragent = require('useragent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../config/auth');

async function verifyEmail(req,res){
  try {
    let verifyUser = await getRepository(User).findOne({email:req.query.email});
    if (verifyUser){
      return res.status(400).send({message: "Repeated email"});
    } else {
      return res.status(200).send({message:"new email"});
    }
  } catch (e) {
    return res.status(500).send(e.message)
  }
}


async function createUser(name,lastName,password,reqEmail,countryId, res) {
  try {
    //verificar si hay un usuario con el mismo email
    let verifyUser = await getRepository(User).findOne({email:reqEmail});


    if(verifyUser){
      //Signfica que encontró un usueario
      console.log("Usuario repetido");
      return null;

    } else {
      //crear el nuevo usuario
      let newUser = new User();
      newUser.firstName = name;
      newUser.lastName = lastName;
      newUser.email = reqEmail;
      newUser.password = bcrypt.hashSync(password, 8);
      //buscar pais
      newUser.country = await getRepository(Country).findOne({id: countryId});
      //guardar en bd
      await getRepository(User).save(newUser);
      //en este caso una vez que se llame esta funcion el objeto newUser tendrá el id automáticamente generadp

      //colocar aqui el servicio de notificacion por correo

      //como voy a devolver el correo quitaré el password del newUser pero como si se ha guardado en bd
      //MailController.sendRegisterConfirmation(newUser);
      return newUser;
    }
  } catch (e) {
    return res.status(500).send(e.message)
  }
}


async function loginUser(req, res) {
  try {
    let email = req.body.email;
    //busca al usuario por email
    let findUser = await getRepository(User).findOne({email: email});
    console.log(findUser);
    //En caso de encontrarlo
    if(findUser){
        console.log("usuario valido");
        let passwordIsValid = bcrypt.compareSync( req.body.password, findUser.password);
        //Verifica el password
        if (!passwordIsValid){
          console.log("clave no valida");
          return res.status(200).send({ auth: false, token: null });

        } else{
          console.log("clave valida");
          let token = await jwt.sign({ id: findUser.email }, auth.secret, { expiresIn: 86400 }); //expira en 24 horas
          findUser.password='';
          //Guardo la sesion
          let session = new Session();
          session.token = token;
          session.emission= new Date();
          session.user = findUser;
          await getRepository(Session).save(session);
          let client ={};
          const isClient = await createQueryBuilder()
            .select("client")
            .from(Client, "client")
            .where("client.userId = :id", { id: findUser.id })
            .getOne();

          if(isClient){
             client = isClient;
          }
          let provider ={};
          const isProvider = await createQueryBuilder()
            .select("provider")
            .from(Provider, "provider")
            .where("provider.userId = :id", { id: findUser.id })
            .getOne();

          if(isProvider){
             provider = isProvider;
          }
          let admin ={};
          const isAdmin = await createQueryBuilder()
            .select("admin")
            .from(Admin, "admin")
            .where("admin.userId = :id", { id: findUser.id })
            .getOne();

          if(isAdmin){
            admin = isAdmin;
          }
          //Informacion del dispositivo, browser y OS
          let agent = useragent.parse(req.headers['user-agent']);
          return res.status(200).send({ auth: true, token: token ,user:findUser,
            browser: agent.family, device: agent.device.family, os: agent.os.family.concat(' ',agent.os.major),
          client:client, provider:provider, admin:admin});
        }

    } else{
      console.log("usuario no valido");
      return res.status(500).send({message:'No user found.'});
    }

  }catch(e){
    return res.status(500).send(e.message);
  }
}


//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  createUser: createUser,
  loginUser: loginUser,
  verifyEmail: verifyEmail

};

