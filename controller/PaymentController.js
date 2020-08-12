import {Content} from "../entity/Content";
import {getRepository, createQueryBuilder} from 'typeorm';
import {Payment} from "../entity/Payment";
import {SubscriptionAgreement} from "../entity/SubscriptionAgreement";
import {SubscriptionPlan} from "../entity/SubscriptionPlan";
import {Provider} from "../entity/Provider";
import {SubscriptionPayment} from "../entity/SubscriptionPayment";
import {Client} from "../entity/Client";
import {User} from "../entity/User";
import {ContentXType} from "../entity/ContentXType";
import {ContentType} from "../entity/ContentType";
import {IosCode} from "../entity/IosCode";
const MailController = require('../controller/MailController');
const schedule = require('node-schedule');
const stripe = require('stripe')('sk_test_ungSgSAYizTDShl0fovt05Ja00m4c1tPJh');
const secret = 'whsec_ZNpbA2o1kftFSy9PqMlayDqzNgCoQwIU';
const uuidv4 = require('uuid/v4');


async function singlePayment(req, res){

  try {
    const token = 'tok_visa';
    const groupTkn = uuidv4();
    let content = await getRepository(Content).findOne({where:{id: req.body.productId}, relations:["owner"]});
    const charge = await stripe.charges.create({
      amount: content.price * 100,
      currency: 'usd',
      description: 'payment for' + req.body.productId,
      source: token,
      transfer_group: groupTkn,
    });
    console.log(charge);
    
    const transfer = await stripe.transfers.create({
      amount: content.price *100* 0.75,
      currency: "usd",
      destination: 'acct_1EcvW9BXIw0n8IWh',
      transfer_group: groupTkn,
    });
    console.log(transfer);

    const providerPay = await stripe.transfers.create({
      amount: content.price*100 * 0.25,
      currency: "usd",
      destination: content.owner.stripeAccountId,
      transfer_group: groupTkn,
    });
    console.log(providerPay);
    let client = await getRepository(Client).findOne({where:{id: req.body.clientId}, relations:["user"]});
    let user = await getRepository(User).findOne({id:client.user.id});
    let newPay = new Payment();
    newPay.orderId = charge.id;
    newPay.amount = charge.amount;
    newPay.currency = charge.currency;
    newPay.content = content;
    newPay.client = client;
    newPay.provider = content.owner;
    await getRepository(Payment).save(newPay);
    await createQueryBuilder()
      .insert()
      .into("user_contents_content")
      .values([
        { userId: user.id, contentId: content.id }
      ])
      .execute();
    let CxT = await getRepository(ContentXType).find({ContentId: content.id});
    for (let j = 0; j < CxT.length; j+=1) {
      if( CxT[j].TypeId === 4){
        let code = await getRepository(IosCode)
          .findOne({assigned:0, content:{id:content.id}});
        code.client = client;
        code.assigned = 1;
        await getRepository(IosCode).save(code);
        MailController.sendActivationCode(content,client.user,code);

        let count = await createQueryBuilder(IosCode, "ios").select("count(*)", "count")
          .where(`ios.assigned = 0 and ios.contentId = ${content.id}`).getRawMany();

        if (count[0] < 30 ){
          let provider = await getRepository(Provider).findOne({where:{id:content.owner.id},relations:["user"]});
          MailController.requestMoreCodes(content,provider.user);
        }
      }
    }

    MailController.sendPayConfirmation(newPay,content,user);
    return res.status(200).send(charge);
  } catch (e) {
    return res.status(500).send(e.message)
  }
}

