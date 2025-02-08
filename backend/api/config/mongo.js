const autoincrement = require('mongodb-autoincrement');
const mongoose = require('mongoose');
const Promise = require('bluebird');
let multer = require('multer');
let Grid = require('gridfs-stream');
var GridFsStorage = require('multer-gridfs-storage');
const config = require('./index');
const log = require('../../log');
autoincrement.setDefaults({
  field: '_counter'
});
// mongoose.plugin(autoincrement.mongoosePlugin, {
//   field: '_counter'
// });
mongoose.Promise = Promise; // plug-in bluebird as mongoose Promise
// to export: init mongo connection, set logging
var gfs;
var upload;
var connection;
const init = () => {
  connectMongo();
  connection = mongoose.connection;
  //mongoose.connection.on('connected', () => {
  //  log.log('mongo', `connected to db: "${config.mongo.host}"`);
  //});
  mongoose.connection.on('error', err => log.err('mongo', 'error', err.message || err));

  connection.on('error', console.error.bind(console, 'connection error:'));
  connection.once('connected', function () {
    log.log('mongo', `connected to db: "${config.mongo.host}"`);
    var mongoDriver = mongoose.mongo;
    gfs = new Grid(connection.db, mongoDriver);

  });
};

// connect to mongo host, set retry on initial fail
const connectMongo = () => {
  mongoose.connect(config.mongo.host, config.mongo.options)
    .catch(err => {
      log.err('mongo', 'connection to db failed', err.message || err);
      setTimeout(connectMongo, 2000);
    });

  /*mongoose.connect(
    "mongodb+srv://dbTedstat:" +
      "YJKFeWzy3NrmyTw2" +
      "@tedstat-wvyih.mongodb.net/test?retryWrites=true",
      { useNewUrlParser: true,  useFindAndModify: false }
  );*/
}

const getgfs = () => {
  return gfs;
}

const geupload = () => {
  return upload;
}

const getconnectiondb = () => {
  return connection.db;
}
//module.exports = init;
module.exports = {
  init: init,
  gfs: getgfs,
  upload: geupload,
  db: getconnectiondb
};