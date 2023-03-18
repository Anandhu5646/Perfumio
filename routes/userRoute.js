const express = require('express');
const { getUserAddToCart, getUserRemoveCart, decrementQuantity, incrementQuantity, getUserCartDetail, } = require('../controller/cartControl');
const { getUserRemoveCoupon } = require('../controller/couponCountrol');
const { getUserOrderView, getUserOrders, getUserOrderCancel, getUserOrderReturn, postUserCheckout, getUserCheckout, getUserPayment, postUserApplyCoupon } = require('../controller/orderControl');
const { getUserHome, getUserLogin, getUserSignup, postUserLogin, postUserSignup,
     getUserOtp, postUserOtp, getUserProductDetails, getUserProfile,
     getUserLogout, resendOTP, getUserAddAddress, postUserAddAddress, getUserEditAddress,
     postUserEditAddress, getUserDeleteAddress, getUserAddToWishlist, getUserWishlistToCart, getUserWishlist,
     postUserCheckoutAddAddress, getWomenCategory, sortLowToHigh,
     getUserRemoveFromWishlist, getUserAllProducts, sortHighToLow, categoryFilterPdt, postUserSearch, getMenCategory, menHighTolowCategory,  womenHighTolowCategory, womenLowToHighCategory, menLowToHighCategory, } = require('../controller/userControl');
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
router.get('/allProducts', getUserAllProducts)
router.get('/addtocart/:id', getUserAddToCart)
router.get('/removeCart/:id/', getUserRemoveCart)
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
router.get('/menLowToHigh',  menLowToHighCategory)
router.get('/menHighToLow', menHighTolowCategory)
router.get('/womenLowToHigh',   womenLowToHighCategory)
router.get('/womenHighToLow', womenHighTolowCategory)
router.get('/women', getWomenCategory)
router.get('/lowToHigh', sortLowToHigh)
router.get('/highToLow', sortHighToLow)
router.get('/catFilter/:catgy', categoryFilterPdt)
router.post('/search', postUserSearch)
router.get('/cancelPdt/:id', getUserOrderCancel)
router.get('/returnPdt/:id', getUserOrderReturn)







module.exports = router