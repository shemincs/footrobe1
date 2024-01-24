const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    productName:{type:String},
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"},
    cartItems: [{
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
          productName:{type:String},
          image:{type: String},
          Quantity: { type: Number,},
          SalesPrice:{type:Number},
          offerPrice:{type:Number},
          total: { type: Number },
        },
      ],
      cartTotal:{type:Number}
    });
    module.exports = mongoose.model('Cart', cartSchema)