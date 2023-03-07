const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')
const adminModel = require('../models/adminModel')
const sharp = require('sharp')
const fs = require('fs')
const { promisify } = require('util')
const couponModel = require('../models/couponModel')
const orderModel = require('../models/orderModel')
const unlinkAsync = promisify(fs.unlink)


let adminControl = {
    getAdminLogin: (req, res) => {
        try {
            if (req.session.admin) {
                res.redirect('/admin/home');
            } else {
                res.render('adminLogin');
            }
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                message: 'Internal Server Error',
                error,
            });
        }
    }
    ,

    postAdminLogin: async (req, res) => {
        try {
            const { email, password } = req.body;
            const adminInfo = await adminModel.findOne({ email });
            if (adminInfo) {
                if (adminInfo.password == password) {
                    req.session.admin = true;
                    res.render('adminHome');
                } else {
                    res.status(401).send('Invalid password');
                }
            } else {
                res.status(401).send('Invalid email');
            }
        } catch (err) {
            console.log(err);
            res.status(500).send('Internal server error');
        }
    }
    ,


    // admin user page// 
    getAdminUser: async (req, res) => {
        try {
            let users = await userModel.find({}, { password: 0 }).lean();
            res.render('adminUser', { users });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
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
        res.render('category', { categories })

    },
    //add category//
    getAdminAddCategory: (req, res) => {
        res.render('addCategory')
    },


    //save category//
    postAdminAddCategory: async (req, res) => {
        const { category } = req.body;

        try {
            // Check if category already exists 
            const existingCategory = await categoryModel.findOne({ category: { $regex: new RegExp(`^${category}$`, "i") } });

            if (existingCategory) {

                existingCategory.block = true;
                await existingCategory.save();
                res.render('addCategory', { error: true, message: "Category already exists" });
            } else {

                const newCategory = new categoryModel({ category, block: false });
                await newCategory.save();
                res.redirect('/admin/category');
            }
        } catch (err) {
            console.log(err);
            res.render('addCategory', { error: true, message: "Something went wrong" });
        }
    }
    ,
    //edit category//
    getAdminEditCat: async (req, res) => {
        const _id = req.params.id;
        const categories = await categoryModel.findOne({ _id }).lean()


        res.render('editCategory', { categories })




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

    // admin coupon //
    getAdminCoupon: async (req, res) => {
        let coupons = await couponModel.find({}).lean();
        res.render('adminCoupon', { coupons })

    },

    // add coupon //
    getAdminAddCoupon: (req, res) => {
        res.render('addCoupon')
    },


    // save coupon //
    postAdminAddCoupon: async (req, res) => {

        try {
            const { name, code, minAmount, discount, expiry, stock } = req.body;

            const existingCoupon = await couponModel.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });

            if (existingCoupon) {

                existingCoupon.block = true;
                await existingCoupon.save();
                res.render('addCoupon', { error: true, message: "Coupon already exists" });
            } else {

                const coupons = new couponModel({ name, code, minAmount, discount, expiry, stock, block: false });
                await coupons.save();
                res.redirect('/admin/coupon');
            }
        } catch (err) {
            console.log(err);
            res.render('addCoupon', { error: true, message: "Something went wrong" });
        }
    },

    // edit coupon //
    getAdminEditCoupon: async (req, res) => {
        try {
            const _id = req.params.id
            const coupons = await couponModel.findOne({ _id }).lean();
            res.render("editCoupon", { coupons });
        } catch (error) {
            console.log(error);
            res.redirect("/admin/coupon");
        }
    },

    // updated coupon //
    postAdminEditCoupon: async (req, res) => {
        let block = false;
        const { name, code, expiry, minAmount, discount, stock, _id } = req.body;
        console.log(req.body);

        try {
            await couponModel.findByIdAndUpdate(
                _id,
                {
                    $set: {
                        name,
                        code,
                        expiry,
                        minAmount,
                        discount,
                        stock,
                        block
                    }
                },
                { new: true }
            );
            res.redirect("/admin/coupon");
        } catch (error) {
            console.log(error);
            res.render("editCoupon");
        }
    },

    // block coupon //
    getAdminCouponBlock: (req, res) => {
        const _id = req.params.id
        couponModel.findByIdAndUpdate(_id, { $set: { block: true } },
            function (err, data) {
                if (err) {
                    res.redirect('/admin/coupon')
                } else {
                    res.redirect('/admin/coupon')
                }
            })
    },
    // coupon unblock//

    getAdminCouponUnblock: (req, res) => {
        const _id = req.params.id
        couponModel.findByIdAndUpdate(_id, { $set: { block: false } },
            function (err, data) {
                if (err) {
                    res.redirect('err')
                } else {
                    res.redirect('/admin/coupon')
                }
            })
    },

    // admin orders //
    getAdminOrders: async (req, res) => {
        let orders = await orderModel.find().lean()

        res.render('orders', { orders })
    },

    // order pending //
    getAdminOrderPending: async (req, res) => {
        let orderId = req.params.id
        console.log(orderId);
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'pending'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // order cancel //
    getAdminOrderCancel: async (req, res) => {
        let orderId = req.params.id;
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'Cancelled'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    // order shipping //
    getAdminOrderShipping: async (req, res) => {
        let orderId = req.params.id;
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'Shipped'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    // order delivered //
    getAdminOrderDelivered: async (req, res) => {
        let orderId = req.params.id;
        try {
            await orderModel.updateOne({ _id: orderId }, {
                $set: {
                    orderStatus: 'Delivered'
                }
            });
            res.redirect('/admin/order');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },
    getAdminSalesReport: async (req, res) => {
        const start = req.query.start
        const end = req.query.end
        let orders
    
        let deliveredOrders
        let salesCount
        let salesSum
        let result
        if (start) {
            orders = await orderModel.find({ orderDate: { $gte: start, $lt: end } }).lean()
    
            deliveredOrders = orders.filter(order => order.orderStatus === "Delivered")
            salesCount = await orderModel.countDocuments({ orderDate: { $gte: start, $lt: end }, orderStatus: "Delivered" })
            salesSum = deliveredOrders.reduce((acc, order) => acc + order.totalPrice, 0)
    
        } else {    
             
            deliveredOrders = await orderModel.find({ orderStatus: "Delivered" }).lean()
           
            salesCount = await orderModel.countDocuments({ orderStatus: "Delivered" })
            result = await orderModel.aggregate([{ $match: { orderStatus: "Delivered" } },
                 {
                $group: { _id: null, totalPrice: { $sum: '$totalPrice' } }
            }])
            salesSum = result[0].totalPrice
        }
        const users = await orderModel.distinct('userId')
        const userCount = users.length
        res.render('adminSalesreport', { userCount, salesCount, salesSum, deliveredOrders })
    }
    

     



}

module.exports = adminControl  