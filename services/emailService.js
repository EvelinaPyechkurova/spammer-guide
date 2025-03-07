require('dotenv').config({ path: '../.env' });
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// send given text message to given addressess
async function sendEmailToList(addressList, text) {

    for(const address of addressList){
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: address.email,
            subject: "Spammer's guide study project",
            text: `Dear ${address.user.surname} ${address.user.name} ${address.user.fathername},\n` + text
        };

        try{
            await transporter.sendMail(mailOptions);
            console.log(`Send email to ${address.email}`);
        }catch(error){
            console.error(`Error sending email to ${address.email}:`, error);
        }
    }
};

module.exports = sendEmailToList;