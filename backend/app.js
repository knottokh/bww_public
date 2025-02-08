const express = require("express");
const app = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');
//const passport = require('passport');
const config = require('./api/config');

const router = require('./api/mongo/routes/routes.index');

/*mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb+srv://dbTedstat:" +
    environment.MONGO_ATLAS_PW +
    "@tedstat-wvyih.mongodb.net/test?retryWrites=true",
    { useNewUrlParser: true,  useFindAndModify: false }
);*/
//mongoose.set('useFindOneAndUpdate', true);
//mongoose.set('useFindOneAndReplace', true);
//mongoose.set('useFindOneAndDelete', true);

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));


// File upload handler
//var siofu      = require('./api/filetransfer');
//    app.use(siofu.router);


//app.use(passport.initialize());
//require('./api/config/passport')(passport);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// static folder
app.use(config.subpath, express.static(path.join(__dirname, 'dist')));
//app.use(config.subpath + '/uploads', express.static('uploads'));

app.use(config.root, router);


app.use((req, res, next) => {
  /*const error = new Error("Not found");
  error.status = 404;
  next(error);*/
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// set error handling middleware
//app.use(errorMiddleware);

app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'dist/index.html'));
});

module.exports = app;
