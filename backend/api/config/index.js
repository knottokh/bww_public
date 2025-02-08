// get configs from environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 13500;
const MONGO_HOST = process.env.MONGO_HOST || '';
const SECRET = process.env.SECRET || '';
const SUB_PATH = process.env.SUB_PATH || '';
const UPLOAD_ROOT_URL = process.env.UPLOAD_ROOT_URL || '';
const ROOT = SUB_PATH + (process.env.ROOT || '/api');
const CHAT_PATH = process.env.CHAT_PATH || ROOT + '/chat/vajira-chat.io';
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || ('http://localhost:3000' + ROOT);
const FRONTEND_ROOT = (process.env.FRONTEND_ROOT || 'http://localhost:4200') + SUB_PATH;
const EXPIRE_IN = process.env.EXPIRE_IN ||  604800;//'1h';

const MAIL_SERVER = process.env.MAIL_SERVER || 'mailgun'
const EMAIL_SENDER = process.env.EMAIL_SENDER || ''
//# Gmail SMTP server Configuration
const GMAIL_SERVICE_NAME = process.env.GMAIL_SERVICE_NAME || 'gmail';
const GMAIL_SERVICE_HOST = process.env.GMAIL_SERVICE_HOST || 'smtp.google.com';
const GMAIL_SERVICE_SECURE = process.env.GMAIL_SERVICE_SECURE || false;
const GMAIL_SERVICE_PORT = process.env.GMAIL_SERVICE_PORT || 587;
const GMAIL_USER_NAME = process.env.GMAIL_USER_NAME || '';
const GMAIL_USER_PASSWORD = process.env.GMAIL_USER_PASSWORD || '';

//# Mailgun service configuration
const MAILGUN_SERVICE_API_KEY = process.env.MAILGUN_SERVICE_API_KEY || '';
const MAILGUN_SERVICE_DOMAIN = process.env.MAILGUN_SERVICE_DOMAIN || '';

//# SMTP service configuration
const SMTP_SERVICE_HOST = process.env.SMTP_SERVICE_HOST || '';
const SMTP_SERVICE_SECURE = process.env.SMTP_SERVICE_SECURE || '';
const SMTP_SERVICE_PORT = process.env.SMTP_SERVICE_PORT || '';
const SMTP_USER_NAME = process.env.SMTP_USER_NAME || '';
const SMTP_USER_PASSWORD = process.env.SMTP_USER_PASSWORD || '';

// init config obj containing the app settings
const config = {
  env: NODE_ENV,
  root: ROOT,
  subpath: SUB_PATH,
  frontendroot: FRONTEND_ROOT,
  server: {
    port: PORT,
  },
  uploadRoot: UPLOAD_ROOT_URL,
  expiresIn: EXPIRE_IN,
  mongo: {
    host: MONGO_HOST,
    options: {
      useNewUrlParser: true,  useFindAndModify: false,
      useUnifiedTopology: true,
      server: {
        reconnectTries: Number.MAX_VALUE,
      },
    },
  },
  secret: SECRET,
  chatPath: CHAT_PATH,
  externalAPIUrl: EXTERNAL_API_URL,
  mailserver: MAIL_SERVER,
  transport:{
    sender: EMAIL_SENDER,
    gmail: {
      service: GMAIL_SERVICE_NAME,
      host: GMAIL_SERVICE_HOST,
      secure: GMAIL_SERVICE_SECURE,
      port: GMAIL_SERVICE_PORT,
      auth: {
          user: GMAIL_USER_NAME,
          pass: GMAIL_USER_PASSWORD
      }
    },
    mailgun:{
      auth: {
        api_key: MAILGUN_SERVICE_API_KEY,
        domain: MAILGUN_SERVICE_DOMAIN
      }
      //,proxy: 'http://'+ environment.MAILGUN_USER_NAME +':'+ environment.MAILGUN_USER_PASSWORD +'@localhost:3000' // optional proxy, default is false
    },
    smtp: {
      host: SMTP_SERVICE_HOST,
      port: SMTP_SERVICE_PORT,
      secure: SMTP_SERVICE_SECURE, // upgrade later with STARTTLS
      debug: true,
      auth: {
          user: SMTP_USER_NAME,
          pass: SMTP_USER_PASSWORD
      }
    }
  }
};

module.exports = config;