const mongoose=require("mongoose")




const Userschema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    phone:{type:Number,required:true},
    is_blocked:{type:Boolean, default:false},
    coupon: [{
        code: String,
        isUsed: { type: Boolean, default: false }
    }],
    referralCode:{type:String},
    wallet:{type:Number,default:0},
    walletTransaction:{type:Array}
})

module.exports=new mongoose.model("user",Userschema)

