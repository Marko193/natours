const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1. Create a transporter - it`ll sent the email
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    //2.Define the email options
    const mailOptions = {
        from: options.email,
        to: 'Marko Pavlenko <marik8998@gmail.com>',
        subject: options.subject,
        text: options.message
            //html: 
    };

    //3. Actually send the email 
    /*const result = */
    await transporter.sendMail(mailOptions);
    //console.log(result)
};

//The first possibel solution
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports = sendEmail;