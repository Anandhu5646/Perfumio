function verifyNotAdmin(req,res,next){
    if(req.session.admin){
        res.redirect('/admin/')
    }else{
        next()
    }
}


module.exports= verifyNotAdmin