async function createSubscriptionPlan(name, description, price, res){
  try {
    let subPlan = new SubscriptionPlan();
    if (price !== 0){
      const product = await stripe.products.create({
        name: name,
        type: 'service',
      });
      const plan = await stripe.plans.create({
        currency: 'usd',
        interval: 'month',
        product: product.id,
        nickname: name,
        amount: price,
      });
      subPlan.id = plan.id;
      subPlan.name = plan.nickname;
      subPlan.price = plan.amount;
      subPlan.free = 0;
      subPlan.description = description;
    } else {
      subPlan.id =  'P-00';
      subPlan.name = name;
      subPlan.price = 0;
      subPlan.free = 1;
      subPlan.description = description;
    }
    await getRepository(SubscriptionPlan).save(subPlan);
    return res.status(200).send(subPlan);
  } catch (e) {
     console.log(e.message);
    return res.status(500).send(e.message);
  }
}

async function cancelSuscription( billingAgreementId){


}

async function paySubscription(req, res){
  const sig = req.headers['stripe-signature'];
  try {
    const event = await stripe.webhooks.constructEvent(req.body, sig, secret);

    if(event.data){
      console.log(event);
      let subA = await getRepository(SubscriptionAgreement).findOne({agreementId:event.data.object.subscription});
      if (subA){
        let payment = new SubscriptionPayment();
        payment.agreement = subA;
        payment.amount = event.data.object.amount_paid;
        let client = await getRepository(Client).findOne({where:{customer:event.data.object.customer, relations:["user"]}});
        payment.client = client;

        payment.currency = event.data.object.currency;
        payment.invoiceId = event.data.object.id;
        await getRepository(SubscriptionPayment).save(payment);
        //MailController.sendSubscriptionPayConfirmation(payment, client.user);
      } else {
        const subDetails = await stripe.subscriptions.retrieve(
          event.data.object.subscription
        );
        let payment = new SubscriptionPayment();
        let client = await getRepository(Client).findOne({where:{customer:event.data.object.customer, relations:["user"]}});
        let newAgreement = new SubscriptionAgreement();
        newAgreement.state = 1;
        newAgreement.billing_cycle = subDetails.billing_cycle_anchor;
        newAgreement.agreementId =  subDetails.id;
        newAgreement.client = client;
        newAgreement.subscription = await getRepository(SubscriptionPlan).findOne({id: subDetails.plan.id});
        await getRepository(SubscriptionAgreement).save(newAgreement);
        payment.agreement = newAgreement;
        payment.amount = event.data.object.amount_paid;
        payment.client = client;
        payment.currency = event.data.object.currency;
        payment.invoiceId = event.data.object.id;
        await getRepository(SubscriptionPayment).save(payment);
        //MailController.sendSubscriptionPayConfirmation(payment, client.user);
      }

      return res.status(200).send(event);
    } else{
      return res.status(500).send({message: "There is no subscription"});
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).send(err.message);
  }
}

async function getMonthlyPaymentProvider(provider) {
  let totalSales = 0;

  return totalSales;
}

async function payProviders( providerList){

}

async function createSubscriptionAgreement(customerId, planId, res){
  try {
    console.log(customerId);
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{plan: planId}]
    });

    return subscription;
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

async function registerCostumer(client, customerId,res){
  try {
    client.customer = customerId;
    console.log(client);
    await getRepository(Client).save(client);
    return client;
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

async function createCustomerSubscription(newClient, req,res){
  try {
    let subscription = await getRepository(SubscriptionPlan).findOne({id:req.body.planId});
    console.log(subscription);
    if (subscription.free === 0){
      //await registerCostumer(newClient,req.body.customerId,res);
      return await createSubscriptionAgreement(req.body.costumerId, subscription.id, res);
    }
    return {agreement:{id:subscription.id,client:newClient.id}};
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

module.exports = {
  singlePayment:singlePayment,
  registerCostumer: registerCostumer,
  createSubscriptionAgreement:createSubscriptionAgreement,
  cancelSuscription: cancelSuscription,
  paySubscription: paySubscription,
  payProviders: payProviders,
  createSubscriptionPlan: createSubscriptionPlan,
  createCustomerSubscription: createCustomerSubscription
};
