const mongoose=require('mongoose')


const addressSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  addresses: [
    {
      firstname: {
        type: String,
        required: true,
      },
      mobile: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      City: {
        type: String,
        required: true,
      },
      Country: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
    },
  ],
});
module.exports= new mongoose.model("Address", addressSchema)
  