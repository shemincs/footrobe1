const mongoose = require('mongoose')
const Product = require('../model/ProductModel')
const Cart = require('../model/CartModel')
const address = require('../model/UserAddressModel')
const User = require('../model/UserModel')
const OrderModel = require('../model/OrderModel')
const Razorpay = require('razorpay')
const Coupon = require("../model/couponModel")
const PDFDocument=require('pdfkit')
const dotenv=require('dotenv').config()

var instance = new Razorpay({
  key_id: process.env.payId, // Access key_id from environment variable
  key_secret: process.env.paySecret, // Access key_secret from environment variable
});
// correct code
// const placeorder = async (req, res) => {
//   try {

//     const ID = req.session.user_id
//     console.log(ID)
//     const coupons=await Coupon.find()
//     const useraddress = await address.find({ user_id: ID });
//     console.log("reched placed order")
//     const cartData = await Cart.findOne({ user: ID });
//     console.log(cartData);
//     let grandTotal = 0;
//     for (let i = 0; i < cartData.cartItems.length; i++) {
//       const price = cartData.cartItems[i].offerPrice || cartData.cartItems[i].SalesPrice
//       grandTotal += cartData.cartItems[i].Quantity * price;
//     }
//     console.log(useraddress);
//     res.render('User/PlaceOrder', { useraddress, cartData, grandTotal ,coupons})


//   } catch (error) {

//   }
// }
// correct code end


const placeorder = async (req, res) => {
  try {
    const ID = req.session.user_id;
    console.log(ID);
    const coupons = await Coupon.find();
    const useraddress = await address.find({ user_id: ID });
    console.log("reached placed order");
    const cartData = await Cart.findOne({ user: ID });
    console.log(cartData);
    let grandTotal = 0;

    // Check stock availability before placing an order
    const cartItems = cartData.cartItems;
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const price = item.offerPrice || item.SalesPrice;
      grandTotal += item.Quantity * price;

      const availableStock = item.stock; // Assuming each item has a 'stock' property

      if (item.Quantity > availableStock) {
        return res.status(400).json({ message: 'Insufficient stock for item: ' + item.name });
      }
    }

    // Proceed with order placement if stock is available
    console.log(useraddress);
    res.render('User/PlaceOrder', { useraddress, cartData, grandTotal, coupons });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

// correct thank

// const thank = async (req, res) => {
//   try {
//     console.log(req.body)
//     const user_id = req.session.user_id
//     console.log("???", user_id)
//     user_id.toString()
//     const paymentMethod = req.body.paymentMethod
//     const subTotal = req.body.subTotal
//     const productIds = req.body.productIds
//     const address1 = req.body.address
//     const user = await User.findOne({ _id: user_id })

//     const UserAddress = await address.findOne({ 'addresses._id': address1 }, { 'addresses.$': 1 })
//     console.log("UUU", UserAddress)
//     console.log("GGGG", address1)
//     const cartItem = await Cart.findOne({ user: user_id })
//     console.log("CCC", subTotal)
//     const order_date = new Date(Date.now())

//     const data = new OrderModel({
//       user_id: user_id,
//       user_name: user.name,
//       order_address: UserAddress.addresses[0],
//       order_date: order_date,
//       delivery_status: "pending",
//       total_price: subTotal,
//       payment_type: req.body.paymentMethod,
//       product_details: cartItem.cartItems

//     })
//     console.log("ggggggggggggg",data)
//     const orderData = await data.save()
//     if (orderData) {
//       console.log("order is successful")
//       await cartItem.updateOne({$set:{cartItems:[]}})
//       if (paymentMethod === "Razorpay") {
//         console.log("YY",paymentMethod)
//         var options = {

//           amount: orderData.total_price*100, 
//           currency: "INR",
//           receipt: ""+orderData._id
//         };
//         console.log("GG",options)
//         instance.orders.create(options, function(err, order) {
//           if(err){
//               console.log("Error while creating order : ",err)
//           }else{
//               res.json({order:order , razorpay:true})
//           }
//       });
//       }
//     }
//     else {
//       console.log("order is failed")
//       return res.status(400).json({ message: "order failed", status: 400 });
//     }

//   } catch (error) {
//     console.log(error.message)
//     return res.status(500).send("internal server error")
//   }
// }
// correct thank



const thank = async (req, res) => {
  try {
    console.log(req.body);
    const user_id = req.session.user_id;
    console.log("???", user_id);
    user_id.toString();
    const paymentMethod = req.body.paymentMethod;
    const subTotal = req.body.subTotal;
    const productIds = req.body.productIds;
    const address1 = req.body.address;
    const user = await User.findOne({ _id: user_id });

    const UserAddress = await address.findOne({ 'addresses._id': address1 }, { 'addresses.$': 1 });
    console.log("UUU", UserAddress);
    console.log("GGGG", address1);
    const cartItem = await Cart.findOne({ user: user_id });
    console.log("CCC", subTotal);
    const order_date = new Date(Date.now());

    const data = new OrderModel({
      user_id: user_id,
      user_name: user.name,
      order_address: UserAddress.addresses[0],
      order_date: order_date,
      delivery_status: "pending",
      total_price: subTotal,
      payment_type: req.body.paymentMethod,
      product_details: cartItem.cartItems,
    });
    console.log("ggggggggggggg", data);
    const orderData = await data.save();
    if (orderData) {
      console.log("order is successful");

      // Update stock after a successful order placement
      const orderedItems = cartItem.cartItems;
      for (let i = 0; i < orderedItems.length; i++) {
        const orderedItem = orderedItems[i];
        const product = await Product.findById(orderedItem.productId);

        // Update the stock for the product
        product.stock -= orderedItem.Quantity;
        await product.save();
      }

      await cartItem.updateOne({ $set: { cartItems: [] } });

      if (paymentMethod === "Razorpay") {
        console.log("YY", paymentMethod);
        var options = {
          amount: orderData.total_price * 100,
          currency: "INR",
          receipt: "" + orderData._id,
        };
        console.log("GG", options);
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log("Error while creating order : ", err);
          } else {
            res.json({ order: order, razorpay: true });
          }
        });
      }
    } else {
      console.log("order is failed");
      return res.status(400).json({ message: "order failed", status: 400 });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("internal server error");
  }
};



