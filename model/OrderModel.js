const mongoose=require('mongoose')

const userOrderList = new mongoose.Schema({
    user_id: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
    user_name: {
      type: String,
      require: true,
    },
    order_address: {
      type: Object,
      require: true,
    },
    order_date: {
      type: Date,
    },
    delivery_status: {
      type: String,
      require: true,
    },
    total_price: {
      type: Number,
      require: true,
    },
    payment_type: {
      type: String,
      require: true,
    },
    product_details: {
      type: Array,
      require: true,
    },
    Quantity:{
      type:Number,
      require:true
    }
   
  });
  

  module.exports = mongoose.model("order", userOrderList);