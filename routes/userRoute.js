const express = require('express');
const { getUserOrderView, getUserOrders } = require('../controller/orderControl');
const { getUserHome, getUserLogin, getUserSignup, postUserLogin, postUserSignup,
     getUserOtp, postUserOtp, getUserProductDetails, getUserProfile,
     getUserLogout, getUserAddToCart, getUserCartDetail, resendOTP,
     getUserCheckout, getUserAddAddress, postUserAddAddress, getUserEditAddress,
     postUserEditAddress, getUserRemoveCart, decrementQuantity, incrementQuantity,
     getUserDeleteAddress, getUserAddToWishlist, getUserWishlistToCart, getUserWishlist,
     postUserApplyCoupon, postUserCheckout, postUserCheckoutAddAddress, getUserPayment,
     getUserRemoveCoupon, getMenCategory, getWomenCategory, sortLowToHigh,
     getUserRemoveFromWishlist } = require('../controller/userControl');
const verifyNotLogin = require('../middlewares/verifyNotLogin');
const verifyUser = require('../middlewares/verifyUser');
const router = express.Router();






router.get('/login', verifyNotLogin, getUserLogin)
router.get('/signup', verifyNotLogin, getUserSignup)
router.post('/login', verifyNotLogin, postUserLogin)
router.post('/signup', verifyNotLogin, postUserSignup)
router.get('/otp', verifyNotLogin, getUserOtp)
router.get('/resendOtp', verifyNotLogin, resendOTP)
router.post('/otpsubmit', verifyNotLogin, postUserOtp)

router.get('/', getUserHome)
router.get('/pdtdetails/:id', getUserProductDetails)
router.get('/logout', getUserLogout)

router.use(verifyUser)

router.get('/cart', getUserCartDetail)
router.get('/addtocart/:id', getUserAddToCart)
router.get('/removeCart/:id/:quantity', getUserRemoveCart)
router.get('/profile', getUserProfile)
router.get('/addquantity/:id', incrementQuantity)
router.get('/minusquantity/:id', decrementQuantity)
router.get('/checkout', getUserCheckout)
router.get('/addAddress', getUserAddAddress)
router.get('/deleteAddress/:id', getUserDeleteAddress)
router.post('/saveAddress', postUserAddAddress)
router.post('/saveCheckoutAddress', postUserCheckoutAddAddress)
router.get('/editAddress/:id', getUserEditAddress)
router.post('/updateAddress', postUserEditAddress)
router.get('/wishlist', getUserWishlist)
router.get('/addToWishlist/:id', getUserAddToWishlist)
router.get('/cartToWishlist/:id', getUserWishlistToCart)
router.get('/removeFromWishlist/:id', getUserRemoveFromWishlist)
router.post('/applyCoupon', postUserApplyCoupon)
router.get('/orders', getUserOrders)
router.get('/orderView/:id', getUserOrderView)
router.post('/placeOrder', postUserCheckout)
router.get('/verifyPayment', getUserPayment)
router.get('/removeCoupon', getUserRemoveCoupon)
router.get('/men', getMenCategory)
router.get('/women', getWomenCategory)
router.get('/lowToHigh', sortLowToHigh)






module.exports = router