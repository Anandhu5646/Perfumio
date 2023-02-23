const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const sentOTP = require('../helper/otp')
const createId = require('../helper/createId')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')



let userControl = {
    getUserHome: async (req, res) => {

        let products = await productModel.find({}).sort({ _id: -1 }).lean();
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

            res.render('userSignup', { message });
        }
        else {
            message = null
            res.render('userSignup')
        }


    },
    postUserSignup: async (req, res) => {
        // const { name, email,mobile, password } = req.body;
        // if (email == "" || name == "" || mobile == "" || password == "") {
        //     return res.render("/signup", {
        //         error: true,
        //         message: "all fields must be filled",
        //     });
        // }
        // const user = await userModel.findOne({ email });
        // if (user) {
        //     return res.render("/signup", {
        //         error: true,
        //         message: "User Already exists please Login",
        //     });
        // }



        req.session.userDetails = req.body

        let otp = Math.floor(Math.random() * 1000000)
        req.session.signupOTP = otp
        req.session.signupEmail = req.body.email
        sentOTP(req.body.email, otp)
        res.redirect('/otp')



    },
    // user login page

    postUserLogin: async (req, res) => {
        // Check if user is already logged in
        if (req.session.user) {
            res.redirect('/')
            return
        }

        const { email, password } = req.body
        const userInfo = await userModel.findOne({ email })

        if (userInfo) {
            if (userInfo.block == false) {
                if (password == userInfo.password) {
                    req.session.user = userInfo
                    res.redirect('/')
                } else {
                    const InvalidUser = "Invalid username or password, please try again"
                    res.render('userLogin', { InvalidUser })
                }
            } else {
                const noUser = "Your account has been blocked. Please contact customer support."
                res.render('userLogin', { noUser })
            }
        } else {
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

    resendOTP: (req, res) => {
        res.redirect("/otp");
        let otp = Math.floor(Math.random() * 1000000);
        sentOtp(signupEmail, otp);
        console.log("reseb" + otp);
        signupOTP = otp;
        // ##############
        var countDownTime = 60000;
        setTimeout(() => {
            otp = undefined;

        }, countDownTime);
        // ############## 
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

    // Product add to cart //
    getUserAddToCart: (req, res) => {
        return new Promise((resolve, reject) => {
            const user_id = req.session.user._id
            const pdt_id = req.params.id
            userModel.updateOne({ _id: user_id }, { $addToSet: { cart: { id: pdt_id, quantity: 1 } } }).then((result) => {
                res.redirect('/')
            })


        })

    },
    // Remove product from cart//

    getUserRemoveCart: async (req, res) => {
        const user_id = req.session.user._id;
        const pdt_id = req.params.id;
        await userModel.updateOne(
            { _id: user_id },
            {
                $pull: {
                    cart: { id: pdt_id }
                }
            }
        )
        res.redirect("/cart")
    },

    // increment product quantity //
    incrementQuantity: (req, res) => {
        return new Promise((resolve, reject) => {

            userModel.updateOne({ _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } }, {

                $inc: {
                    "cart.$.quantity": 1
                }

            }).then((result) => {

                res.redirect('/cart')
            })


        })


    },

    // decrement product quantity //
    decrementQuantity: async (req, res) => {


        let { cart } = await userModel.findOne(
            { "cart.id": req.params.id },
            { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
        )

        if (cart[0].quantity <= 1) {
            await userModel.updateOne(
                { _id: req.session.user._id },
                {
                    $pull: {
                        cart: { id: req.params.id },
                    },
                }
            )
            res.redirect('/cart')
        } else {

            await userModel.updateOne(
                { _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } },
                {
                    $inc: {
                        "cart.$.quantity": -1,
                    },
                }
            );
            res.redirect('/cart')
        }
    },


    getUserCartDetail: async (req, res) => {

        if (!req.session.user) {
            res.redirect('/login');
            return;
        }

        return new Promise((resolve, reject) => {
            if (req.session.user) {
                let cartQuantity = {}

                let user_id = req.session.user._id
                userModel.findOne({ _id: user_id }, { cart: 1 }).then((cartDet) => {

                    let cartItems = cartDet.cart.map((item) => {
                        cartQuantity[item.id] = item.quantity
                        return item.id
                    })
                    productModel.find({ _id: { $in: cartItems } }).lean().then((products) => {
                        let TotalAmount = 0
                        let totalMRP = 0
                        let Price = 0
                        let discount = 0
                        products.forEach((item, index) => {
                            const quantity = cartQuantity[item._id]
                            products[index].quantity = quantity
                            const itemPrice = item.price * quantity
                            TotalAmount += itemPrice
                            totalMRP += item.mrp * quantity
                            Price += itemPrice
                            discount = totalMRP - TotalAmount
                        })




                        res.render('cart', { products, TotalAmount, cartDet, totalMRP, Price, discount })
                    })
                })
            } else {
                res.redirect('/login')
            }

        })


    },

    // user profile//

    getUserProfile: async (req, res) => {
        let _id = req.session.user._id
        let addressDet = await userModel.findOne({ _id }, { address: 1 }).lean()
        if (addressDet.address.length > 4) {
            const maxAddress = "Only 3 address can be added"
            res.render('profile', { addressDet, maxAddress })
        } else {
            res.render('profile', { addressDet })
            maxAddress = null
        }
    },

    // user edit address //
    getUserEditAddress: async (req, res) => {
        let Id = req.params.id

        let { address } = await userModel.findOne({ _id: req.session.user._id }, { address: 1 }).lean()
        let data = address.find(e => e.id == Id)

        if (req.session.user) {
            res.render('userEditAddress', { data })
        }
        else {
            res.redirect('/profile')
        }
    },

    // save user edit address //
    postUserEditAddress: async (req, res) => {
        await userModel.updateOne(
            { _id: req.session.user._id, address: { $elemMatch: { id: req.body.id } } },
            {
                $set: {
                    "address.$": req.body,
                },
            }
        );
        res.redirect("/profile");
    },

    // Delete user address //
    getUserDeleteAddress: async (req, res) => {
        await userModel.updateOne(
            {
                _id: req.session.user._id,
                address: { $elemMatch: { id: req.params.id } }
            },
            {
                $pull: {
                    address: {
                        id: req.params.id
                    }
                }
            }
        )
        res.redirect("/profile");
    },

    // user logout //
    getUserLogout: (req, res) => {
        req.session.user = null
        res.redirect('/')
    },
    // user add address //   
    getUserAddAddress: (req, res) => {


        res.render('userAddAddress')
    },

    getUserCheckout: async (req, res) => {

        const _id = req.session.user._id

        const users = await userModel.findById({ _id }).lean()
        const address = users.address
        const cart = users.cart
        const cartQuantities = {}
        const cartItems = cart.map((item) => {
            cartQuantities[item.id] = item.quantity
            return item.id;
        })


        const product = await productModel.find({ _id: { $in: cartItems } }).lean()
        const products = product.map(item => {
            return { ...item, quantity: cartQuantities[item._id] }
        })
        let shipping = 50
        let totPrice;
        let totalPrice = 0;
        let coupons = await couponModel.find().lean()

        products.forEach((item, index) => {
            item.totalAmount = item.price * item.quantity
            totalPrice = totalPrice + item.price * item.quantity;
            totPrice = totalPrice + shipping
        })

        let coupon = req.session.coupon

        let cashback = {}
        if (coupon) {
            if (totPrice > coupon.minAmount) {
                cashback.discountedPrice = totPrice - coupon.discount
                cashback.discount = coupon.discount
            }
        }
      
        res.render('userCheckout', { products, totalPrice, address, cart, users, coupons, cashback, totPrice })
        cashback = null
        req.session.coupon = null
    },
    postUserApplyCoupon: (req, res) => {


        return new Promise((resolve, reject) => {
            couponModel.findOne({ code: req.body.coupon }).then((coupon) => {
                req.session.coupon = coupon;
                res.redirect("/checkout");
            });
        });

    },
    postUserCheckout: async (req, res) => {
        const _id = req.session.user._id

        const users = await userModel.findById({ _id }).lean();

            
        const cart = users.cart  
        
        
        const cartItems = cart.map(item => { 
            return item.id
        })
        

        const { address } = await userModel.findOne({ _id: _id }, { address : 1 })
        let found = address.find(e => e.address_id = req.body.address)
        
        const product = await productModel.find({ _id: { $in: cartItems } }).lean();
            
        let orders = []
        let i = 0
        
        for (let item of product) {      
            orders.push({
                address: found,
                products: item,
                userId: req.session.user._id,
                quantity: cart[i].quantity,
                totalPrice: cart[i].quantity * item.price,
                payment: req.body.payment
            })
            i++;
        }
        
        const order = await orderModel.create(orders) 
        await userModel.findByIdAndUpdate({ _id }, {
            $set: { cart: [] }
        }) 
        console.log(order);  
        res.render('orderSuccess')
    },





    // save user add address //

    postUserAddAddress: async (req, res) => {
        const { name, mobile, pincode, landmark, address, city, state } = req.body;
        console.log(req.body);
        await userModel.updateOne(
            { _id: req.session.user._id },
            {
                $addToSet: {
                    address: {
                        name,
                        mobile,
                        pincode,
                        landmark,
                        address,
                        city,
                        state,
                        id: createId(),
                    },
                },
            }
        );

        res.redirect('/profile');
    }
    ,
    getUserWishlist: async (req, res) => {
        _id = req.session.user._id
        const users = await userModel.findById(_id).populate('wishlist');
        const products = users.wishlist;
        res.render("userWishlist", { products });
    },


    // Add to wishlist //
    getUserAddToWishlist: async (req, res) => {
        const user_id = req.session.user._id;
        const pdt_id = req.params.id;
        await userModel.updateOne(
            { user_id },
            {
                $addToSet: {
                    wishlist: pdt_id,
                },
            }
        );
        res.redirect('/wishlist');
    },
    // Remove from wishlist // 
    getUserRemoveWishlist: async (req, res) => {
        const user_id = req.session.user._id;
        const pdt_id = req.params.id;
        await userModel.updateOne(
            { user_id },
            {
                $pull: {
                    wishlist: pdt_id
                }
            }
        );
        res.redirect("/wishlist");
    },      
    




}

module.exports = userControl
