require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./api/config/index');
const connectMongo = require('./api/config/mongo').init;
const log = require('./log');

//const port = process.env.PORT || 3000;

const server = http.createServer(app);

// connect to services
connectMongo();

server.listen(config.server.port, err => {
  if (err) {
    log.err('server', 'could not start listening', err.message || err);
    process.exit();
  }
  log.log('env', `app starting in "${config.env}" mode...`);
  log.log('server', `Express server is listening on ${config.server.port}...`);
});