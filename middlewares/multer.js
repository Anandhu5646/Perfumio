const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/pic/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() 
      cb(null, file.fieldname + '-' + uniqueSuffix+'.jpg')
    }
   
  })
 
let upload=multer({
    storage: storage
})





module.exports=  upload


