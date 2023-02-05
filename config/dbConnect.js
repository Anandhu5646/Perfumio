const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    })
}


module.exports= dbConnect;