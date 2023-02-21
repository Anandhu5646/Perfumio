function verifyAdmin(req,res,next){
    console.log(req.session);
    if(req.session.admins){
        next()
    }else{
        res.redirect('/admin/')  
    } 
}

module.exports= verifyAdmin