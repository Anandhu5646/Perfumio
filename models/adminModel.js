const mongoose = require('mongoose'); 


var adminSchema = new mongoose.Schema({
 email:{
     type:String,
     required:true
 },
 password:{
    type:String,
    required:true
}
})


const adminModel= mongoose.model('admins', adminSchema);

module.exports=adminModel; 