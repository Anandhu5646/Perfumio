const userModel = require('../models/userModel')
const sentOTP = require('../helper/otp')



let userControl = {
    getUserHome: (req, res) => {
        res.render('userHome')
    },
    getUserLogin: (req, res) => {

        res.render("userLogin")

    },
    getUserSignup: (req, res) => {
        res.render('userSignup')
    },
    postUserSignup: (req, res) => {
        console.log('otp send entered');
        req.session.userDetails= req.body
       
        
        let otp = Math.floor(Math.random() * 1000000)
        req.session.signupOTP = otp
        req.session.signupEmail = req.body.email
        sentOTP(req.body.email, otp)
        console.log('otp sent');
        res.redirect('/otp')

    },
    postUserLogin: async (req, res) => {

        const { email, password } = req.body
        const userInfo = await userModel.findOne({ email })
        if (userInfo) {
            if (password, userInfo.password) {
                res.redirect('/')
            } else {
                const InvalidUser = "Invaliduser name or password please try again"
                res.render('userLogin', { InvalidUser })
            }
        }
        else {
            const noUser = "No user found please register to continue"
            res.render('userSignup', { noUser })
        }

    },
    getUserOtp: (req, res) => {
        req.session.invalidOTP ? message = 'Invalid OTP' : message = null
        res.render('otpcheck', { message })
        req.session.invalidOTP = false
    },
    postUserOtp: (req, res) => {

        if (req.session.signupOTP == req.body.ottp) {

            let block = false
            let userDetails=req.session.userDetails
            console.log(userDetails);
            
            let users = new userModel({...userDetails, block })
            users.save((err, data) => {
                if (err) {
                    console.log(err)
                    res.render('userSignup', { error: true, message: 'Something went wrong' })
                } else {
                    res.redirect('/login')
                }
            })

        } else {
            req.session.invalidOTP = true;
            res.redirect('/otp')

        }

    }






}

module.exports = userControl
