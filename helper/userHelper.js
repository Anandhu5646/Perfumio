const userModel = require('../models/userModel');
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const Razorpay = require('razorpay');
const createId = require('./createId');


const instance = new Razorpay({
    key_id: 'rzp_test_nTLjY58pnEvQon',
    key_secret: '6SN1bXlOBsMhj3GpWXOxq14x'
  })

let userHelper = {

    
    generateRazorpay: (orderID, totalPrice) => {
        return new Promise((resolve, reject) => {
            const options = {
                amount: totalPrice * 100,
                currency: "INR",
                receipt: orderID
            };

            instance.orders.create(options, (err, order) => {
                resolve(order)
            });
         
        });
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            let crypto = require('crypto')
            let hamc = crypto.createHmac('sha256', '6SN1bXlOBsMhj3GpWXOxq14x')
            hamc.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
            hamc = hamc.digest('hex')
            if (hamc == details.payment.razorpay_signature) {
                resolve()
            } else {
                reject()
            }
        });
    }


}


module.exports = userHelper