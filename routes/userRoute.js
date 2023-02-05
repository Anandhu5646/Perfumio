const express = require('express');
const { getUserHome, getUserLogin, getUserSignup, postUserLogin, postUserSignup, getUserOtp, postUserOtp } = require('../controller/userControl');
const router = express.Router();
const session= require('express-session')



router.get('/', getUserHome)
router.get('/login', getUserLogin)
router.get('/signup', getUserSignup)
router.post('/login', postUserLogin)
router.post('/signup', postUserSignup)
router.get('/otp', getUserOtp)
router.post('/otpsubmit', postUserOtp) 




module.exports = router