import {createQueryBuilder, getRepository} from "typeorm/index";
import {User} from "../entity/User";
import {Country} from "../entity/Country";

const RegionController = require('../controller/RegionController');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


function genRandomString(length){
  return crypto.randomBytes(Math.ceil(length/2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0,length);   /** return required number of characters */
}

function sha512 (password, salt){
  let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  let value = hash.digest('hex');
  return {
    salt:salt,
    passwordHash:value
  };
}

function saltHashPassword(userpassword) {
  let salt = "saltHashLor"; /** Gives us salt of length 16 */
  return sha512(userpassword, salt);

}

async function verifyToken(req, res, next){

  try {
    let userRepository = await getRepository(User);
    let token = req.headers['authorization'];
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    await jwt.verify(token, 'supersecret', async function (err, decoded) {
      if (err)
        return res.status(401).send({auth: false, message: 'Failed to authenticate token.'});
      req.body.verifiedUser = await userRepository.findOne( {id: decoded.id} );

      next();
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }

}

async function isProductAvailable(req, res, next){

  try {

    let countryId = req.ipInfo.country;
    console.log(countryId);
    let regionList = await createQueryBuilder()
      .select("regCont")
      .from("content_regions_region", "regCont")
      .where("regCont.contentId = :id", { id: req.query.contentid })
      .getRawMany();
    let userCountry = await getRepository(Country).findOne({where:{code: countryId}, relations:["region"]});
    let region = userCountry.region.id;
    console.log(region);
    console.log(regionList);
    let allowed = regionList.filter(function(obj) {
      return obj.regCont_regionId === region;
    });
    console.log(allowed);
    if(allowed.length>0) {
      next();
    }else {
      return res.status(500).send({message:"you are not authorized"});
      //next();
    }
    /*
    if (!token)
      return res.status(403).send({ auth: false, message: 'No token provided.' });
    await jwt.verify(token, 'supersecret', async function (err, decoded) {
      if (err)
        return res.status(401).send({auth: false, message: 'Failed to authenticate token.'});
      req.body.verifiedUser = await userRepository.findOne( {id: decoded.id} );

      next();
    });*/

    return regionList;
  } catch (e) {
    return res.status(500).send(e.message);
  }

}


module.exports = {
  saltHashPassword: saltHashPassword,
  secret: 'supersecret',
  verifyToken: verifyToken,
  isProductAvailable: isProductAvailable
};
