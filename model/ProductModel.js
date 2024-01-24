const mongoose=require("mongoose")

const ProductSchema=new mongoose.Schema({
    ProductName:{type:String,required:true},
    BrandName:{type:String,required:true},
    category:{type:String,required:true},
    Description:{type:String},
    RegularPrice:{type:Number,required:true},
    SalesPrice:{type:Number,required:true},
    isListed:{type:Boolean,required:true,default:true},
    image:{type:Array},
    stock:{type:Number,required:true},
    offerPrice:{type:Number}

})

module.exports=mongoose.model('Product',ProductSchema)