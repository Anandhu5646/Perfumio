const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const sentOTP = require('../helper/otp')
const createId = require('../helper/createId')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const axios = require('axios')
const swal = require('sweetalert')




let userControl = {
    getUserHome: async (req, res) => {
        try {
            const products = await productModel.find({}).sort({ _id: -1 }).lean();
            const user = await userModel.findOne({}).lean();

            let Login = null;
            if (req.session.user) {
                Login = req.session.user.name;
            }

            res.render('userHome', { products, Login });
            req.session.sub = products.sub
        } catch (error) {
            console.error(error);
            res.render('404page')
        }
    },


    getUserLogin: (req, res) => {
        try {

            req.session.InvalidMail ? message = "Email not exist. Please register" : message = null
            req.session.InvalidPassword ? message = "Password incorrect" : message = null
            req.session.Blockeduser ? message = "User blocked" : message = null
            res.render("userLogin", { message })

            req.session.InvalidMail = false
            req.session.InvalidPassword = false
            req.session.Blockeduser = false
        } catch (error) {
            console.error(error)
            res.render('404page')
        }
    }

    ,
    getUserSignup: async (req, res) => {
        try {
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
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },
    postUserSignup: async (req, res) => {

        try {



            req.session.userDetails = req.body
            let otp = Math.floor(Math.random() * 1000000)
            req.session.signupOTP = otp
            req.session.signupEmail = req.body.email
            sentOTP(req.body.email, otp)
            res.redirect('/otp')
            console.log(otp);
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },
    // user login page

    postUserLogin: async (req, res) => {
        try {


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
                        req.session.InvalidPassword = true
                        res.redirect('/login')
                    }

                }

            } else {

                req.session.InvalidMail = true
                res.redirect('/login')
            }

            if (userInfo) {
                if (userInfo.block == true) {
                    req.session.Blockeduser = true
                    res.redirect('/login')
                }
            }
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },

    // otp page
    getUserOtp: (req, res) => {
        try {


            req.session.invalidOTP ? message = 'Invalid OTP' : message = null
            res.render('otpcheck', { message })
            req.session.invalidOTP = false
        } catch (error) {
            console.error(error)
            res.render('404page')
        }
    },
    //submit userotp
    postUserOtp: (req, res) => {
        try {
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
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },

    resendOTP: (req, res) => {
        try {
            let otp = Math.floor(Math.random() * 1000000);
            sentOTP(req.session.signupEmail, otp);
            req.session.signupOTP = otp;
            var countDownTime = 60000; 1
            setTimeout(() => {
                otp = undefined;
            }, countDownTime);
            res.redirect("/otp");
            console.log("resend otp" + otp);
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },
    //  product details //

    getUserProductDetails: async (req, res) => {
        try {
            const _id = req.params.id
            let Login = req.session.user.name
            let products = await productModel.findOne({ _id }).lean()

            if (req.session.user) {

                res.render('productDetails', { products, Login })

            } else {
                res.render('productDetails', { products })
            }
        } catch (error) {
            console.error(error)
            res.render('404page')
        }



    },





    // user profile//

    getUserProfile: async (req, res) => {

        try {
            let _id = req.session.user._id
            let Login = req.session.user.name
            let addressDet = await userModel.findOne({ _id }, { address: 1 }).lean()
            res.render('profile', { addressDet, Login })
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },

    // user edit address //
    getUserEditAddress: async (req, res) => {
        try {
            let Id = req.params.id

            let { address } = await userModel.findOne({ _id: req.session.user._id }, { address: 1 }).lean()
            let data = address.find(e => e.id == Id)

            if (req.session.user) {
                res.render('userEditAddress', { data })
            }
            else {
                res.redirect('/profile')
            }
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },

    // save user edit address //
    postUserEditAddress: async (req, res) => {
        try {
            await userModel.updateOne(
                { _id: req.session.user._id, "address._id": req.body.id },
                {
                    $set: {
                        "address.$.name": req.body.name,
                        "address.$.mobile": req.body.mobile,
                        "address.$.pincode": req.body.pincode,
                        "address.$.landmark": req.body.landmark,
                        "address.$.address": req.body.address,
                        "address.$.city": req.body.city,
                        "address.$.state": req.body.state
                    }
                }
            );


            res.redirect("/profile");
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },

    // Delete user address //
    getUserDeleteAddress: async (req, res) => {
        try {
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
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },

    // user logout //
    getUserLogout: (req, res) => {
        try {
            req.session.user = null
            res.redirect('/')

        } catch (error) {
            console.error(error)
            res.render('404page')
        }
    },
    // user add address //   
    getUserAddAddress: (req, res) => {
        try {
            res.render('userAddAddress')
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    },


    postUserAddAddress: async (req, res) => {
        try {
            const { name, mobile, pincode, landmark, address, city, state } = req.body;

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
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    }   
    ,
    postUserCheckoutAddAddress: async (req, res) => {
        try {
            const { name, mobile, pincode, landmark, address, city, state } = req.body;

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

            res.redirect('/checkout');
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    }
    ,
    getUserWishlist: async (req, res) => {
        try {
            // Check if user is logged in
            if (!req.session.user) {
                return res.redirect("/login");
            }

            // Get user and wish list details
            const user = req.session.user;
            const userId = user._id;
            let Login = req.session.user.name
            const wishListDetails = await userModel.findOne({ _id: userId }, { wishlist: 1 });
            console.log(wishListDetails);

            // Get cart items 
            const wishLIstItems = wishListDetails.wishlist.map((item) => {
                return item.id;
            });


            // Get product details for cart items
            const products = await productModel.find({ _id: { $in: wishLIstItems } }).lean();



            res.render('userWishlist', { products, Login })
        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: 'Internal Server Error',
            });
        }

    },


    // Add to wishlist //
    getUserAddToWishlist: async (req, res) => {

        try {

            const user_id = req.session.user._id;
            const pdt_id = req.params.id;
            await userModel.updateOne(
                { _id: user_id },
                { $addToSet: { wishlist: { id: pdt_id } } }
            );
          
            res.redirect("/");

        } catch (err) {
            // Handle errors
            console.error(err);
            res.status(500).json({
                message: 'Server error',
            });
        }
    },
    // Wishlist to cart add // 
    getUserWishlistToCart: async (req, res) => {
        return new Promise(async (resolve, reject) => {
            const user_id = req.session.user._id;
            const pdt_id = req.params.id;
            await userModel.updateOne({ _id: user_id },
                {
                    $addToSet: { cart: { id: pdt_id } }

                })
            await userModel.updateOne(
                { _id: user_id },
                {
                    $pull: {
                        wishlist: { id: pdt_id }
                    }
                }
            )

            res.redirect("/cart");
        })
    },
    getUserRemoveFromWishlist: async (req, res) => {
        const user_id = req.session.user._id;
        const pdt_id = req.params.id;
        await userModel.updateOne(
            { _id: user_id },
            {
                $pull: {
                    wishlist: { id: pdt_id }
                }
            }
        )
        res.redirect("/wishlist")

    },

    getMenCategory: async (req, res) => {
        const products = await productModel.find({ category: 'Men' }).sort({ _id: -1 }).lean();
        const user = await userModel.findOne({}).lean();
        const categ = await categoryModel.find({}).lean();

        Login = req.session.user.name
        if (req.session.menstat) {
            res.render('menCategory', {
                menproducts: req.session.menproducts,
                Login,
                menstat: req.session.menstat,
                categ
            })
        }else if(req.session.menstats){
            res.render('menCategory', {
                menproducts: req.session.menproducts,
                Login,
                menstat: req.session.menstats,
                categ
            })
        }
        else{

            res.render('menCategory', { products, Login })
        }
    },

    menLowToHighCategory: async (req, res) => {
        let menproducts
       
            menproducts = await productModel.find({ category:'Men' }).sort({ price: 1 }).lean();

        let menstat = true
        req.session.menproducts = menproducts
        req.session.menstat = menstat
        res.redirect('/men')
    },


    menHighTolowCategory: async (req, res) => {
        let menproducts
       
        menproducts = await productModel.find({ category:'Men' }).sort({ price: -1 }).lean();

    let menstats = true
    req.session.menproducts = menproducts
    req.session.menstats = menstats
    res.redirect('/men')
    },



    getWomenCategory: async (req, res) => {
        const products = await productModel.find({ category: 'Women' }).sort({ _id: -1 }).lean();
        const categ = await categoryModel.find({}).lean();
        Login = req.session.user.name
        if (req.session.womenstat) {
            res.render('womenCategory', {
                womenproducts: req.session.womenproducts,
                Login,
                womenstat: req.session.womenstat,
                categ
            })
        }else if(req.session.womenstats){
            res.render('womenCategory', {
                womenproducts: req.session.womenproducts,
                Login,
                womenstat: req.session.womenstats,
                categ
            })
        }
        else{

            res.render('womenCategory', { products, Login })
        }
    },
    womenLowToHighCategory: async (req, res) => {
        let womenproducts
       
            womenproducts = await productModel.find({ category:'Women' }).sort({ price: 1 }).lean();

        let womenstat = true
        req.session.womenproducts = womenproducts
        req.session.womenstat = womenstat
        res.redirect('/women')
    },


    womenHighTolowCategory: async (req, res) => {
        let womenproducts
       
        womenproducts = await productModel.find({ category:'Women' }).sort({ price: -1 }).lean();

    let womenstats = true
    req.session.womenproducts = womenproducts
    req.session.womenstats = womenstats
    res.redirect('/women')
    },




    getUserAllProducts: async (req, res) => {

        try {
            Login = req.session.user.name
            const brands = await productModel.aggregate([{ $group: { _id: "$sub" } }]);

            const categ = await categoryModel.find({}).lean();

            req.session.pageNum = parseInt(req.query.page ?? 1);
            req.session.perpage = 3;
            let allproducts = await productModel.find().countDocuments().then(documentCount => {
                docCount = documentCount;
                return productModel
                    .find()
                    .skip((req.session.pageNum - 1) * req.session.perpage)
                    .limit(req.session.perpage)
                    .lean();
            });
            username = req.session.user;
            let pageCount = Math.ceil(docCount / req.session.perpage);
            let pagination = [];
            for (i = 1; i <= pageCount; i++) {
                pagination.push(i);
            }
    
            if (req.session.pstatus) {
                res.render("allProducts", {
                    categ,
                    brands,
                    pricepro: req.session.pricepro,
                    pstatus: req.session.pstatus,
                    Login,
                    pagination
                });
                req.session.pstatus = false;
            } else if (req.session.pstatuss) {
                res.render("allProducts", {
                    categ,
                    brands,
                    pstatuss: req.session.pstatuss,
                    priceprod: req.session.priceprod,
                    Login,
                    pagination
                });
                req.session.pstatuss = false;
            } else if (req.session.catstatus) {
                res.render("allProducts", {
                    catgproducts: req.session.catgproducts,
                    status: req.session.catstatus,
                    Login,
                    pagination
                });

            } else if (req.session.brandstatus) {
                res.render("allProducts", {
                    categ,
                    brands,
                    brandstatus: req.session.brandstatus,
                    brandproduct: req.session.brandproduct,
                    Login,
                    pagination

                });

            } else {
                res.render("allProducts", { allproducts, categ, brands, Login });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Internal server error");
        }

    },
    sortLowToHigh: async (req, res) => {

        try {
            let pricepro
            if (req.session.brandstatus) {
                pricepro = await productModel
                    .find({ sub: req.session.brandstatus })
                    .sort({ price: 1 })
                    .lean();

            } else {
                pricepro = await productModel
                    .find()
                    .sort({ price: 1 })
                    .lean();

            }
            let pstatus = true;
            req.session.pricepro = pricepro;
            req.session.pstatus = pstatus;
            res.redirect("/allProducts");
        } catch (error) {
            console.log(error);
        }

    },
    sortHighToLow: async (req, res) => {
        try {
            let priceprod;
            let pstatuss = true;
            if (req.session.brandstatus) {
                console.log("brand is present");
                priceprod = await productModel
                    .find({ brand: req.session.brandstatus })
                    .sort({ price: -1 })
                    .lean();
            } else {
                console.log("brand is not present");
                priceprod = await productModel
                    .find()
                    .sort({ price: -1 })
                    .lean();
            }
            req.session.pstatuss = pstatuss;
            req.session.priceprod = priceprod;
            res.redirect("/allProducts");
        } catch (error) {
            console.log(error);
        }

    },
    categoryFilterPdt: async (req, res) => {
        try {
            const catgy = req.params.catgy;

            const catgproducts = await productModel.find({ category: catgy }).lean();

            let catstatus = true;
            console.log(catgproducts);
            req.session.catstatus = catstatus;
            req.session.catgproducts = catgproducts;

            res.redirect("/allProducts");
        } catch (err) {
            console.error(err);
        }
    },
    postUserSearch: async (req, res) => {


        try {
            Login = req.session.user.name
            const [category, sub] = await Promise.all([
                productModel.find({ block: false }).lean(),
                categoryModel.find({ block: false }).lean()

            ]);

            if (req.body.name) {
                const products = await productModel.find({
                    $and: [
                        { status: 'available' },
                        {
                            $or: [
                                { name: new RegExp(req.body.name, 'i') },
                                { category: new RegExp(req.body.name, 'i') }
                            ]
                        }
                    ]
                }).lean();

                res.render('allProducts', { products, category, sub, Login });
            } else {

                res.render('allProducts', { category, sub, Login });
            }

        } catch (err) {
            console.log('Error:', err);
            // Handle the error here
        }
    },




}

module.exports = userControl

