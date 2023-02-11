const express = require('express');
const { getUserHome, getUserLogin, getUserSignup, postUserLogin, postUserSignup,
     getUserOtp, postUserOtp, getUserProductDetails, getUserCart, getUserProfile,
     getUserLogout } = require('../controller/userControl');
const router = express.Router();
const session = require('express-session')



router.get('/', getUserHome)
router.get('/login', getUserLogin)
router.get('/signup', getUserSignup)
router.post('/login', postUserLogin)
router.post('/signup', postUserSignup)
router.get('/otp', getUserOtp)
router.post('/otpsubmit', postUserOtp)
router.get('/pdtdetails/:id', getUserProductDetails)
router.get('/cart', getUserCart)
router.get('/profile', getUserProfile)
router.get('/logout', getUserLogout)





module.exports = router