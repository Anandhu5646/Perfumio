const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')



var adminControl = {
    getAdminLogin: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin/home')
        } else {
            res.render('adminLogin')
        }

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
        req.session.admin = null
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
    //category//
    getAdminCategory: async (req, res) => {
        let categories = await categoryModel.find({}).lean();
        if (req.session.admin) {
            res.render('category', { categories })
        } else {
            res.redirect('/admin/')
        }
    },
    //add category//
    getAdminAddCategory: (req, res) => {

        if (req.session.admin) {
            res.render('addCategory')
        } else {
            res.redirect('/admin/')
        }


    },
    //save category//
    postAdminAddCategory: (req, res) => {

        let block = false
        const { category, sub } = req.body
        let categories = new categoryModel({ category, sub, block })
        categories.save((err, data) => {
            if (err) {
                console.log(err)
                res.render('addCategory', { error: true, message: "Something went wrong" })
            } else {
                console.log('category added')
                res.redirect('/admin/category')
            }
        })

    }
    ,
    //edit category//
    getAdminEditCat: async (req, res) => {
        const _id = req.params.id;
        const categories = await categoryModel.findOne({ _id }).lean()
        // let existingCategory =await categoryModel.findOne({categoryModel:req.body.category})
        // if(existingCategory){
        //     req.session.existingCat ? message = 'Existing Category' : message = null
        //     res.render('editCategory',{message})
        //     req.session.existingCat=false
        // }
        if (req.session.admin) {
            res.render('editCategory', { categories })
        }
        else {
            res.redirect('/admin/category')
        }


    },
    postAdminEditCat: async (req, res) => {
        let block = false



        categoryModel.findByIdAndUpdate({ _id: req.body._id }, { $set: { category: req.body.category } },
            (err, docs) => {
                if (err) {
                    console.log(err)
                    res.render('editCategory')
                }
                else {
                    console.log('succcessfull')
                    res.redirect('/admin/category')
                }

            })

    },


    //category block//
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
    //category unblock//
    getAdminCatUnblock: (req, res) => {
        const _id = req.params.id
        categoryModel.findByIdAndUpdate(_id, { $set: { block: false } },
            function (err, data) {
                if (err) {
                    res.redirect('err')
                } else {
                    res.redirect('/admin/category')
                }
            })
    },
    //add product//
    getAdminAddProduct: async (req, res) => {

        let categories = await categoryModel.find({}).lean();
        res.render('addproduct', { categories })
    },
    //products//
    getAdminProduct: async (req, res) => {
        let categories = await categoryModel.find({}).lean()

        let products = await productModel.find({}).lean()

        // console.log(products, categories)
        if (req.session.admin) {
            res.render('products', { products, categories })
        } else {
            res.redirect('/admin')
        }
    },
    // save product//
    postAdminSaveProduct: async (req, res) => {
       
        let block = false
        let { name, description, category, sub, price, mrp, stock } = req.body
       
        let mainImage = req.files.image[0], sideImages = req.files.subimage
        await sharp(mainImage.path)
            .png()
            .resize(540, 540, {
                kernel: sharp.kernel.nearest,
                fit: 'contain',
                position: 'center',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFile(mainImage.path + ".png")
            .then(async () => {
                await unlinkAsync(mainImage.path)
                mainImage.path = mainImage.path + ".png"
                mainImage.filename = mainImage.filename + ".png"
            });
        for (let i in sideImages) {
            await sharp(sideImages[i].path)
                .png()
                .resize(540, 540, {
                    kernel: sharp.kernel.nearest,
                    fit: 'contain',
                    position: 'center',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toFile(sideImages[i].path + ".png")
                .then(async () => {
                    await unlinkAsync(sideImages[i].path)
                    sideImages[i].filename = sideImages[i].filename + ".png"
                    sideImages[i].path = sideImages[i].path + ".png"
                });
        }
        console.log(mainImage)
        console.log(sideImages)
        let products = new productModel({
            name, description, category, sub, price, mrp, stock, block,
            image: req.files.image[0], subimage: req.files.subimage
        })
        products.save((err, data) => {
            if (err) {
                console.log(err)
                res.render('addproduct', { error: true }, { message: 'something went wrong' })
            } else {
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

    getAdminPdtUnblock: (req, res) => {
        const _id = req.params.id
        productModel.findByIdAndUpdate(_id, { $set: { block: false } },
            function (err, data) {
                if (err) {
                    res.redirect('err')
                } else {
                    res.redirect('/admin/product')
                }
            })
    },
    // edit product//
    getAdminEditProduct: async (req, res) => {
        const _id = req.params.id;
        const products = await productModel.findOne({ _id }).lean()
        const categories = await categoryModel.findOne({ _id }).lean()
        console.log(_id);
        if (req.session.admin) {

            res.render('editProduct', { products, categories })
        }
        else {
            res.redirect('/admin/product')
        }


    },
    //update product//
    postAdminEditProduct: async (req, res) => {
        let block = false

        const { name, description, category, sub, price, mrp, stock, _id } = req.body;
        console.log(req.body);
        if (req.files?.image && req.files?.subimage) {
            let products = await productModel.updateOne({ _id }, {
                $set: {
                    name, description, category, sub, price, mrp, stock, block, image: req.files.image[0], subimage: req.files.subimage

                },
            }
            ).lean()
            console.log(req.files)
            return res.redirect('/admin/product')

        }
        if (!req.files?.image && req.files?.subimage) {
            let products = await productModel.updateOne({ _id }, {
                $set: {
                    name, description, category, sub, price, mrp, stock, block, subimage: req.files.subimage

                },
            }
            ).lean()
            return res.redirect('/admin/product')
        } if (req.files?.image && !req.files?.subimage) {
            let products = await productModel.updateOne({ _id }, {
                $set: {
                    name, description, category, sub, price, mrp, stock, block, image: req.files.image[0]

                },
            }
            ).lean()
            return res.redirect('/admin/product')
        }
        if (!req.files?.image && !req.files?.subimage) {
            let products = await productModel.updateOne({ _id }, {
                $set: {
                    name, description, category, sub, price, mrp, stock, block

                },
            }
            ).lean()
            return res.redirect('/admin/product')
        }

    },





}

module.exports = adminControl