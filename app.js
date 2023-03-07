const express = require('express');
const dbConnect = require('./config/dbConnect')
const app= express();
const dotenv = require("dotenv").config();
const userRouter= require('./routes/userRoute')
const bodyParser= require('body-parser')
const path= require('path')
const {engine} = require("express-handlebars") 
const adminRouter= require('./routes/adminRoute')
const session=require('express-session')



dbConnect();



app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine','hbs')
app.use(express.static(__dirname+ "/public"))
app.set('views',[ path.join(__dirname,'views/admin'),path.join(__dirname, 'views/user')])
app.engine("hbs", engine({extname:".hbs"}))
app.use(express.urlencoded({extended:false}))
app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});
app.use(session({secret:"key",resave:false,saveUninitialized:true}))

let hbs = require('handlebars');

hbs.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
// app.use('*',(req,res)=>{
 
//  res.render('404page')
// })
app.use('/admin',adminRouter);
app.use('/', userRouter);

app.listen(7800, ()=>{
    console.log('Server is running at http://localhost:7800 ')
})