const Address = async (req, res) => {
  try {

    console.log("reached address")


    const name = req.body.name
    const email = req.body.email
    const phone = req.body.phone
    const Address = req.body.address
    const Country = req.body.Country
    const City = req.body.City
    const Postalcode = req.body.Postalcode

    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Address: ${Address}`);
    console.log(`Country: ${Country}`);
    console.log(`City: ${City}`);
    console.log(`Postal Code: ${Postalcode}`);

    if (name.trim() == "" || email.trim() == "" || phone.trim() == "" || Address.trim() == "" || Country.trim() == "" || City.trim() == "" || Postalcode.trim() == "") {
      return res.status(404).send("something went wrong")
    }

    console.log("validation sucessful")
    const EV = await address.findOne({ user_id: req.session.user_id })
    if (!EV) {
      console.log("user not exists")
      console.log(req.session.user_id)
      const newAddressData = new address({
        user_id: req.session.user_id, // Assuming you have the user's ID in the session
        addresses: [
          {
            firstname: name,
            mobile: phone,
            address: Address,
            City: City,
            Country: Country,
            pincode: Postalcode,
          },
        ],
      });
      await newAddressData.save()

      return res.status(200).send("sucess")
    }
    else {
      console.log("user exists")
      EV.addresses.push({
        firstname: name,
        mobile: phone,
        address: Address,
        City: City,
        Country: Country,
        pincode: Postalcode,
      })
      await EV.save()
      return res.status(200).send("sucess")
    }



  } catch (error) {
    console.log(error.message)

  }
}

// const cancelOrder = async (req, res) => {
//   try {

//     console.log("reached cancel order");
//     const cancel = req.params.OrderId;
//     const productId = req.params.prodId;
//     console.log(cancel);
//     console.log(productId);

//     // Find the order by its ID
//     const order = await OrderModel.findOne({ _id: cancel });

//     if (order) {
//         console.log("Order found:");

//         // Remove the product from the product_details array based on productId
//       const updated=  await OrderModel.findOneAndUpdate(
//           { _id: cancel },
//           { delivery_status:"cancelled" }
//       );
//           if(updated)
//           {
//             console.log("response: ", res)
//             return res.status(200).json({message:"success"})
//           }



//             // Update the order's product_details with the filtered array



//         console.log("Product removed from order successfully");
//         // Your further logic here
// } else {
//     console.log("Order not found");
//     // Handle scenario where order is not found
// }
//   } catch (error) {
//     console.log(error.message)
//   }
// }


const cancelOrder = async (req, res) => {
  try {
    const cancel = req.params.OrderId;
    const productId = req.params.prodId;

    // Find the order by its ID
    const order = await OrderModel.findOne({ _id: cancel });

    if (order) {
      if (order.delivery_status !== "cancelled") {
        // Update order status to 'cancelled'
        order.delivery_status = "cancelled";
        await order.save();

        // Restore stock for cancelled order items
        const cancelledItems = order.product_details;
        for (let i = 0; i < cancelledItems.length; i++) {
          const cancelledItem = cancelledItems[i];
          const product = await Product.findById(cancelledItem.productId);

          // Increment the stock for the product
          product.stock += cancelledItem.Quantity;
          await product.save();
        }

        return res.status(200).json({ message: "Order cancelled successfully" });
      } else {
        return res.status(400).json({ message: "Order is already cancelled" });
      }
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal server error");
  }
};






const verifyPayment = async (req, res) => {
  try {

    console.log("verifying")
    const data = req.body
    const orderId = data.data.reciept
    console.log(orderId)
    const hmac = crypto.createHmac('sha256', 'o1V6zW0wBe7XwyqthVadu0rv')
    hmac.update(data.payment.razorpay_order_id + '|' + data.payment.razorpay_payment_id)
    const hashedHmac = hmac.digest('hex')
    console.log("going to check the hashedHmac")
    console.log("order_id:", data.payment.razorpay_order_id)
    console.log("payment_id:", data.payment.razorpay_payment_id)
    console.log("hashedHmac:", hashedHmac)
    console.log("signature:", data.payment.razorpay_signature.trim())
    if (hashedHmac.trim() === data.payment.razorpay_signature.trim()) {
      console.log("updating order")

      return res.jason({ success: true, data })

    } else {
      return res.json({ success: false, error: 'Payment verification failed' })
    }

  } catch (error) {
    console.log(error.message)
  }

}



// Assuming you've already defined your schemas and models (User, Products, OrderModel)

// const Invoice = async (req, res) => {
//   try {
//     const orderId = req.query._id;
//     const orderData = await OrderModel.findById(orderId).populate('address');

//     if (!orderData) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const products = orderData.items.map(item => item.productId);
//     const user = await User.findById(req.session.user_id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const selectedAddressId = user.selectedAddress;
//     const selectedAddress = user.addresses.find(address => address._id.equals(selectedAddressId));

//     if (!selectedAddress) {
//       return res.status(404).json({ message: "Selected address not found" });
//     }

//     const Items = await Products.find({ _id: { $in: products } });
//     const names = Items.map(name => name.name);

//     const quantity = orderData.items.map(quant => quant.quantity);

//     const invoiceData = {
//       InvoiceNumber: orderId,
//       InvoiceDate: new Date(orderData.Date).toDateString(),
//       Products: names,
//       Total: `${orderData.total.toFixed(2)} Rs`,
//     };

//     const doc = new PDFDocument();
//     res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
//     res.setHeader('Content-Type', 'application/pdf');
//     doc.pipe(res);

//     // Define tableY value
//     const tableY = 200; // Adjust this value according to your layout

//     if (selectedAddress) {
//       // Output address details
//       doc.fontSize(24);
//       doc.text('Invoice', { align: 'center' });
//       doc.moveDown(0.5);
//       doc.moveDown(1);
//       doc.fontSize(14);
//       doc.text('Shipping Address:');
//       doc.fontSize(12);
//       doc.text(`firstname: ${selectedAddress.firstname}`);
//       doc.text(`mobile: ${selectedAddress.mobile}`);
//       doc.text(`address: ${selectedAddress.address}`);
//       doc.text(`City: ${selectedAddress.City}`);
//       doc.text(`Country: ${selectedAddress.Country}`);
//       doc.text(`pincode: ${selectedAddress.pincode}`);

//       doc.moveDown(1); // Extra spacing
//     }

//     doc.fontSize(22);
//     doc.text('Invoice Receipt', { align: 'center' });
//     doc.moveDown(0.5);
//     doc.fontSize(12);

//     const tableX = 50;

//     const tableData = [
//       { item: 'Invoice Number:', value: invoiceData.InvoiceNumber },
//       { item: 'Quantity:', value: quantity.reduce((acc, curr) => acc + curr, 0) },
//       { item: 'Invoice Date:', value: invoiceData.InvoiceDate },
//       { item: 'Items:', value: invoiceData.Products.join(', ') },
//       { item: 'Total:', value: invoiceData.Total }
//     ];

//     const cellPadding = 5;
//     const cellWidth = 350;
//     const cellHeight = 20;

//     doc.fillAndStroke(null, 'black');

//     tableData.forEach((row, index) => {
//       const yPos = tableY + index * cellHeight; // Define yPos for each row
//       doc.text(row.item, tableX, yPos, { width: cellWidth, align: 'left' });
//       doc.text(row.value.toString(), tableX + cellWidth + cellPadding, yPos, { width: cellWidth, align: 'left' });
//       doc.moveDown(); // Move down by 1 line for each row
//     });

//     const lineY = doc.y;
//     doc.moveTo(50, lineY).lineTo(550, lineY).stroke();
//     doc.moveDown(1);
//     doc.text('Copyright © GAMPro Private Limited', { align: 'center' });

//     doc.end();
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }


// const Invoice = async (req, res) => {
//   console.log('invoice=========')
//   try {
//     const orderId = req.query._id;
//     const orderData = await OrderModel.findById(orderId).populate('order_address');

//     if (!orderData) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     // Fetch user and their selected address (replace this with your logic)
//     const userId = req.session.user_id; // Assuming user ID is in session
//     const user = await User.findById(userId);
  
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     const selectedAddressId = user.selectedAddress;
//     console.log(orderData.order_address)

//     // const selectedAddress = orderData.order_address.find(address => address._id.equals(selectedAddressId));
//     // if (!selectedAddress) {
//     //   return res.status(404).json({ message: 'Selected address not found' });
//     // }
//       const adress=orderData.order_address
//     // Fetch products related to the order (replace this with your logic)
//     //const userAddress=address.findOne({user_id:req.session.user_id})
//     //console.log("AAA",userAddress)
//     const products = orderData.product_details.map(item => item.productId);
//     const Items = await Product.find({ _id: { $in: products } });
//     console.log("IUIUUI",Items)
//     const names = Items.map(name => name.ProductName);
//    console.log(orderData)
//     // Calculate quantities, invoice date, total, etc. (replace this with your logic)
//     const quantity = orderData.product_details.map(quant => quant.quantity);

//     const orderDate = new Date(orderData.order_date);

//     const invoiceData = {
//       InvoiceNumber: orderId,
//       InvoiceDate: new Date(orderData.order_date).toDateString(),
//       Products: names,
//       Total: `${Number(orderData.total_price).toFixed(2)} Rs`,
//       address:adress
//     };
//     console.log("TTTT",invoiceData)

//     const doc = new PDFDocument();
//     res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
//     res.setHeader('Content-Type', 'application/pdf');
//     doc.pipe(res);

//     // Insert content into the PDF
//     doc.fontSize(20).text(`Invoice for Order #${invoiceData.InvoiceNumber}`);
//     // ... add more content

//     doc.end();

//   } catch (error) {
//     console.error('Error generating invoice:', error.message);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };



const Invoice = async (req, res) => {
  console.log('invoice=========');
  try {
    const orderId = req.query._id;
    const orderData = await OrderModel.findById(orderId).populate('order_address');

    if (!orderData) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Fetch user and their selected address (replace this with your logic)
    const userId = req.session.user_id; // Assuming user ID is in session
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const address = orderData.order_address;

    // Fetch products related to the order (replace this with your logic)
    const products = orderData.product_details.map(item => item.productId);
    const Items = await Product.find({ _id: { $in: products } });
    const names = Items.map(name => name.ProductName);

    // Calculate quantities, invoice date, total, etc. (replace this with your logic)
    const quantity = orderData.product_details.map(quant => quant.quantity);

    const orderDate = new Date(orderData.order_date);

    const invoiceData = {
      InvoiceNumber: orderId,
      InvoiceDate: orderDate.toDateString(),
      Products: names,
      Total: `${Number(orderData.total_price).toFixed(2)} Rs`,
      Address: address, // Include the address data in the invoice
    };

    // Generate PDF content
    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Insert content into the PDF
    doc.fontSize(20).text(`Invoice for Order #${invoiceData.InvoiceNumber}`);
    doc.moveDown(); // Add some space

    doc.fontSize(16).text(`Invoice Date: ${invoiceData.InvoiceDate}`);
    doc.moveDown(); // Add some space

    doc.fontSize(16).text('Products:');
    invoiceData.Products.forEach(product => {
      doc.fontSize(14).text(`- ${product}`);
    });
    doc.moveDown(); // Add some space

    doc.fontSize(16).text(`Total: ${invoiceData.Total}`);
    doc.moveDown(); // Add some space

    doc.fontSize(16).text('Shipping Address:');
    doc.fontSize(14).text(`Address: ${invoiceData.Address.address}`);
    doc.fontSize(14).text(`City: ${invoiceData.Address.City}`);
    doc.fontSize(14).text(`Country: ${invoiceData.Address.Country}`);
    doc.fontSize(14).text(`Pincode: ${invoiceData.Address.pincode}`);
    doc.moveDown(); // Add some space

    doc.end(); // Finalize the PDF

  } catch (error) {
    console.error('Error generating invoice:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};





module.exports = {
  placeorder,
  Address,
  thank,
  cancelOrder,
  verifyPayment,
  Invoice 

}