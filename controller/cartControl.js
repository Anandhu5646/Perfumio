const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')


let cartControl = {

    // Product add to cart //
    getUserAddToCart: (req, res) => {

        return new Promise((resolve, reject) => {
            const user_id = req.session.user._id
            const pdt_id = req.params.id

            userModel.updateOne({ _id: user_id }, { $addToSet: { cart: { id: pdt_id, quantity: 1 } } }).then(() => {
                productModel.updateOne({ _id: pdt_id }, { $inc: { stock: -1 } }).then((result) => {
                })
                res.redirect("back")
            }).catch((err) => {
                console.log(err);
                res.render('404page')
            })
        })
    },
    // Remove product from cart//

    getUserRemoveCart: async (req, res) => {
        try {
            const _id = req.session.user._id;
            const proId = req.params.id;
            await userModel.updateOne(
                { _id },
                {
                    $pull: {
                        cart: { id: proId },
                    },
                }
            );
            res.redirect("/cart");
        }
        catch(err) {
        console.log(err);
        res.json({error: true, err})
    }

},
    // increment product quantity //
    incrementQuantity: async (req, res) => {
        try {
            let product = await productModel.findOne({ _id: req.params.id }).lean()
            console.log(product)

            if (product.stock >= 1) {

                await userModel.updateOne(
                    { _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } },
                    {
                        $inc: {
                            "cart.$.quantity": 1,
                        },
                    }
                );
                //  await  productModel.updateOne({ _id:req.params.id}, { $inc: { stock: -1 } });
                res.json({ success: true })
            } else {

                res.json({ message: 'Product Out Of Stock', success: false })
            }
        } catch (err) {
            console.log(err)
            res.json({ error: true, err })
        }
    }
        ,

        // decrement product quantity //
        decrementQuantity: async (req, res) => {
            try {
                let product = await productModel.findOne({ _id: req.params.id }).lean()

                if (product.stock >= 1) {

                    await userModel.updateOne(
                        { _id: req.session.user._id, cart: { $elemMatch: { id: req.params.id } } },
                        {
                            $inc: {
                                "cart.$.quantity": -1,
                            },
                        }
                    );
                    //  await  productModel.updateOne({ _id:req.params.id}, { $inc: { stock: -1 } });
                    res.json({ success: true })
                } else {

                    res.json({ message: 'Product Out Of Stock', success: false })
                }
            } catch (err) {
                res.json({ error: true, err })
            }
        },

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


                            productModel.find({ _id: { $in: cartItems } }).sort({ _id: 1 }).lean().then((products) => {
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

module.exports = cartControl