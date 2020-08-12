import {createQueryBuilder, getRepository} from 'typeorm';
import {Region} from '../entity/Region';
import {Country} from "../entity/Country";
const auth = require('../config/auth');

async function Regions(res) {
  try {
    //verificar si hay un Provider con el mismo nombre
    let Regions = await getRepository(Region).find();
    return res.status(200).send(Regions);
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function create(name,res) {
  try {
    //verificar si hay un Provider con el mismo nombre
    let verifyRegion = await getRepository(Region).findOne({code:name});
    console.log(verifyRegion);
    if (verifyRegion)
    {
      return res.status(500).send({message:"Region already exists"});
    }
    else
    {
      //crear el nuevo provider
      let newRegion = new Region();
      newRegion.code = name;
      //guardar en bd
      await getRepository(Region).save(newRegion);
      //en este caso una vez que se llame esta funcion el objeto newUser tendrá el id automáticamente generadp

      //colocar aqui el servicio de notificacion por correo

      return res.status(200).send(newRegion);
    }
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function allCountriesFromRegion( regionId ){
  try {
    let list = await createQueryBuilder().select().from(Country,"country").
    where("country.regionId = :id", { id: regionId}).getRawMany();
    return list;
  }catch (e) {
    return e;
  }
}

async function isProductAvailable ( countryCode, contentId){
  try {

  } catch (e) {
    return e;
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  Regions: Regions,
  create: create,
  allCountriesFromRegion:allCountriesFromRegion,
  isProductAvailable: isProductAvailable
};

