const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'askaritech1990@gmail.com',
    pass: 'wiyh afwc sdua piou'
  }
});

exports.sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: 'askaritech1990@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire soon.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

exports.sendNotification = (email, subject, message) => {
  console.log("inside function");
  const mailOptions = {
    from: 'zulfiqarrakshan@gmail.com',
    to: email,
    subject: subject,
    text: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response, subject, message);
    }
  });
};
