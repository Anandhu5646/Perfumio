const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
        
    },
    category:{
        type:String,
        required:true
       
    },
    brand:{
        type:String,
        required:true
    },
    
    price:{
        type:Number,
        required:true
    },
    
    image:{
        type:Object,
        required:true
    },
    block:{ 
        type:Boolean,
        required:true
    }
});


const productModel= mongoose.model('products', productSchema);

module.exports=productModel;  
