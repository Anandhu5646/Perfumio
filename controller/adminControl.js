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



let adminControl = {
    getAdminLogin: (req, res) => {
        try {
            if (req.session.admin) {
                res.redirect('/admin/');
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
    getAdminDashboard: async (req, res) => {
        try {
            const orderCount = await orderModel.countDocuments().lean();

            const deliveredOrders = await orderModel.find({ orderStatus: "Delivered" }).lean();

            let totalRevenue = 0;
            let Orders = await Promise.all(deliveredOrders.map(async (item) => {
                totalRevenue = totalRevenue + item.totalPrice;
                return item;
            }));

            const monthlyDataArray = await orderModel.aggregate([
                { $match: { orderStatus: "Delivered" } },

                {
                    $group: {
                        _id: { $month: "$orderDate" },
                        sum: { $sum: "$totalPrice" }
                    }
                },
            ]);

            const monthlyReturnArray = await orderModel.aggregate([
                {
                    $match: { orderStatus: "Return" }
                },
                {
                    $group: {
                        _id: { $month: "$orderDate" },
                        sum: { $sum: "$totalPrice" }
                    }
                }
            ]);

            let monthlyDataObject = {};
            let monthlyReturnObject = {}
            monthlyDataArray.map((item) => {
                monthlyDataObject[item._id] = item.sum;
            });
            monthlyReturnArray.map(item => {
                monthlyReturnObject[item._id] = item.sum
            })
            let monthlyReturn = []
            for (let i = 1; i <= 12; i++) {
                monthlyReturn[i - 1] = monthlyReturnObject[i] ?? 0
            }
            let monthlyData = [];
            for (let i = 1; i <= 12; i++) {
                monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
            }
            const online = await orderModel.find({ payment: "online" }).countDocuments().lean();
            const cod = await orderModel.find({ payment: "cod" }).countDocuments().lean();
            const userCount = await userModel.countDocuments().lean();

            const productCount = await productModel.countDocuments().lean();
            res.render("dashboard", {
                totalRevenue,
                orderCount,
                monthlyData,
                monthlyReturn,
                online,
                cod,
                productCount,
                userCount,
            });
        } catch (error) {
            console.log(error)
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
                    res.redirect('/admin/dashboard');
                } else {
                    res.status(401).send('Invalid password');
                    res.redirect('/admin/')
                }
            } else {
                res.status(401).send('Invalid email');
                res.redirect('/admin/')
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
    
    



    getAdminSalesReport: async (req, res) => {
     
        let orders
        let deliveredOrders
        let salesCount
        let salesSum
        let result
        let start = new Date(new Date().setDate(new Date().getDate() - 8));
        let end = new Date();
        let filter = req.query.filter ?? "";

        if (req.query.start) start = new Date(req.query.start);
        if (req.query.end) end = new Date(req.query.end);
        if (req.query.start) {
        
            orders = await orderModel.find({ orderDate: { $gte: start, $lte: end } }).lean()

            deliveredOrders = orders.filter(order => order.orderStatus === "Delivered")
            salesCount = await orderModel.countDocuments({ orderDate: { $gte: start, $lte: end }, orderStatus: "Delivered" })
            salesSum = deliveredOrders.reduce((acc, order) => acc + order.totalPrice, 0)
            

        } else {

            deliveredOrders = await orderModel.find({ orderStatus: "Delivered" }).lean()

            salesCount = await orderModel.countDocuments({ orderStatus: "Delivered" })
            result = await orderModel.aggregate([{ $match: { orderStatus: "Delivered" } },
            {
                $group: { _id: null, totalPrice: { $sum: '$totalPrice' } }
            }])
            salesSum = result[0]?.totalPrice
        }
        const users = await orderModel.distinct('userId')
        const userCount = users.length
        res.render('adminSalesreport', { userCount, salesCount, salesSum, deliveredOrders })
    },







}

module.exports = adminControl  