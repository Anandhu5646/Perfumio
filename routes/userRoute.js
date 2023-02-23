const express = require('express');
const { getUserOrderView, getUserOrders } = require('../controller/orderControl');
const { getUserHome, getUserLogin, getUserSignup, postUserLogin, postUserSignup,
     getUserOtp, postUserOtp, getUserProductDetails, getUserProfile,
     getUserLogout,getUserAddToCart, getUserCartDetail, resendOTP,
     getUserCheckout, getUserAddAddress, postUserAddAddress, getUserEditAddress,
     postUserEditAddress, getUserRemoveCart, decrementQuantity, incrementQuantity, 
     getUserDeleteAddress, getUserAddToWishlist, getUserRemoveWishlist, getUserWishlist,
      postUserApplyCoupon, postUserCheckout, } = require('../controller/userControl');
const verifyUser = require('../middlewares/verifyUser');
const router = express.Router();





router.get('/', getUserHome)
router.get('/login', getUserLogin) 
router.get('/signup', getUserSignup)  
router.post('/login', postUserLogin)
router.post('/signup', postUserSignup)
router.get('/otp', getUserOtp)
router.get('/resendotp', resendOTP)
router.post('/otpsubmit', postUserOtp) 
router.get('/pdtdetails/:id', getUserProductDetails)      


// app.use(verifyUser)


router.get('/addtocart/:id', getUserAddToCart)
router.get('/removeCart/:id/:quantity', getUserRemoveCart)
router.get('/cart', getUserCartDetail)
router.get('/profile', getUserProfile)
router.get('/logout', getUserLogout)
router.get('/addquantity/:id',incrementQuantity)
router.get('/minusquantity/:id',decrementQuantity)
router.get('/checkout', getUserCheckout)       
router.get('/addAddress', getUserAddAddress)
router.get('/deleteAddress/:id', getUserDeleteAddress)
router.post('/saveAddress', postUserAddAddress)
router.get('/editAddress/:id', getUserEditAddress)
router.post('/updateAddress', postUserEditAddress)       
router.get('/wishlist', getUserWishlist)
router.get('/addToWishlist/:id', getUserAddToWishlist)
router.get('/deleteAddress/:id', getUserRemoveWishlist)
router.post('/applyCoupon', postUserApplyCoupon)
router.post('/placeOrder', postUserCheckout)
router.get('/orders', getUserOrders)
router.get('/orderView', getUserOrderView)

  


module.exports = router