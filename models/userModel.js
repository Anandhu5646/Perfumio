const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
        
    },
    email:{ 
        type:String,
        required:true,
        // unique:true,
        lowercase:true
    },
    mobile:{
        type:String, 
        required:true,
        // unique:true
    }, 
    password:{
        type:String,
        required:true
    }, 
    
    block:{ 
        type:Boolean,
        required:true
    },
    address:{   
        type:Array,
        default:[]
    },
    cart:{
        type:Array,
        default:[]
    },
    wishlist:{
        type:Array,
        default:[]
    }
});


const userModel= mongoose.model('users', userSchema);

module.exports=userModel; 