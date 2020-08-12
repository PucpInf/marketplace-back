const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const paypal = require('paypal-rest-sdk');
require('dotenv').config();
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const providersRouter = require('./routes/providers');
const clientsRouter = require('./routes/clients');
const plansRouter = require('./routes/subscriptionPlans');
const regionsRouter = require('./routes/regions');
const categorysRouter = require('./routes/categorys');
const contentsRouter = require('./routes/contents');
const expressip = require('express-ip');
const solicitudRouter = require('./routes/solicitudes');
import {createConnection} from 'typeorm'


const allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, x-access-token,Nombre-Archivo');
  res.header('Access-Control-Expose-Headers', 'Authorization, File-Name');
  next();
};

createConnection().then(async (connection) => {


  const app = express();
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(allowCrossDomain);
  app.use('/plans', plansRouter);
  //usar rutas para nuevas clases aqui
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(expressip().getIpInfoMiddleware);

  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/providers', providersRouter);
  app.use('/clients', clientsRouter);

  app.use('/regions', regionsRouter);
  app.use('/categorys', categorysRouter);
  app.use('/contents', contentsRouter);
  app.use('/solicitud', solicitudRouter);

// catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

// error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
  app.listen(process.env.PORT || 80);
});
// view engine setup

//module.exports = app;
