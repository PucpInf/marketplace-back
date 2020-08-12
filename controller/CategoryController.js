import {createQueryBuilder, getRepository} from 'typeorm';
import {Category} from '../entity/Category';
const auth = require('../config/auth');

async function Categorys(res) {
  try {
    //verificar si hay un Provider con el mismo nombre
    let Categorys = await getRepository(Category).find();
    return Categorys;
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

async function create(name,res) {
  try {
    //verificar si hay un Provider con el mismo nombre
    let verifyCategory = await getRepository(Category).findOne({code:name});
    if (verifyCategory)
    {
      return res.status(500).send({message:"Category already exists"});
    }
    else
    {
      //crear el nuevo provider
      let newCategory = new Category();
      newCategory.code = name;
      //guardar en bd
      await getRepository(Category).save(newCategory);
      //en este caso una vez que se llame esta funcion el objeto newUser tendrá el id automáticamente generadp

      //colocar aqui el servicio de notificacion por correo

      return res.status(200).send(newCategory);
    }
  } catch (e) {
    return res.status(500).send({message:e.message})
  }
}

//cuando se cree una nueva función que debe ser llamada por las rutas colocarlas caqui
module.exports = {
  Categorys: Categorys,
  create: create,
};

