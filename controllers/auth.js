const User=require("../models/User")
const ErrorResponse=require('../utils/errorResponse')
const sendEmail=require('../utils/sendEmail')
const crypto=require('crypto')

exports.register =async (req,res,next)=>{
 const {Firstname,Lastname,Type_of_user,username_emailid,password}=req.body;
try {
  const user=await User.create({
    Firstname,Lastname,Type_of_user,username_emailid,password
  })
  /*{res.status(201).json({
    success:true,
   token:"3rggg"
  })}*/
  sendToken(user, 201, res)
} catch (error) {
/* { res.status(500).json({
    success:false,
    error:error.message
  })}*/
  next(error)
}
}
exports.login =async(req,res,next)=>{
  const {username_emailid,password}=req.body;
  if(!username_emailid || !password){
    
    /*{res.status(400).json({
    success:false,
    error:"Please provide email and password"
  })}*/
  return next(new ErrorResponse("Please provide an email and password",400))
  }

try {
  const user=await User.findOne({username_emailid}).select("+password")
  if(!user){
   /*{res.status(404).json({
     success:false,
     error:"Invalid credentials"
   })}*/
   return next(new ErrorResponse("Invalid Credentials",401))

  }
  const isMatch= await user.matchPasswords(password)
  if(!isMatch){
    /*{res.status(404).json({success:false,error:"Invalid Credentials"})}*/
    return next(new ErrorResponse("Invalid Credentials",401))
  }
  /*{res.status(201).json({
    success:true,
   token:"hgghjj"
  })}*/
  sendToken(user, 200, res)
} catch (error) {
  res.status(500).json({
    success:false,
    error:error.message
  })
}

}
exports.forgotpassword = async (req,res,next)=>{
  const {username_emailid}=req.body;
  try {
    const user= await  User.findOne({username_emailid})
    if(!user){
      return next(new ErrorResponse("Email could not be sent",404))
    }
    const resetToken=user.getResetPasswordToken();
    await user.save();
    const reseturl=`http://localhost:3000/passwordreset/${resetToken}`
    const message=`
    <h1> You have requested a password change</h1>
    <p>Please go to this link to reset your password</p>
    < a href=${reseturl} clicktracking=off>${reseturl}</a>
    `
    try {
      await sendEmail({
        to:user.username_emailid,
        subject:"Password reset request",
        text:message
      })
      res.status(200).json({success:true,data:"Email sent"})
    } catch (error) {
      user.resetpasswordToken= undefined;
      user.resetpasswordExpire=undefined;
      await user.save()
      return next(new ErrorResponse("Email could not be sent",500))
    }
  } catch (error) {
    next(error);
  }
}
exports.resetpassword =async (req,res,next)=>{
 const resetpasswordToken=crypto.createHash("sha256").update(req.params.resetToken).digest("hex")
 try {
   const user=await User.findOne({
     resetpasswordToken,
     resetpasswordExpire:{$gt:Date.now()}
   })
   if(!user){
     return next(new ErrorResponse("Invalid reset token",400))
   }
   user.password=req.body.password;
   user.resetpasswordToken=undefined;
   user.resetpasswordExpire=undefined;
   await user.save();
   res.status(201).json({
     success:true,
     data:"Password reset success"
   })
 } catch (error) {
   next(error)
 }
}
const sendToken=(user,statusCode,res)=>{
  const token=user.getsignedToken()
  res.status(statusCode).json({Success:true,token})

}
