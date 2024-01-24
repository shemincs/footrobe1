const bcrypt = require('bcrypt')
const User = require('../model/UserModel')
const notp = require('notp')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const Product = require('../model/ProductModel')
const Category = require('../model/CategoryModel')
const OrderModel = require('../model/OrderModel')
const Coupon = require("../model/couponModel")
const address = require('../model/UserAddressModel')
const { Address } = require('./PlaceOrderCtrl')
const { log } = require('console')
const Cart = require('../model/CartModel')

const generateRandomSecret = () => {
  // Generate a random secret key (typically 16 to 32 characters)
  return crypto.randomBytes(16).toString('hex');
};


const getSignupPage = async (req, res, next) => {
  try {
    res.render('user/signup', { layout: './layouts/AuthLayout.ejs' })
  } catch (error) {
    console.log(error)
  }
}

const getLoginPage = async (req, res, next) => {
  console.log('jj');
  try {
    const errorMessage = "Invalid email and password"
    res.render('user/login', { layout: './layouts/AuthLayout.ejs', messageLayout: 'Password incorrect', errorMessage })
  } catch (error) {
    console.log(error)
  }
}



// const getHomePage = async (req, res, next) => {
//   try {
//     console.log("Reached home");
//     const products = await Product.find({ isListed: true }).limit(8);

//     // Check if the session exists
//     const session = req.session.user_id || undefined;

//     console.log(products.length);

//     res.render('user/Home', { products, session, layout: './layouts/AuthLayout.ejs' });
//   } catch (error) {
//     console.log(error);
//   }
// };

// const getHomePage = async (req, res, next) => {
//   try {
//     console.log("Reached home");
//     let products = await Product.find({ isListed: true }).limit(8);
//     console.log("pro", products)
//     const session = req.session.user_id || undefined;
//     console.log("SESSion", session)

//     console.log(products.length);

//     // If there's a search query
//     if (req.query.query && req.query.query.trim() !== '') {
//       const query = req.query.query;
//       console.log("query", query)

//       // Perform the search based on the query
//       const regex = new RegExp(query, 'i'); // 'i' makes the search case-insensitive
//       products = await Product.find({
//         isListed: true,
//         ProductName: { $regex: regex }
//       }).limit(10);
//     }

//     // Rendering moved outside the 'if' block to ensure it happens regardless of the search
//     res.render('user/Home', { products, session, layout: './layouts/AuthLayout.ejs' });

//   } catch (error) {
//     console.log(error);
//     // Ensure to handle errors appropriately, for instance, sending an error response
//     res.status(500).send('Internal Server Error');
//   }
// };



const getHomePage = async (req, res, next) => {
  let cartCount = 0; // Declare and initialize cartCount outside the try block
  try {
    console.log("Reached home");
    let products = await Product.find({ isListed: true }).limit(8);
    console.log("pro", products)
    const session = req.session.user_id || undefined;
    console.log("SESSion", session)

    console.log(products.length);
    const cart = await Cart.findOne({ user: session });
    if (cart && cart.cartItems) {
      cartCount = cart.cartItems.length;
      console.log("CaartCC", cartCount)
    }

    // If there's a search query
    if (req.query.query && req.query.query.trim() !== '') {
      const query = req.query.query;
      console.log("query", query)

      // Perform the search based on the query
      const regex = new RegExp(query, 'i'); // 'i' makes the search case-insensitive
      products = await Product.find({
        isListed: true,
        ProductName: { $regex: regex }
      }).limit(10);
    }

    // Sorting based on the form submission
    let sortBy;
    if (req.query.sortOptions) {
      console.log("sortOption", req.query.sortOptions);

      if (req.query.sortOptions === 'low-to-high') {
        console.log("Enter");
        sortBy = products.sort((a, b) => a.SalesPrice - b.SalesPrice);
      } else if (req.query.sortOptions === 'high-to-low') {
        sortBy = products.sort((a, b) => b.SalesPrice - a.SalesPrice);
      }
    }
    console.log(sortBy);
    if (sortBy) {
      products = sortBy
    }

    // Rendering moved outside the 'if' block to ensure it happens regardless of the search or sort
    res.render('user/Home', { products, cartCount, session, layout: './layouts/AuthLayout.ejs' });

  } catch (error) {
    console.log(error);
    // Ensure to handle errors appropriately, for instance, sending an error response
    res.status(500).send('Internal Server Error');
  }
};








