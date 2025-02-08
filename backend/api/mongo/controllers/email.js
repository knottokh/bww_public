let nodemailer = require('nodemailer');
let mg = require('nodemailer-mailgun-transport');
let Email = require('email-templates');
let path = require('path');
const config = require('../../config/index');

const GmailTransport = nodemailer.createTransport(config.transport.gmail);

const MailgunTransport = nodemailer.createTransport(
    mg(config.transport.mailgun)
);

const SMTPTransport = nodemailer.createTransport(config.transport.smtp);

module.exports.SelectEmailTransport = () => {
    if(config.mailserver === 'gmail'){
      return GmailTransport;
    }
    else if(config.mailserver === 'mailgun'){
      return MailgunTransport;
    }
    else{
      return SMTPTransport;
    }
}

module.exports.emailTransport = (transporter) => {
    //console.log(path.join(__dirname, '../templates/emails'));
    //console.log(path.join(__dirname, '../../templates/emails'));
    return new Email({
        transport: transporter,
        send: true,
        preview: false,
        views: {
          root: path.join(__dirname, '../../templates/emails'),
          options: {
            extension: 'hbs' // <---- HERE
          }
        }
    });
};