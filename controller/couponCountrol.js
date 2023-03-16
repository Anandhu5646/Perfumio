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



let couponControl={

    // admin coupon //
    getAdminCoupon: async (req, res) => {
        let coupons = await couponModel.find({}).lean();
    
        coupons.forEach(coupon => {
            coupon.expiry = moment(coupon.expiry).format('DD/MM/YYYY');
            coupon.discountperct = Math.round((coupon.discount / coupon.minAmount) * 100);
        });
    
        res.render('adminCoupon', { coupons });
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

                const formattedExpiry = new Date(expiry).toISOString().slice(0, 10);
                const coupons = new couponModel({ name, code, minAmount, discount, expiry: formattedExpiry, stock, block: false });
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
    
   
    getUserRemoveCoupon: (req, res) => {
        try {
            res.redirect('/checkout')
        } catch (error) {
            console.error(error)
            res.render('404page')
        }


    },
}

module.exports= couponControl