const securePassword = async (password) => {
  try {
    const passwordH = await bcrypt.hash(password, 10)
    return passwordH
  } catch (error) {
    console.log(error.message)
  }
}

const veryfySignin = async (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const password = req.body.password;
  const mail = await User.findOne({ email: email });
  const ph = await User.findOne({ phone: phone });
  const referralCode = req.body.referralCode

  
  try {



    // Generate a random secret for the user
    const secret = generateRandomSecret();

    // Generate a TOTP (Time-Based OTP) for the current time
    const otp = notp.totp.gen(secret);

    // Create a nodemailer transporter (configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // e.g., 'gmail', 'smtp.gmail.com', or your SMTP server
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: 'shemincs123@gmail.com',
        pass: 'xacg uhso iiek fcij',
      },
    });

    // Define the email message
    let mailOptions = {
      from: 'shemincs123@gmail.com',
      to: email, // Use the user's email address for sending OTP

      subject: 'Your OTP',
      text: `Your OTP is: ${otp}`,
    };
    console.log("TTT", mailOptions)

    // Store user data and OTP secret in the session
    req.session.userData = {
      email: email,
      phone: phone,
      username: name,
      password: password,
      secret: secret, // Store the OTP secret
      referralCode: referralCode
    };

    // Send the email
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        // Handle the error, e.g., return an error response to the user
        return res.render('User/signup', { Message: 'Error sending OTP email. Please try again later.' });
      } else {
        console.log('Email sent:', info.response);
        // Email sent successfully, proceed to the OTP page
        res.render('user/OTP', { Message: 'otp sent' });

      }
    });
  }

  catch (error) {
    console.error('Error:', error.message);
    res.render('User/signup', { Message: 'An error occurred. Please try again later.' });
  }
};

const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  try {
    const Userdata = req.session.userData;

    if (!Userdata) {
      const message = "OTP is not correct"
      res.render('User/OTP', { message: message });
    } else {
      // Verify the OTP provided by the user
      const secret = Userdata.secret; // Retrieve the user's secret from the session
      const otpValid = notp.totp.verify(otp, secret);

      if (otpValid) {
        // OTP is valid, proceed with user authentication or any other action
        console.log('OTP is valid');

        // Hash the user's password before storing it in the database
        const spassword = await securePassword(Userdata.password);
        const user = new User({
          name: Userdata.username,
          email: Userdata.email,
          phone: Userdata.phone,
          password: spassword,
          is_admin: 0,
          is_blocked: false,
          referralCode: Userdata.referralCode,
        });

        try {
          const dataSave = await user.save();
          console.log(dataSave)
          const check = await User.findOne({ referralCode: Userdata.referralCode })

          if (check) {
            check.wallet += 100
            console.log("reached refferal code")
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const maxLength = 10;
            let newReferralCode = ''
            console.log("creating refferal")
            for (let i = 0; i < maxLength; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length)
              newReferralCode += characters.charAt(randomIndex)
            }

            // Update user's referral code in the database
            check.referralCode = newReferralCode;
            await check.save();
            const spassword = await securePassword(Userdata.password);
            const user = new User({
              name: Userdata.username,
              email: Userdata.email,
              phone: Userdata.phone,
              password: spassword,
              is_admin: 0,
              is_blocked: false,
              referralCode: Userdata.referralCode,
              wallet: 100
            });
            const wall = await user.save()
            console.log(wall)
          }
          else {
            const user = new User({
              name: Userdata.username,
              email: Userdata.email,
              phone: Userdata.phone,
              password: spassword,
              is_admin: 0,
              is_blocked: false,
              referralCode: Userdata.referralCode,
              wallet: 0
            });
            await user.save()
          }
          if (dataSave) {
            console.log("usersaved");

            res.redirect('/login');
          } else {
            console.log("not saved")
            res.render('User/signup', { Message: 'Signin failed' });
          }
        } catch (error) {
          console.error(error.message);
          res.render('User/signup', { Message: 'Signin failed' });
        }
      } else {
        // Handle the case where the provided OTP is invalid
        console.log('OTP is invalid');
        const message = "incorrect otp,Try again"
        res.render('User/OTP', { message });
      }
    }
  } catch (error) {
    console.error(error.message);
    res.render('OTP', { Message: 'An error occurred. Please try again.' });
  }
};




