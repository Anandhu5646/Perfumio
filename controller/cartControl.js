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


let cartControl={

     // Product add to cart //
     getUserAddToCart: (req, res) => {

        return new Promise((resolve, reject) => {
            const user_id = req.session.user._id
            const pdt_id = req.params.id       
            
            userModel.updateOne({ _id: user_id }, { $addToSet: { cart: { id: pdt_id, quantity: 1 } } }).then(() => {
             productModel.updateOne({ _id:pdt_id}, {$inc: { stock: -1 } }).then((result)=>{
             })
                res.redirect('/')
            }).catch((err) => {
                console.log(err);
                res.render('404page')
            })
        })
    },
    // Remove product from cart//

    getUserRemoveCart: async (req, res) => {
        try {
            const user_id = req.session.user._id;
            const pdt_id = req.params.id;
            await userModel.updateOne(
                { _id: user_id },
                {
                    $pull: {
                        cart: { id: pdt_id }
                    }
                }
            )
            await  productModel.updateOne({ _id:req.params.id}, { $inc: { stock: quantity } });
            res.redirect("/cart")
        } catch (error) {
            console.log(err);
            res.render('404page')
        }
      
    },
    // increment product quantity //
    incrementQuantity: async (req, res) => {
        try {
            let product=await productModel.findOne({_id:req.params.id}).lean()
            console.log(product.stock);
            if (product.stock>=1){
                console.log('hloooooo');
                await userModel.updateOne(
                   { _id: req.session.user._id},{cart: { $elemMatch: { id: req.params.id } }},
                   {
                       $inc: {"cart.$.quantity":1}
                   }
                   ).then((result)=>{
                    console.log(result,'8567451');
                   })
                 await  productModel.updateOne({ _id:req.params.id}, { $inc: { stock: -1 } });
                   res.json({ success: true })
                } else {               
                    console.log('jjjjjjjjjjjjjjjjj');
                res.json({message:'Product Out Of Stock',success:false})
            }      
        } catch (err) {
            res.render('404page')
        }
    }
    ,

    // decrement product quantity //
    decrementQuantity: async (req, res) => {   
        try {
            const { cart } = await userModel.findOne(
                { "cart.id": req.params.id },
                { _id: 0, cart: { $elemMatch: { id: req.params.id } } }
            )
            if (cart[0].quantity <= 1) {
                await userModel.updateOne(
                    { _id: req.session.user._id },
                    {
                        $pull: {
                            cart: { id: req.params.id },   
                        },
                    }
                )
                productModel.updateOne({ _id:req.params.id}, { $inc: { stock: 1 } });
            } else {
                await userModel.updateOne(
                    { _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } },
                    {
                        $inc: {
                            "cart.$.quantity": -1,
                        },
                    }
                )
            }

            res.json({ success: true })
        } catch (err) {
            console.log(err);
            res.render('404page')
        }
    },
    // ,
    // checkQuantity: async (req, res) => {

    //     const cart = req?.user?.cart ?? [];
    //     let cartQuantity = {};
    //     const cartList = cart.map((item) => {
    //         cartQuantity[item.id] = item.quantity;
    //         return item.id;
    //     });
    //     let totalPrice = 0;
    //     let products = await productModel
    //         .find({ _id: { $in: cartList }, unlist: false })
    //         .lean();
    //     let quantityError = false;
    //     let outOfQuantity = [];
    //     for (let item of products) {
    //         totalPrice = totalPrice + item.price * cartQuantity[item._id];
    //         if (item.quantity < cartQuantity[item._id]) {
    //             quantityError = true;
    //             outOfQuantity.push({ id: item._id, balanceQuantity: item.quantity });
    //         } else {
    //         }
    //     }
    //     req.session.tempOrder = {
    //         totalPrice,
    //     };
    //     if (quantityError) {
    //         return res.json({ error: true, outOfQuantity });
    //     }
    //     return res.json({ error: false });
    // },


    getUserCartDetail: (req, res) => {
        try {
            if (!req.session.user) {
                res.redirect('/login');
                return;
            }
            
            return new Promise((resolve, reject) => {
                let Login = req.session.user.name
               
                let cartQuantity = {}

                let user_id = req.session.user._id
                userModel.findOne({ _id: user_id }, { cart: 1 }).then((cartDet) => {

                    let cartItems = cartDet.cart.map((item) => {
                        cartQuantity[item.id] = item.quantity
                        return item.id
                    })

                    if (cartItems.length === 0) {
                          res.render('cart', { message: 'cart empty' })
                        return;
                    }
   

                    productModel.find({ _id: { $in: cartItems } }).sort({_id:1}).lean().then((products) => {
                        let TotalAmount = 0
                        let totalMRP = 0
                        let Price = 0
                        let discount = 0
                        products.forEach((item, index) => {
                            const quantity = cartQuantity[item._id]
                            products[index].quantity = quantity
                            const itemPrice = item.price * quantity
                            TotalAmount += itemPrice
                            totalMRP += item.mrp * quantity
                            Price += itemPrice
                            discount = totalMRP - TotalAmount
                        })




                        res.render('cart', { products, TotalAmount, cartDet, totalMRP, Price, discount, Login })
                    })
                })


            })

        } catch (error) {
            console.log(err);
            res.render('404page')
        }


    }
    ,


}

module.exports= cartControl