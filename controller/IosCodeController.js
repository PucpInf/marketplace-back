import {createQueryBuilder, getRepository} from 'typeorm';
import {getConnection} from "typeorm";
import {IosCode} from "../entity/IosCode";
import {Content} from "../entity/Content";
import {Provider} from "../entity/Provider";
import {Client} from "../entity/Client";
import {Region} from "../entity/Region";
const MailController = require('../controller/MailController');

async function uploadCodes(req, res){
  try {
    let codeArray = req.body.codes;
    let content = await getRepository(Content).findOne({id:req.body.contentId});

    await Promise.all(codeArray.map(async (item) => {
      let newCode = new IosCode();
      newCode.code = item;
      newCode.assigned = 0;
      newCode.content = content;

      try {
        await getRepository(IosCode).save(newCode);
      } catch (e) {
        console.log(e.message + "  " + item);
      }
    }));
    return res.status(200).send({message: "upload succesful"});
  }catch (e) {
    return res.status(500).send(e.message);
  }
}

async function assignCode(req, res){
  try {
    let client = await getRepository(Client).findOne({where:{id:req.body.clientId}, relations:["user"]});
    let code = await getRepository(IosCode)
      .findOne({assigned:0, content:{id:req.body.contentId}});

    code.client = client;
    code.assigned = 1;
    let content = await getRepository(Content).findOne({where:{id:req.body.contentId},relations: ["owner"]});
    await getRepository(IosCode).save(code);
    MailController.sendActivationCode(content,client.user,code);

    let count = await createQueryBuilder(IosCode, "ios").select("count(*)", "count")
      .where(`ios.assigned = 0 and ios.contentId = ${req.body.contentId}`).getRawMany();

    if (count[0] < 30 ){
      let provider = await getRepository(Provider).findOne({where:{id:content.owner.id},relations:["user"]});
      MailController.requestMoreCodes(content,provider.user);
    }

    return res.status(200).send(code);
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

async function getCodeUser(clientId, productId){
  try {

    let code = await createQueryBuilder().select().from("ios_code","ios")
      .where(`ios.contentId = ${productId} and ios.clientId = ${clientId}`).getRawOne();
    console.log(code);
    return code;
  } catch (e) {
    return null;
  }
}

module.exports = {
  uploadCodes: uploadCodes,
  assignCode: assignCode,
  getCodeUser: getCodeUser
};
