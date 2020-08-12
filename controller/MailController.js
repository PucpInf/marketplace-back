const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'teamdp2mk@gmail.com',
    pass: 'marketplace-dp2'
  }
});



async function sendRegisterConfirmation( newUser) {

  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: newUser.email,
    subject: 'Welcome to Marketplace!!',
    text: `Hello ${newUser.firstName}. We welcome you to the Marketplace platform`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function sendRegisterConfirmationClient( newUser, plan) {

  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: newUser.email,
    subject: 'Welcome to Marketplace!!',
    html: `<div>
      <h2>
          Hello ${newUser.firstName}.
      </h2>
      <div>
          We welcome you to the Marketplace platform
      </div>
      <div>
          You have subscribed to the plan ${plan.name}
      </div>
      <div>
          You will be charged ${plan.price} USD monthly
      </div>
      <div>
          Enjoy the content
      </div>
    </div>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function sendPayConfirmation( payment, content, user) {

  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: user.email,
    subject: `Payment confirmation for order N° ${payment.orderId}`,
    html: `<div>
        <h2>
            Order N° ${payment.orderId}.
        </h2>
        <div>
            You have bought ${content.name}
        </div>
        <div>
            Amount charged ${payment.amount/100} USD
        </div>
        <div>
            Enjoy the content
        </div>
    </div>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function requestResponded( state, content, user) {

  let respond= '';
  if (state === 1 ){
    respond = "approved";
  } else {
    respond = "negated";
  }
  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: user.email,
    subject: `Request respondend for content N° ${content.id}`,
    html: `<div>
        <h2>
            Content N° ${content.id}.
        </h2>
        <div>
            Your request has been ${respond}
        </div>
    </div>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


function sendSubscriptionPayConfirmation( payment, user) {

  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: user.email,
    subject: `Invoice N° ${payment.invoiceId} for your monthly subscription`,
    html: `<div>
        <h2>
            Invoice N° ${payment.invoiceId}.
        </h2>
        <div>
            Amount charged ${payment.amount} ${payment.currency}
        </div>
        <div>
            Enjoy the content
        </div>
    </div>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function sendActivationCode( content, user, code) {

  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: user.email,
    subject: ` Your code for your content is here`,
    html: `<div>
        <h2>
            Prodcut N° ${content.id}.
        </h2>
        <div>
            The code for your product ${content.title} is ${code.code}
        </div>
        <div>
            Enjoy the content
        </div>
    </div>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

function requestMoreCodes( content, user) {

  let mailOptions = {
    from: 'notificactionsmkd2@gmail.com',
    to: user.email,
    subject: `Please send more codes for ${content.id}`,
    html: `<div>
        <h2>
            Product id: ${content.id}
        </h2>
        <h2>
            Product name: ${content.title}
        </h2>
        <div>
            We are running out of codes please send some more
        </div>
        <div>
            Thanks
        </div>
    </div>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  sendRegisterConfirmation: sendRegisterConfirmation,
  sendRegisterConfirmationClient: sendRegisterConfirmationClient,
  sendPayConfirmation: sendPayConfirmation,
  sendSubscriptionPayConfirmation:sendSubscriptionPayConfirmation,
  requestResponded:requestResponded,
  sendActivationCode: sendActivationCode,
  requestMoreCodes: requestMoreCodes
};
