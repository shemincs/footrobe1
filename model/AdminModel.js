const mongoose=require("mongoose")

const adminschema=new mongoose.Schema({
    email:{type:String,required:true},
    password:{type:String,required:true}
})



module.exports=mongoose.model("admins",adminschema)