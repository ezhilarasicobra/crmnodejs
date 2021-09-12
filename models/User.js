const crypto=require('crypto')
const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const UserSchema=new mongoose.Schema({
  Firstname:{
    type:String,
    required :[true,"Please Provide a first Name"]
  },
  Lastname:{
    type:String,
    required :[true,"Please Provide a Last Name"]
  },
  Type_of_user:{
    type:String,
    enum: ['Admin','Manager','Employee'],
    required :[true,"Please Provide your role"]
  },
  username_emailid:{
    type:String,
    required:[true,"Please provide a user email"],
    unique:true,
    match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,"Please provide a valid email Id"]
  },
  password:{
    type:String,
    required:[true,"Please provide a password"],
    minlength:6,
    select:false
  },
  resetpasswordToken: String,
  resetpasswordExpire: Date
})
UserSchema.pre("save",async function(next){
if(!this.isModified("password")){
  next()
}
const salt=await bcrypt.genSalt(10);
this.password=await bcrypt.hash(this.password,salt);
next();
})
UserSchema.methods.matchPasswords= async function(password){
  return await bcrypt.compare(password,this.password)
}
UserSchema.methods.getsignedToken=function(){
 return  jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE})
}
UserSchema.methods.getResetPasswordToken = function(){
const resetToken=crypto.randomBytes(20).toString("hex")
this.resetpasswordToken =crypto.createHash("sha256").update(resetToken).digest("hex")

this.resetpasswordExpire=Date.now() + 10 *(60 *1000);
return resetToken;
}
const  User= mongoose.model("User",UserSchema);

module.exports=User;