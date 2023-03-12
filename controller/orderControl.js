const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const createId = require('../helper/createId')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const adminModel = require('../models/adminModel')

let orderControl ={

    getUserOrders:async(req,res)=>{
        let _id= req.session.user._id
        let orders = await orderModel.find({userId:_id}).sort({_id:-1}).lean()   
        let Login = req.session.user.name

        res.render('orderHistory',{orders, Login})     
    },
    getUserOrderView:async(req,res)=>{
        let Login = req.session.user.name
        const _id = req.params.id
        let orders = await orderModel.findOne({ _id }).lean()
       
        res.render('orderView',{orders, Login})
    }


}


module.exports= orderControl     