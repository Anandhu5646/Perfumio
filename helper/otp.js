const nodemailer=require('nodemailer')


let sentOtp=(email,otp)=>{
    return new Promise((resolve,reject)=>{
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
        port: 465, // Port for SMTP (usually 465)
        secure: true,
        tls: { 
          rejectUnauthorized: false
        }, // Usually true if connecting to port 465
        auth: {
          user: process.env.OTP_EMAIL, // Your email address
          pass: process.env.APP_PASSWORD, // Password (for gmail, your app password)
        },
      });
  
           var mailOptions={
            from: process.env.OTP_EMAIL,
            to: email,
            subject: "Perfumio Email verification",
            html: `
            <h1>Verify Your Email For Perfumio</h1>
              <h3>use this code to verify your email</h3>
              <h2>${otp}</h2>
            `,
          }
    
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("email sent error ", error)
              reject(error)
            } else {
              console.log("email sent successfull")
              resolve(otp)
            }
          });
    
    })
}
module.exports=sentOtp;

