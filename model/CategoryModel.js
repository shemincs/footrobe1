const mongoose=require("mongoose")

const CategorySchema=new mongoose.Schema({
    name:{type:String,required:false,unique:true},
    listed:{type:Boolean,default:true}
})


module.exports=mongoose.model("Category",CategorySchema)