const nodemailer = require('nodemailer');
const config = require('../config/config'); 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.emailUser, 
    pass: config.emailPassword 
  }
});

const sendEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text || !html) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields in the request body'
    });
  }

  try {
    await transporter.sendMail({
      from: `GharFindr <${config.emailUser}>`, 
      to,
      subject,
      text, 
      html  
    });

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
};

module.exports = { sendEmail };