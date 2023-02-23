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
        let orders = await orderModel.find({userId:_id}).lean()   


        res.render('orderHistory',{orders})     
    },
    getUserOrderView:(req,res)=>{
        res.render('orderView')
    }


}


module.exports= orderControl