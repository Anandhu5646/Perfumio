const { ObjectId } = require('mongodb');
const mongoose=require('mongoose')
const orderSchema= new mongoose.Schema({
    userId:{
        type:ObjectId,
        required:true
    },
   
     
    address:{
        type:Object,
        required:true    
    },
   
    orderStatus:{
        type:String,
        default:'available'
    },
    paymentStatus:{
        type:Boolean,
        required:true,
        default:false
    },
    payment:{
        type:String,
        required:true
    },
    products:{
        type:Object,
        required:true
    },
    couponStatus:{
        type:Boolean,
        required:true,
        default:false
    },
    totalPrice:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    
    
})
const orderModel= mongoose.model("orders", orderSchema);

module.exports=orderModel