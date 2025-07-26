const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.emailUser,
        pass: config.emailPassword,
    },
});

exports.sendVerificationEmail = async (to, code) => {
    const mailOptions = {
        from: `"GharFindr" <${config.emailUser}>`,
        to,
        subject: 'Your Email Verification Code',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <b>${code}</b></p>`,
    };
    await transporter.sendMail(mailOptions);
};
