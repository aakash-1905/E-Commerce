const nodeMailer = require('nodemailer');

const dotenv = require('dotenv');

dotenv.config({path:'./config/config.env'});

const sendEmail = async (options) => {
    //1. create a transporter
    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
       service: process.env.SMTP_SERVICE,
       auth:{
              user: process.env.SMTP_MAIL,
              pass: process.env.SMTP_PASSWORD,
       },
    });
    //2. define the email options
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    //3. send the email
    await transporter.sendMail(mailOptions)
} ;
module.exports = sendEmail;