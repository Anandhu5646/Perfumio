const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')
const adminModel = require('../models/adminModel')
const sharp = require('sharp')
const fs = require('fs')
const { promisify } = require('util')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const moment = require('moment');



let productControl={

//add product//
getAdminAddProduct: async (req, res) => {

    let categories = await categoryModel.find({}).lean();
    res.render('addproduct', { categories })
},
//products//
getAdminProduct: async (req, res) => {
    let categories = await categoryModel.find({}).lean()

    let products = await productModel.find({}).sort({ _id: -1 }).lean()

    res.render('products', { products, categories })

},
// save product//
postAdminSaveProduct: async (req, res) => {
    try {
        let block = false
        let { name, description, category, sub, price, mrp, stock } = req.body

        await sharp(req.files.image[0].path)
            .png()
            .resize(300, 300, {
                kernel: sharp.kernel.nearest,
                fit: 'contain',
                position: 'center',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .toFile(req.files.image[0].path + ".png")
        req.files.image[0].filename = req.files.image[0].filename + ".png"
        req.files.image[0].path = req.files.image[0].path + ".png"

        let products = new productModel({
            name, description, category, sub, price, mrp, stock, block,
            image: req.files.image[0], subimage: req.files.subimage
        })

        await products.save()
        console.log('product saved')
        res.redirect('/admin/product')
    } catch (err) {
        console.error(err)
        res.render('addproduct', { error: true }, { message: 'something went wrong' })
    }
}
,
//product block//

getAdminPdtBlock: async (req, res) => {
    try {
        const _id = req.params.id;
        await productModel.findByIdAndUpdate(_id, { $set: { block: true } });
        res.redirect("/admin/product");
    } catch (error) {
        console.log(error);
        res.redirect("/admin/product");
    }
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


        res.render('editProduct', { products, categories })




    },
    //update product//
    postAdminEditProduct: async (req, res) => {
        try {
            let block = false
            const { name, description, category, sub, price, mrp, stock, _id } = req.body;

            if (!req.files?.image && !req.files?.subimage) {
                await productModel.updateOne({ _id }, {
                    $set: {
                        name, description, category, sub, price, mrp, stock, block
                    },
                }).lean()

                return res.redirect('/admin/product')
            }

            if (req.files?.image && req.files?.subimage) {
                sharp(req.files.image[0].path)
                    .png()
                    .resize(300, 300, {
                        kernel: sharp.kernel.nearest,
                        fit: 'contain',
                        position: 'center',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .toFile(req.files.image[0].path + ".png")
                    .then(() => {
                        req.files.image[0].filename = req.files.image[0].filename + ".png"
                        req.files.image[0].path = req.files.image[0].path + ".png"
                    })

                await productModel.updateOne({ _id }, {
                    $set: {
                        name, description, category, sub, price, mrp, stock, block, image: req.files.image[0], subimage: req.files.subimage
                    },
                }).lean()

                return res.redirect('/admin/product')
            }

            if (!req.files?.image && req.files?.subimage) {
                await productModel.updateOne({ _id }, {
                    $set: {
                        name, description, category, sub, price, mrp, stock, block, subimage: req.files.subimage
                    },
                }).lean()

                return res.redirect('/admin/product')
            }

            if (req.files?.image && !req.files?.subimage) {
                sharp(req.files.image[0].path)
                    .png()
                    .resize(300, 300, {
                        kernel: sharp.kernel.nearest,
                        fit: 'contain',
                        position: 'center',
                        background: { r: 255, g: 255, b: 255, alpha: 0 }
                    })
                    .toFile(req.files.image[0].path + ".png")
                    .then(() => {
                        req.files.image[0].filename = req.files.image[0].filename + ".png"
                        req.files.image[0].path = req.files.image[0].path + ".png"
                    })

                await productModel.updateOne({ _id }, {
                    $set: {
                        name, description, category, sub, price, mrp, stock, block, image: req.files.image[0]
                    },
                }).lean()

                return res.redirect('/admin/product')
            }
        } catch (error) {
            console.error(error)
            res.render('error', { message: 'Something went wrong' })
        }
    }
    ,

}

module.exports= productControl