const User=require('../models/User')
const typeofuser=this.Type_of_user;
exports.getPrivateData=(req,res,next)=>{
res.status(200).json({
  success:true,
  data:"you got access to the private data in the route/Welcome to crm APP",
typeofuser
})
}