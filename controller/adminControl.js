const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')



var adminControl = {
    getAdminLogin: (req, res) => {
        res.render('adminLogin')
    },

    postAdminLogin: (req, res) => {
        let admin = {
            email: "admin@gmail.com",
            password: "123"
        }
        const { email, password } = req.body
        if (admin.email == email && admin.password == password) {
            req.session.admin = true
            res.render('adminHome')
        } else {
            res.redirect('/')
        }
    },
    getAdminHome: (req, res) => {
        res.render('adminHome')
    },

    
    getAdminUser: async (req, res) => {
        let users = await userModel.find({}, { pasword: 0 }).lean()
        console.log(users)
        if (req.session.admin) {
            res.render('adminUser', { users })
        } else {
            res.redirect('/admin')
        }
        // ,
        //    { adminEmail:req.session.admin.email}


    },
    getAdminLogout: (req, res) => {
        req.session.destroy()
        res.redirect('/admin/')
    },
    getAdminUserBlock: (req, res) => {
        const _id = req.params.id
        userModel.findByIdAndUpdate(_id, { $set: { block: true } },
            function (err, data) {
                if (err) {
                    res.redirect('/admin/user')
                } else {
                    res.redirect('/admin/user')
                }
            })
    },
    getAdminuserUnblock: (req, res) => {
        const _id = req.params.id
        userModel.findByIdAndUpdate(_id, { $set: { block: false } },
            function (err, data) {
                if (err) {
                    res.redirect('err')
                } else {
                    res.redirect('/admin/user')
                }
            })
    },

    postAdminuserSearch: async (req, res) => {
        const { key } = req.body
        const users = await userModel.find({ name: new RegExp(key, 'i') }).lean();
        res.render('adminUser', { users })
    },
    getAdminCategory: async (req, res) => {
        let categories = await categoryModel.find({}).lean();
        if (req.session.admin) {
            res.render('category', { categories })
        } else {
            res.redirect('/admin/')
        }
    },
    getAdminAddCategory: (req, res) => {

        res.render('addCategory')
    },
    postAdminAddCategory: (req, res) => {
        const { category, sub ,block } = req.body
        let categories = new categoryModel({ category, sub, block })
        categories.save((err, data) => {
            if (err) {
                console.log(err)
                res.render('category', { error: true, message: "Something went wrong" })
            } else {
                console.log('category added')
                red.render('category')
            }
        })

    },
    getAdminUpdateCat: async (req, res) => {
        const _id = req.params.id;
        console.log(_id)
        const categories = await categoryModel.findOne({ _id }).lean()
        if (req.session.admin) {
            res.render('category', { categories })
        }
        else {
            res.redirect('/admin/')
        }


    },
    getAdminEditCat: async(req,res)=>{
        const _id=req.params.id;
        console.log(_id)
        const categories=await categoryModel.findOne({_id}).lean()
        if(req.session.admin){
           res.render('editCategory',{categories})
        }
       else{
        res.redirect('/category')
       }
    
    
      },
      postAdminEditCat: (req,res)=>{
    
        const _id=req.body._id;
        categoryModel.findByIdAndUpdate(_id,{$set:{category:req.body.Category,sub:req.body.Sub}},
        (err,docs)=>{
          if(err){
            console.log(err)
          }
          else{
            console.log('succcessfull')
            res.redirect('/category')
          }
    
        })
    
      },


    
    getAdmincatBlock: (req, res) => {
        const _id = req.params.id
        categoryModel.findByIdAndUpdate(_id, { $set: { block: true } },
            function (err, data) {
                if (err) {
                    res.redirect('/admin/category')
                } else {
                    res.redirect('/admin/category')
                }
            })
    },
    getAdminCatUnblock: (req, res) => {
        const cat = req.params.id
        categoryModel.findByIdAndUpdate(cat, { $set: { block: false } },
            function (err, data) {
                if (err) {
                    res.redirect('err')
                } else {
                    res.redirect('/admin/category')
                }
            })
    },

    getAdminAddProduct:  (req, res) => {
       
       
            res.render('addproduct')
    },
    getAdminProduct: async (req, res) => {
        let products = await productModel.find({}).lean()
        console.log(products)
        if (req.session.admin) {
            res.render('products', { products })
        } else {
            res.redirect('/admin')
        }},
    // add product//
    postAdminSaveProduct: (req,res)=>{
        console.log(req.body)
        console.log(req.files.image[0])
        let block= false
        let {name,category,brand,price} = req.body
        let products= new productModel({name,category,brand,price,block,image:req.files.image[0]})
        products.save((err,data)=>{
            if(err){
                console.log(err)
                res.render('addproduct',{error:true},{message:'something went wrong'})
            }else{
                console.log('product saved')
                res.redirect('/admin/product')
            }
        })

    },
    //product block//

    getAdminPdtBlock: (req, res) => {
        const _id = req.params.id
        productModel.findByIdAndUpdate(_id, { $set: { block: true } },
            function (err, data) {
                if (err) {
                    res.redirect('/admin/product')
                } else {
                    res.redirect('/admin/product')
                }
            })
    },
    //product unblock//

    getAdminPdtUnblock:(req, res) => {
        const _id = req.params.id
        productModel.findByIdAndUpdate(_id, { $set: { block: false } },
            function (err, data) {
                if (err) {
                    res.redirect('err')
                } else {
                    res.redirect('/admin/product')
                }
            })
    }


        



}
module.exports = adminControl