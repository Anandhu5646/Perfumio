const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const sentOTP = require('../helper/otp')



let userControl = {
    getUserHome: async (req, res) => {

        let products = await productModel.find({}).lean();
        let users = await userModel.findOne({}).lean()


        if (req.session.user) {
            const Login = req.session.user.name
            res.render('userHome', { products, Login })
        } else {
            res.render('userHome', { products })
        }



    },
    getUserLogin: (req, res) => {

        res.render("userLogin")

    },
    getUserSignup: async (req, res) => {
        const newUserEmail = req.body.email;

        const users = await userModel.findOne({ email: newUserEmail });
        if (users) {
            let message = "This email already exists";
            //  ? message = 'Invalid OTP' : message = null
            // res.render('otpcheck', { message })
            // req.session.invalidOTP = false
            res.render('userSignup', { message });
        }
        else {
            message = null
            res.render('userSignup')
        }


    },
    postUserSignup: async (req, res) => {

        req.session.userDetails = req.body


        let otp = Math.floor(Math.random() * 1000000)
        req.session.signupOTP = otp
        req.session.signupEmail = req.body.email
        sentOTP(req.body.email, otp)
        res.redirect('/otp')



    },
    // user login page
    postUserLogin: async (req, res) => {

        const { email, password } = req.body
        const userInfo = await userModel.findOne({ email })

        if (userInfo) {
            if (userInfo.block == false) {
                if (password == userInfo.password) {
                    req.session.user = userInfo
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
        }
        else {
            res.render('userLogin')
        }

    },
    // otp page
    getUserOtp: (req, res) => {
        req.session.invalidOTP ? message = 'Invalid OTP' : message = null
        res.render('otpcheck', { message })
        req.session.invalidOTP = false
    },
    //submit userotp
    postUserOtp: (req, res) => {

        if (req.session.signupOTP == req.body.ottp) {

            let block = false
            let userDetails = req.session.userDetails

            let users = new userModel({ ...userDetails, block })
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
    //  product details //

    getUserProductDetails: async (req, res) => {

        const _id = req.params.id
        let products = await productModel.findOne({ _id }).lean()
        res.render('productDetails', { products })
        if (req.session.user) {
            const Login = req.session.user.name
            res.render('productDetails', { products, Login })

        } else {
            res.render('productDetails', { products })
        }

    },


    getUserAddCart: (req, res) => {
        return new Promise((resolve, reject) => {
            const user_id = req.session.user._id
            const pdt_id = req.params.id
            userModel.updateOne({ _id: user_id }, { $addToSet: { cart: { id: pdt_id, quantity: 1 } } }).then((result) => {
                res.redirect('/')
            })


        })

    },
    increment: (req, res) => {
        return new Promise((resolve, reject) => {

            userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {

                $inc: {
                    "cart.$.quantity": 1
                }

            }).then((result) => {

                res.redirect('/cart')
            })


        })


    },
    decrement: async (req, res) => {
        await userModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {

            $inc: {
                "cart.$.quantity": -1
            }

        })

        res.render('cart')


    },

    getUserCartDetail: async (req, res) => {
        return new Promise((resolve, reject) => {
            if (req.session.user) {
                let cartQuantity = {}
                let user_id = req.session.user._id
                userModel.findOne({ _id: user_id }, { cart: 1 }).then((cartDet) => {
                    console.log(cartDet);
                    let cartItems = cartDet.cart.map((item) => {
                        cartQuantity[item.id] = item.quantity
                        return item.id
                    })
                    productModel.find({ _id: { $in: cartItems } }).lean().then((products) => {
                        let TotalAmount = 0
                        // let cartDatas = cartDet.cart.map((item, index) => {
                        //     return { ...item, quantity: cartQuantity[item._id] }
                        // })
                        
                        products.forEach((item, index) => {
                            products[index].quantity = cartQuantity[item._id]
                            TotalAmount = (TotalAmount + item.price * cartQuantity[item._id])
                        })
                        let totalMRP = 0
                        products.forEach((item, index) => {
                            totalMRP = totalMRP + item.mrp * cartQuantity[item._id];
                        })
                        res.render('cart', { products, TotalAmount,cartDet, totalMRP })
                    })
                })
            } else {
                res.redirect('/login')
            }

        })


    },



    getUserProfile: async (req, res) => {
        if (req.session.user) {

            let users = await userModel.findOne({}, { password: 0, email: 0 })
            res.render('profile', { users })
        } else {
            res.redirect('/login')
        }
    },

    getUserLogout: (req, res) => {
        req.session.user = null
        res.redirect('/')
    }






}

module.exports = userControl
