const express = require('express');
const { getAdminLogin, postAdminLogin, getAdminHome, getAdminProduct, getAdminUser,
    getAdminLogout, getAdminUserBlock, getAdminuserUnblock, postAdminuserSearch,
    getAdminCategory, getAdminAddCategory, postAdminAddCategory,
    getAdminEditCat, getAdminAddProduct, getAdmincatBlock, getAdminCatUnblock,
    postAdminEditCat, postAdminSaveProduct, getAdminPdtBlock, getAdminPdtUnblock,
    getAdminEditProduct, postAdminEditProduct, getAdminCoupon, getAdminAddCoupon,
    postAdminAddCoupon, getAdminEditCoupon, postAdminEditCoupon, getAdminCouponBlock,
    getAdminCouponUnblock, getAdminOrders, getAdminOrderPending, getAdminOrderCancel,
     getAdminOrderShipping, getAdminOrderDelivered, getAdminSalesReport, getAdminDashboard, } = require('../controller/adminControl');
const upload = require('../middlewares/multer');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyNotAdmin = require('../middlewares/verifyNotAdmin');



router.get('/', verifyNotAdmin,getAdminLogin)
router.post('/',verifyNotAdmin, postAdminLogin)
router.get('/logout', getAdminLogout)


router.use(verifyAdmin)
router.get('/dashboard',getAdminDashboard) 
   
router.get('/product', getAdminProduct)   
router.get('/user', getAdminUser)
router.get('/coupon', getAdminCoupon)   
router.get('/order', getAdminOrders)
router.get('/block/:id', getAdminUserBlock)
router.get('/unblock/:id', getAdminuserUnblock)     
router.post('/searchuser', postAdminuserSearch)
router.get('/category', getAdminCategory)
router.get('/addcategory', getAdminAddCategory)
router.post('/savecategory', postAdminAddCategory)    
router.get('/editcategory/:id', getAdminEditCat)
router.post('/editcat', postAdminEditCat)
router.get('/addproduct', getAdminAddProduct)
router.post('/saveproduct', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'subimage', maxCount: 3 }]), postAdminSaveProduct)
router.get('/blockpdt/:id', getAdminPdtBlock)
router.get('/unblockpdt/:id', getAdminPdtUnblock)
router.get('/blockcat/:id', getAdmincatBlock)
router.get('/unblockcat/:id', getAdminCatUnblock)
router.get('/editproduct/:id', getAdminEditProduct)
router.post('/updatepdt', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'subimage', maxCount: 3 }]), postAdminEditProduct)
router.get('/addCoupon', getAdminAddCoupon)
router.post('/saveCoupon', postAdminAddCoupon)
router.get('/editCoupon/:id', getAdminEditCoupon)
router.post('/updateCoupon', postAdminEditCoupon)
router.get('/blockCoupon/:id', getAdminCouponBlock)
router.get('/unblockCoupon/:id', getAdminCouponUnblock)
router.get('/pendingPdt/:id', getAdminOrderPending)
router.get('/cancelPdt/:id', getAdminOrderCancel)
router.get('/shippingPdt/:id', getAdminOrderShipping)
router.get('/deliveredPdt/:id', getAdminOrderDelivered)
router.get('/salesReport', getAdminSalesReport)


module.exports = router
