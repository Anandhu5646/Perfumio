const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const sentOTP = require('../helper/otp')
const createId = require('../helper/createId')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const axios = require('axios')
const { userInfo } = require('os')




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
        } catch (error) {
            console.error(error);
            res.render('404page')
        }
    },


    getUserLogin: (req, res) => {
        try {

            req.session.InvalidMail ? message = "Email not exist. Please register" : message = null
            req.session.InvalidPassword ? message = "Password incorrect" : message = null
            res.render("userLogin", { message })
            console.log(message);
            req.session.InvalidMail = false
            req.session.InvalidPassword= false

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
                        console.log(userInfo);
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
        } catch(error) {
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
            res.render('productDetails', { products })
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

    // Product add to cart //
    getUserAddToCart: (req, res) => {

        return new Promise((resolve, reject) => {
            const user_id = req.session.user._id
            const pdt_id = req.params.id
            let Login = req.session.user.name;
            userModel.updateOne({ _id: user_id }, { $addToSet: { cart: { id: pdt_id, quantity: 1 } } }).then((result) => {
                res.redirect('/')
            }).catch((err) => {
                console.log(err);
                res.render('404page')
            })
        })
    },
    // Remove product from cart//

    getUserRemoveCart: async (req, res) => {
        try {
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
        } catch (error) {
            console.log(err);
            res.render('404page')
        }

    },

    // increment product quantity //
    incrementQuantity: async (req, res) => {
        try {
            const result = await userModel.updateOne(
                { _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } },
                {
                    $inc: {
                        "cart.$.quantity": 1
                    }
                }
            )

            if (result.nModified === 0) {
                return res.status(404).json({ message: 'Cart item not found' })
            }

            res.json({ success: true })
        } catch (err) {
            res.render('404page')
        }
    }
    ,

    // decrement product quantity //
    decrementQuantity: async (req, res) => {
        try {
            const { cart } = await userModel.findOne(
                { "cart.id": req.params.id },
                { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
            )

            if (!cart || cart.length === 0) {
                return res.status(404).json({ message: 'Cart item not found' })
            }

            if (cart[0].quantity <= 1) {
                await userModel.updateOne(
                    { _id: req.session.user._id },
                    {
                        $pull: {
                            cart: { id: req.params.id },
                        },
                    }
                )
            } else {
                await userModel.updateOne(
                    { _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } },
                    {
                        $inc: {
                            "cart.$.quantity": -1,
                        },
                    }
                )
            }

            // res.redirect('/cart')
            res.json({ success: true })
        } catch (err) {
            console.log(err);
            res.render('404page')
        }
    }
    ,


    getUserCartDetail: (req, res) => {
        try {
            if (!req.session.user) {
                res.redirect('/login');
                return;
            }

            return new Promise((resolve, reject) => {
                let Login = req.session.user.name
                let cartQuantity = {}

                let user_id = req.session.user._id
                userModel.findOne({ _id: user_id }, { cart: 1 }).then((cartDet) => {

                    let cartItems = cartDet.cart.map((item) => {
                        cartQuantity[item.id] = item.quantity
                        return item.id
                    })

                    if (cartItems.length === 0) {
                        res.render('cart', { message: 'cart empty' })
                        return;
                    }


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




                        res.render('cart', { products, TotalAmount, cartDet, totalMRP, Price, discount, Login })
                    })
                })


            })

        } catch (error) {
            console.log(err);
            res.render('404page')
        }


    }
    ,

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

    getUserCheckout: async (req, res) => {
        try {
            const _id = req.session.user._id
            let Login = req.session.user.name
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

            res.render('userCheckout', { products, totalPrice, address, cart, users, coupons, cashback, totPrice,Login })
            cashback = null
            req.session.coupon = null
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },


    postUserApplyCoupon: (req, res) => {

        return new Promise((resolve, reject) => {
            couponModel.findOne({ code: req.body.coupon }).then((coupon) => {
                if (!coupon) {
                    const message="Invalid Coupon"
                    res.redirect('/checkout',{message})
                }
                if (coupon.stock <= 0) {
                    const message= "Coupon out of stock"
                    res.redirect('/checkout',{message})
                   
                }


                req.session.coupon = coupon;
                couponModel.updateOne({ _id: coupon._id }, { $inc: { stock: -1 } })
                    .then(() => {
                        res.redirect("/checkout");
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                        res.render('404page')
                    });
            })
        });

    },
    getUserRemoveCoupon: (req, res) => {
        try {
            res.redirect('/checkout')
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },
   

    postUserCheckout: async (req, res) => {
        console.log(req.body);
        const userId = req.session.user._id;
           
        try {
          const user = await userModel.findById(userId).lean();
          const cart = user.cart.map(item => item.id);
          const { address } = await userModel.findOne({ _id: userId }, { address: 1 });
          const found = address.find(e => e.id == req.body.address);
          const products = await productModel.find({ _id: { $in: cart } }).lean();
      
          const orders = products.map((product, i) => ({
            address: found,
            products: product,
            userId,
            orderDate: new Date().toLocaleDateString(),
            quantity: user.cart[i].quantity,
            totalPrice: user.cart[i].quantity * product.price,
            discountedPrice: req.body.discountedPrice,
            payment: req.body.payment,
            paymentStatus: true
          }));
      
          for (let i = 0; i < products.length; i++) {
            await productModel.updateOne({ _id: products[i]._id }, { $inc: { stock: -1 * user.cart[i].quantity } });
          }


                

          req.session.orders = orders;
          
          if (req.body.payment !== 'cod') {
            
            let allprice= req.body.discountedPrice? req.body.discountedPrice: req.body.totalPrice
            const orderId = "order_" + createId();
            const options = {
              method: "POST",
              url: "https://sandbox.cashfree.com/pg/orders",
              headers: {
                accept: "application/json",
                "x-api-version": "2022-09-01",
                "x-client-id": '3321367e689eca6ab917be78c4631233',
                "x-client-secret": '1e3f26f5a41de3d03e035ce4976f0d1707df902d',
                "content-type": "application/json",
              },
              data: {
                order_id: orderId,
                order_amount:allprice,
                order_currency: "INR",   
                customer_details: {
                  customer_id: userId,
                  customer_email: 'anandhus186@gmail.com',
                  customer_phone: '9072858479',
                },
                order_meta: {
                  return_url: "http://localhost:7800/verifyPayment?order_id={order_id}",
                },
              },
            };
      
            await axios.request(options).then(function (response) {
              return res.render("paymentTemp", {
                orderId,
                sessionId: response.data.payment_session_id,
              });
            }).catch(function (error) {
              console.error(error);
            });
          } else {
            const order = await orderModel.create(orders);
            await userModel.findByIdAndUpdate(userId, { $set: { cart: [] } });
            console.log(order);
            res.render('orderSuccess');
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      }
      ,

    

    getUserPayment: async (req, res) => {

        try {
            const _id = req.session.user._id
            const order_id = req.query.order_id;
            const options = {
                method: "GET",
                url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
                headers: {
                    accept: "application/json",
                    "x-api-version": "2022-09-01",
                    "x-client-id": '3321367e689eca6ab917be78c4631233',
                    "x-client-secret": '1e3f26f5a41de3d03e035ce4976f0d1707df902d',
                    "content-type": "application/json",
                },
            }

            const response = await axios.request(options);


            if (response.data.order_status == "PAID") {

                await orderModel.create(req.session.orders)
                await userModel.findByIdAndUpdate({ _id }, {
                    $set: { cart: [] }
                })
                res.render('orderSuccess')


            }
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    }
    ,
    postUserAddAddress: async (req, res) => {
        try {
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
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    }
    ,
    postUserCheckoutAddAddress: async (req, res) => {
        try {
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
                    const wishLIstItems =wishListDetails.wishlist.map((item) => {
                      return item.id;
                    });
              
                   
                  // Get product details for cart items
                  const products = await productModel.find({ _id: { $in: wishLIstItems } }).lean();
               
              
                    
                res.render('userWishlist',{products,Login})
              }catch (error) {
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
    // Remove from wishlist // 
    getUserRemoveWishlist: async (req, res) => {
        return new Promise(async(resolve, reject) => {
            const user_id = req.session.user._id;
            const pdt_id = req.params.id;
            await userModel.updateOne({ _id: user_id },
                { $addToSet: { cart: { id: pdt_id } }
                   
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
  
      
   

}

module.exports = userControl
