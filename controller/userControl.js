const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const sentOTP = require('../helper/otp')



let userControl = {
    getUserHome: async (req, res) => {
        
        let products = await productModel.find({}).lean();
        let users = await userModel.findOne({}).lean()
        

            if(req.session.user){
                const Login= req.session.user
                res.render('userHome',{products,Login})
                console.log(Login);
            }else{
                res.render('userHome',{products})
            }
            
         
        
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
            if(userInfo.block==false){
            if (password==userInfo.password) {
                    req.session.user= userInfo.name
                    res.redirect('/')
                
                
            } else {
                const InvalidUser = "Invaliduser name or password please try again"
                res.render('userLogin', { InvalidUser })
            }
        }
        else {
            const noUser = "No user found please register to continue"
            res.render('userSignup', { noUser })
        }}
        else{
            res.render('userLogin')
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

    },
    getUserProductDetails:async (req,res)=>{
        
        const _id = req.params.id
        let products =await productModel.findOne({_id}).lean()
        console.log(_id)
        res.render('productDetails',{products})
            

            
           
        
    },
    getUserCart: (req,res)=>{
        if(req.session.user){

            res.render('cart')
        }else{
            res.redirect('/login')
        }
    },
    getUserProfile: async(req,res)=>{
        if(req.session.user){
            
            let users= await userModel.findOne({},{password:0,email:0})
            res.render('profile',{users})
            console.log(users)
        }else{
            res.redirect('/login')
        }
    },
    
    getUserLogout:(req,res)=>{
        req.session.user=null
        res.render('/')
    }






}

module.exports = userControl
