const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const createId = require('../helper/createId')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const adminModel = require('../models/adminModel')
const moment = require('moment');
const axios = require('axios')

let orderControl ={

    getUserOrders:async(req,res)=>{
        let Login = req.session.user.name
        let _id= req.session.user._id
        let orders = await orderModel.find({userId:_id}).sort({_id:-1}).lean()   

        res.render('orderHistory',{orders, Login})     
    },
    getUserOrderView:async(req,res)=>{
        let Login = req.session.user.name
        const _id = req.params.id
        let orders = await orderModel.findOne({ _id }).lean()
        res.render('orderView',{orders, Login})
    },
    getUserOrderCancel: async (req, res) => {
        try {
            const _id = req.params.id;
            await orderModel.findByIdAndUpdate(_id, { $set: {orderStatus: 'Cancelled', cancel: true } });
            res.redirect('/orderView/'+_id);
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
   
    getUserOrderReturn: async (req, res) => {
        let _id = req.params.id;
        try {
            await orderModel.findByIdAndUpdate({ _id }, {
                $set: {
                    orderStatus: 'Return',
                    return:true
                }
            });
            res.redirect('/orderView/'+_id);
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    getAdminOrders: async (req, res) => {
        let adorders = await orderModel.find().sort({_id:-1}).lean()
        adorders.forEach(order => {
            order.orderDate = moment(order.orderDate).format('DD/MM/YYYY');
          });
        res.render('orders', { adorders })
    },// order pending //
    getAdminOrderPending: async (req, res) => {
        let orderId = req.params.id
        console.log(orderId);
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'pending'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {   
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

   
    // order shipping //
    getAdminOrderShipping: async (req, res) => {
        let orderId = req.params.id;
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'Shipped'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    // order delivered //
    getAdminOrderDelivered: async (req, res) => {
        let orderId = req.params.id;
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'Delivered'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    getAdminOrderCancelled: async (req, res) => {
        let orderId = req.params.id;
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'Cancelled'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    adOrderView:async(req,res)=>{
        const _id = req.params.id
        let adorders= await orderModel.findOne({_id}).lean()
        res.render('adOrderView',{adorders})
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

            res.render('userCheckout', { products,chkaddress:req.session.chkaddress, totalPrice, address, cart, users, coupons, cashback, totPrice, Login })
            cashback = null
            req.session.coupon = null
            req.session.chkaddress= null
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },

    postUserCheckout: async (req, res) => {

        const userId = req.session.user._id;
        try {
            
            let Login = req.session.user.name
            const user = await userModel.findById(userId).lean();
            const cart = user.cart.map(item => item.id);
            const { address } = await userModel.findOne({ _id: userId }, { address: 1 });
            const found = address.find(e => e.id == req.body.address);
            const products = await productModel.find({ _id: { $in: cart } }).lean();
            
            const orders = products.map((product, i) => ({
                address: found,
                products: product,
                userId,
                orderDate: new Date(),
                quantity: user.cart[i].quantity ?? 1,
                totalPrice: (user.cart[i].quantity ?? 1) * product.price ,
                discountedPrice: req.body.discountedPrice ?? 0,
                payment: req.body.payment,
                paymentStatus: true
            }));
           

            for (let i = 0; i < products.length; i++) {
                await productModel.updateOne({ _id: products[i]._id }, { $inc: { stock: -1 * user.cart[i].quantity } });
            }

            req.session.orders = orders;

            if (req.body.payment !== 'cod') {

                let allprice = req.body.discountedPrice ? req.body.discountedPrice : req.body.totalPrice
           
                const orderId = "order_" + createId();
                const options = {
                    method: "POST",
                    url: "https://sandbox.cashfree.com/pg/orders",
                    headers: {
                        accept: "application/json",
                        "x-api-version": "2022-09-01",
                        "x-client-id": process.env.PAYMENT_ID,
                        "x-client-secret": process.env.SECRET_KEY,
                        "content-type": "application/json",
                    },
                    data: {
                        order_id: orderId,
                        order_amount: allprice,
                        order_currency: "INR",
                        customer_details: {
                            customer_id: userId,
                            customer_email: process.env.CUSTOMER_EMAIL,
                            customer_phone: process.env.CUSTOMER_MOB,
                        },
                        order_meta: {
                            return_url: "https://perfume.kkfoods.online/verifyPayment?order_id={order_id}",
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

                res.render('orderSuccess',{Login});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
            res.render('404page')
        }
    }
    ,
    getUserPayment: async (req, res) => {

        try {
            let Login = req.session.user.name
            const _id = req.session.user._id
            const order_id = req.query.order_id;
            const options = {
                method: "GET",
                url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
                headers: {
                    accept: "application/json",
                    "x-api-version": "2022-09-01",
                    "x-client-id": process.env.PAYMENT_ID,
                    "x-client-secret": process.env.SECRET_KEY,
                    "content-type": "application/json",
                },
            }

            const response = await axios.request(options);


            if (response.data.order_status == "PAID") {

                await orderModel.create(req.session.orders)
                await userModel.findByIdAndUpdate({ _id }, {
                    $set: { cart: [] }
                })
                res.render('orderSuccess',{Login})


            }
        } catch (error) {
            console.error(error)
            res.render('404page')
        }

    }
    ,
    postUserApplyCoupon: (req, res) => {

        return new Promise((resolve, reject) => {
            couponModel.findOne({ code: req.body.coupon }).then((coupon) => {
        
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
     
}


module.exports= orderControl     