const verifylogin = async (req, res) => {
  try {
    console.log("reached login")
    const mail = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: mail });
    console.log("verifying")
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (userData.is_blocked) {
        return res.status(401).json({ errorMessage: "blocked" });
      }
      if (!passwordMatch) {
        // Password doesn't match
        return res.status(401).json({ errorMessage: "Invalid password" });
      } else {

        req.session.user_id = userData._id;
        return res.json({ redirectUrl: '/' }); // Return the redirect URL
      }
    } else {
      // User not found or blocked
      console.log("user not found");
      return res.status(401).json({ errorMessage: "invalid email" });
    }
  } catch (error) {
    console.log(error.message);
    // Handle other errors
    return res.status(500).json({ errorMessage: "An error occurred" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const userData = req.session.userData;

    if (!userData) {
      return res.status(400).json({ errorMessage: "No user data found" });
    }

    // Generate a new OTP
    const secret = generateRandomSecret();
    const otp = notp.totp.gen(secret);

    // Update the user's session with the new secret and resend count
    req.session.userData.secret = secret;
    req.session.userData.resendCount = (req.session.userData.resendCount || 0) + 1;

    // Configure and send the new OTP via email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: 'shemincs123@gmail.com',
        pass: 'xacg uhso iiek fcij',
      },
    });

    const mailOptions = {
      from: 'shemincs123@gmail.com',
      to: userData.email,
      subject: 'Your New OTP',
      text: `Your new OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    // Include the resendCount in the response
    return res.status(200).json({ message: 'New OTP sent successfully', resendCount: req.session.userData.resendCount });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ errorMessage: "An error occurred while resending OTP" });
  }
};




const logout = async (req, res) => {
  try {

    req.session.destroy()
    res.redirect('/?logout=true')
  } catch (error) {
    console.log(error.message)

  }
}




const ProductDetails = async (req, res) => {
  try {
    const id = req.query.id
    const Products = await Product.findById(id)
    res.render('User/DetailP', { Products })
  } catch (error) {
    console.log(error.message)

  }
}

const forgotpassword = async (req, res) => {
  try {
    res.render('User/forgotpassword')
  } catch (error) {
    console.log(error.message)
  }
}



const sentforgotOTP = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(req.body)

    console.log("Email:", email);
    if (email.trim() === '') {
      console.log("email not found")
      return res.render('User/forgotpassword');
    }

    // Check if the email exists in your system
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log("User not found");
      return res.render('User/forgotpassword', { errorMessage: 'User not found. Please enter a valid email.' });
    }

    const secret = generateRandomSecret();
    const otp = notp.totp.gen(secret);

    // Store email, secret, and OTP in the session
    req.session.FPData = {
      email: email,
      secret: secret, // Store the OTP in the session
    };

    console.log(req.session.FPData)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shemincs123@gmail.com',
        pass: 'xacg uhso iiek fcij',
      },
    });

    const mailOptions = {
      from: 'shemincs123@gmail.com',
      to: email,
      subject: 'Your OTP',
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.render('User/forgotpassword');
      } else {
        console.log('Email sent:', info.response);
        res.render('User/FPOTP');
      }
    });
    console.log("email send")
  } catch (error) {
    console.log('Error.message', error.message);
    res.render('User/forgotpassword');
  }
}




const otpverification = async (req, res) => {
  try {
    console.log("reached otp verification")
    const otp = req.body.FPOTP
    console.log("entered otp : ", otp)
    const FPData = req.session.FPData
    console.log("session: ", FPData)


    if (!FPData) {
      console.log("session not found")
      res.render("User/FPOTP")
    }
    else {
      console.log("session accepted")
      const secret = FPData.secret;
      const otpValid = notp.totp.verify(otp, secret)

      if (otpValid) {
        console.log('otp valid')
        res.render('User/Resetpassword')
      }
      else {
        res.render('User/FPOTP')
      }
    }
  } catch (error) {
    console.log(error.message)
    res.render('User/forgotpassword')
  }
}

const Resetpassword = async (req, res) => {
  try {
    console.log("100%")
    const data = req.session.FPData
    const email = data.email
    const { newP, old } = req.body
    console.log("newpassword :", newP)
    console.log("confirm pasword : ", old)
    console.log("pasword found")
    const user = await User.findOne({ email: email })
    if (!user) {
      render("User/Resetpassword", { layout: './layouts/AuthLayout.ejs', })
    }



    console.log(user.password)

    const cp = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!cp.test(newP)) {
      console.log("password does not contain special charecters")
      return res.render("User/Resetpassword", { Message: "password must have a one special charecter" })
    }

    if (old == newP) {
      const bcryptPassword = await securePassword(newP)

      const updateP = await User.findOneAndUpdate({ email: email }, { $set: { password: bcryptPassword } })
      console.group(updateP)

      if (!updateP) {
        console.log("Cant change the password")
        res.render("User/Resetpassword", { Message: "something wrong" })
      }
      else {
        console.log("password reset successful")
        res.redirect('/login')
      }
    }
    else {
      console.log("cant compare the password")
      return render("Resetpassword")
    }



  } catch (error) {
    console.log(error.message)
    return res.render("Resetpassword")
  }
}
// const mensPage = async (req, res) => {

//   try {
//     const products = await Product.find({ isListed: true })
//     const category = await Category.find()

//     console.log("HAI", Product)
//     const currentpage = parseInt(req.query.page) || 1;
//     const itemsperpage = 8;
//     const startindex = (currentpage - 1) * itemsperpage;
//     const endindex = startindex + itemsperpage;
//     const totalpages = Math.ceil(products.length / 5);
//     const currentproduct = products.slice(startindex, endindex);
//     console.log('ijbij', currentproduct)
//     console.log(totalpages)



//     res.render('User/mensPage', { totalpages, currentpage: currentpage, Products: currentproduct, layout: './layouts/AuthLayout.ejs' })
//   } catch (error) {

//     console.log(error.message)

//   }
// }


const mensPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 8;
    
    const searchQuery = req.query.query || '';
    
    // Define the filter based on whether a search query is present
    const filter = searchQuery
      ? { isListed: true, ProductName: { $regex: new RegExp(searchQuery, 'i') } }
      : { isListed: true };

    const totalProduct = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProduct / itemsPerPage);

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    let sorting = {}; // Initialize sorting as an empty object

    // Check the selected sorting option from the form
    if (req.query.sortOptions === 'low-to-high') {
      sorting = { SalesPrice: 1 }; // Sort by SalesPrice low to high
    } else if (req.query.sortOptions === 'high-to-low') {
      sorting = { SalesPrice: -1 }; // Sort by SalesPrice high to low
    }
    
    let products = await Product.find(filter)
      .sort(sorting)
      .skip(startIndex)
      .limit(itemsPerPage);

    res.render('User/mensPage', {
      totalpages: totalPages,
      currentpage: page,
      Products: products,
      layout: './layouts/AuthLayout.ejs'
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};



const mensPP = async (req, res) => {
  try {
    console.log("HIi")
    const page = parseInt(req.query.page) || 1; // Parse page as an integer
    const itemsPerPage = 5;

    // Get the total number of products with is_listed: true
    const totalProduct = await Product.countDocuments({ isListed: true });
    console.log("tt:", totalProduct)
    const totalPages = Math.ceil(totalProduct / itemsPerPage);
    console.log("number:", totalPage)

    const sort = req.query.sort || '';

    const filter = { is_listed: true };
    const sorting = {};

    if (sort) {
      if (sort === 'price_ascend') {
        sorting.price = 1;
      } else if (sort === 'price_descend') {
        sorting.price = -1;
      }
    }

    // Use the aggregate function to support pagination, sorting, and filtering
    const products = await Product.aggregate([
      { $match: filter },
      { $sort: sorting },
      { $skip: (page - 1) * itemsPerPage },
      { $limit: itemsPerPage }
    ]);
    console.log("======================>", totalPage)
    res.render('mensPage', {
      products,
      totalPages,
      currentPage: page,
      sort: sort
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error'); // Handle the error more gracefully
  }
};


const orderPage = async (req, res) => {
  try {
    res.render('User/orderPage', { layout: './layouts/AuthLayout.ejs' })
  } catch (error) {
    console.log(error.message)
  }
}


// const orderDetails = async (req, res) => {
//   try {
//     const order1 = await OrderModel.find()
//     res.render('user/orderDetails', { order1 });
//   } catch (error) {
//     console.log(error.message)
//   }
// }


const orderDetails = async (req, res) => {
  try {
    const userId = req.session.user_id
    console.log('ecccc', userId)

    // Fetch orders that belong to the current user
    const order1 = await OrderModel.find({ user_id: userId }); // Replace 'userId' with your actual field name

    res.render('user/orderDetails', { order1 });
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately
    res.status(500).send('Error fetching user orders');
  }
}




const detailButton = async (req, res) => {
  try {
    const id = req.query.id
    console.log('OOO', id)
    const order1 = await OrderModel.findById(id)
    console.log(order1.product_details)
    res.render('user/detailButton', { order2: order1 })
  } catch (error) {
    console.log(error.message)
  }
}


// const returnOrder = async (req, res) => {
//   try {
//     console.log("reached return order")
//     const orderId = req.query.id;
//     console.log("KKK", orderId)
//     const productId = req.body.productId;
//     console.log("FFF", productId)

//     // Logic to update the status of the specific product within the order
//     const order = await OrderModel.findById(orderId);
//     console.log("DDDA", order)

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     let productIndex = -1;

//     for (let i = 0; i < order.product_details.length; i++) {
//       if (order.product_details[i].productId.toString() === productId.toString()) {
//         productIndex = i;
//         break; // Exit the loop once the product is found
//       }
//     }

//     console.log("IIIII", productIndex)

//     if (productIndex === -1) {
//       return res.status(404).json({ message: 'Product not found in the order' });
//     }

//     // Update the status of the specific product to "returned"
//     order.product_details[productIndex].status = 'returned';
//     const allProductsReturned = order.product_details.every(product => product.status === 'returned');
//     console.log("VVVV", allProductsReturned)

//     if (allProductsReturned) {
//       order.delivery_status = 'returned'; // Update delivery status to "returned" when all products are returned
//     } else {
//       order.delivery_status = 'partially returned'; // Update delivery status to "partially returned" when some products are returned
//     }

//     await order.save(); // Save the modified order back to the database

//     res.status(200).json({ message: 'Product returned successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



const returnOrder = async (req, res) => {
  try {
    const orderId = req.query.id;
    const productId = req.body.productId;

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let productIndex = -1;

    for (let i = 0; i < order.product_details.length; i++) {
      if (order.product_details[i].productId.toString() === productId.toString()) {
        productIndex = i;
        break;
      }
    }

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in the order' });
    }

    order.product_details[productIndex].status = 'returned';
    const allProductsReturned = order.product_details.every(product => product.status === 'returned');

    if (allProductsReturned) {
      order.delivery_status = 'returned';
    } else {
      order.delivery_status = 'partially returned';
    }

    await order.save();

    // Assuming you have the total refunded amount available directly
    const refundedAmount = order.total_price; // Ensure total_price is correctly calculated
    console.log("refund", refundedAmount)

    const userId = req.session.user_id;
    const user = await User.findById(userId);

    if (user) {
      user.wallet += refundedAmount; // Directly add refunded amount to the wallet
      await user.save();

      const walletAmount = user.wallet; // Fetch the updated wallet amount
      return res.render("user/wallet", { walletAmount });
    } else {
      return res.render('error', { message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};



const couponApply = async (req, res) => {
  try {
    console.log("reached Apply coupon");
    const couponCode = req.params.couponCode;
    console.log("HH", couponCode)
    const couponExist = await Coupon.findOne({ couponeCode: couponCode });
    console.log("KK", couponExist)
    const user = req.session.user_id;
    console.log("LL", user)
    const total = req.body.grandtotal
    console.log("UU", total)

    // Check if the coupon has already been used by the user
    const userCoupon = await User.findOne({ _id: user, coupon: { $elemMatch: { code: couponCode } } });
    if (userCoupon) {
      return res.send({ status: false, message: "Coupon already used" });
    }

    if (couponExist) {
      if (new Date(couponExist.validity) - new Date() > 0) {
        if (total >= couponExist.minPurchase) {
          console.log("JJJ", total)
          let discountAmount = (total * couponExist.minDiscountPercentage) / 100;
          if (discountAmount > couponExist.maxDiscountValue) {
            discountAmount = couponExist.maxDiscountValue;
          }

          // Update the user's coupons
          const sav = await User.updateOne(
            { _id: user },
            { $push: { coupon: { code: couponCode, isUsed: true } } }
          );
          if (sav) {
            console.log("saved")
          }
          const tot = total - discountAmount
          console.log("kkkkkkkkkk", tot)

          return res.send({
            status: true,
            discountAmount: discountAmount,
            discount: couponExist.minDiscountPercentage,
            couponCode: couponCode,
            total: total - discountAmount,
            message: "Coupon applied successfully",
          });
        } else {
          return res.send({
            status: false,
            message: `Minimum purchase amount is ${couponExist.minPurchase}`,
          });
        }
      } else {
        return res.send({ status: false, message: "Coupon has expired" });
      }
    } else {
      return res.send({ status: false, message: "Coupon doesn't exist" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



const wallet = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await User.findById(userId);

    if (!user) {
      return res.render('error', { message: 'User not found' });
    }

    const walletAmount = user.wallet; // Fetch the wallet amount directly
    return res.render("user/wallet", { walletAmount });
  } catch (error) {
    return res.render('error', { message: 'Internal server error' });
  }
};





// const wallet = async (req, res) => {
//   try {
//     const userId=req.session.user_id
//     console.log("ZZZZ",userId)
//     const user = await User.findById(userId);
//     console.log("TTT",user)

//     if (user) {
//       const walletAmount = user.wallet; // Get the wallet amount from the user object

//       // Render the wallet page and pass the wallet amount to the view
//       res.render("user/wallet", { walletAmount });
//     } else {
//       // Handle case where user is not found
//       res.render('error', { message: 'User not found' });
//     }
//     res.render("user/wallet")
//   } catch (error) {
//     console.log(error.message)
//   }
// }

// const editAddress = async (req, res) => {
//   try {
//     const addressId = req.query.addressId

//     const addres = await User.findOne(
//       { address: { $elemMatch: { _id: addressId } } },
//       { 'address.$': 1 }
//     );

//     if (addres) {
//       console.log("address found")
//       console.log(addres)
//       res.json(addres)
//     }
//     else {
//       console.log("address not found")
//       res.status(404).json({ error: 'Address not found' });
//     }
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// const myAccount = async (req, res) => {
//   try {
//     const user_id = req.session.user_id
//     console.log("LLL", user_id)
//     const userList = await User.findById(user_id)
//     const userAddress=await address.find({user_id : user_id})
//     console.log("NNNN",userAddress.addresses)
//     // const userAddress=await address(_id)
//     res.render("user/myAccount", { userList })
//   } catch (error) {
//     console.log(error.message)
//   }
// }



const myAccount = async (req, res) => {
  try {
    const user_id = req.session.user_id; // Assuming user_id is stored in the session
    console.log("User ID:", user_id);

    // Fetching user details from the User model
    const userList = await User.findById(user_id);

    // Fetching addresses associated with the user_id from the Address model
    const userAddresses = await address.findOne({ user_id: user_id });
    console.log("useraddress", userAddresses)

    if (!userAddresses) {
      console.log("No addresses found for this user.");
      // Handle the case where no addresses are found for the user
      return res.render("user/myAccount", { userList, addresses: [] });
    }

    console.log("User Addresses:", userAddresses.addresses);
    res.render("user/myAccount", { userList, addresses: userAddresses.addresses });

  } catch (error) {
    console.log("Error:", error.message);
    // Handle errors appropriately
    res.status(500).send("Internal Server Error");
  }
};


const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.query; // Assuming the addressId is sent in the request body
    const user = req.session.user_id
    console.log("user", user)
    // Delete the address using the Address model and the addressId
    const result = await address.findOneAndUpdate(
      { user_id: user },
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

// const editAddress = async (req, res) => {
//   console.log(editAddress)
//   try {
//     const { addressId } = req.query.ad_id;
//     console.log(req.body) // Assuming the updatedAddress is sent in the request body
//     const user = req.session.user_id;
//     console.log("user",user)

//     const updated = await address.findOneAndUpdate(
//       { user_id: user, "addresses._id": addressId },
//       { $set: { "addresses.$.addressField": updatedAddress } }, // Replace "addressField" with the specific field you want to update
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).send("Address not found");
//     }

//     res.status(200).json({ message: "Address updated successfully", updatedAddress: updated });
//   } catch (error) {
//     console.log("Error:", error.message);
//     res.status(500).send("Internal Server Error");
//   }
// };


const editAddress = async (req, res) => {
  try {
    const adid = req.query.ad_id;
    console.log(adid);
    const user = req.session.user_id;
    console.log("user", user);

    // Assuming 'address' is your Mongoose model
    const addressDetails = await address.findOne(
      { user_id: user, "addresses._id": adid },
      { "addresses.$": 1 }
    );

    if (!addressDetails) {
      console.log("Address not found");
      return res.status(404).send("Address not found");
    }

    const addressData = addressDetails.addresses[0]; // Extracting the specific address data
    console.log("Address details:", addressData);

    res.render("user/editAddress", { addressData });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const updateAddress = async (req, res) => {
  try {
    const adid = req.query.ad_id;
    const user = req.session.user_id;

    // Assuming 'address' is your Mongoose model
    const filter = { user_id: user, "addresses._id": adid };
    console.log(req.body, "body");
    const update = {
      $set: {
        "addresses.$.firstname": req.body.firstname,
        "addresses.$.mobile": req.body.number,
        "addresses.$.address": req.body.address,
        "addresses.$.City": req.body.city,
        "addresses.$.Country": req.body.country,
        "addresses.$.pincode": req.body.pincode,
      },
    };
    console.log(update, "uppp");
    const updatedAddress = await address.findOneAndUpdate(filter, update, { new: true });
    // console.log(updatedAddress,"kkkk");
    if (!updatedAddress) {
      return res.status(404).send("Address not found");
    }

    // Redirect to a success page or send a success response
    res.redirect(`/editAddress?ad_id=${adid}`); // Replace '/success' with your desired success route
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};



module.exports = {
  getSignupPage,
  getLoginPage,
  getHomePage,
  veryfySignin,
  verifylogin,
  verifyOTP,
  ProductDetails,
  forgotpassword,
  sentforgotOTP,
  otpverification,
  Resetpassword,
  mensPage,
  mensPP,
  orderDetails,
  logout,
  detailButton,
  couponApply,
  wallet,
  myAccount,
  returnOrder,
  deleteAddress,
  editAddress,
  updateAddress,
  resendOTP

}
