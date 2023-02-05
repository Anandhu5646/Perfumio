const express = require('express');
const { getAdminLogin, postAdminLogin, getAdminHome, getAdminProduct, getAdminUser,
    getAdminLogout, getAdminUserBlock, getAdminuserUnblock, postAdminuserSearch,
    getAdminCategory, getAdminAddCategory, postAdminAddCategory, getAdminUpdateCat,
    getAdminEditCat, getAdminAddProduct, getAdmincatBlock, getAdminCatUnblock,
    postAdminEditCat,postAdminSaveProduct, getAdminPdtBlock, getAdminPdtUnblock } = require('../controller/adminControl');
const upload = require('../middlewares/multer');
const router = express.Router();



router.get('/', getAdminLogin)
router.post('/', postAdminLogin)
router.get('/home', getAdminHome)
router.get('/product', getAdminProduct)
// router.post('/product', postAdminProduct)
router.get('/user', getAdminUser)
router.get('/logout', getAdminLogout)
router.get('/block/:id', getAdminUserBlock)
router.get('/unblock/:id', getAdminuserUnblock)
router.post('/searchuser', postAdminuserSearch)
router.get('/category', getAdminCategory)
router.get('/addcategory', getAdminAddCategory)
router.post('/addcategory', postAdminAddCategory)
router.get('/updatecategory/:id', getAdminUpdateCat)
router.get('/editcategory', getAdminEditCat)
router.post('/editcat', postAdminEditCat)
router.get('/addproduct', getAdminAddProduct)
router.post('/saveproduct', upload.fields([{ name: 'image', maxCount: 3 }]), postAdminSaveProduct)
router.get('/blockpdt/:id', getAdminPdtBlock)
router.get('/unblockpdt/:id', getAdminPdtUnblock)
router.get('/blockcat/:id', getAdmincatBlock)
router.get('/unblockcat/:id', getAdminCatUnblock)

module.exports = router