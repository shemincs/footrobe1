const Admin=require('../model/AdminModel')
const crypto=require('crypto')
const bcrypt=require("bcrypt")
const User=require('../model/UserModel')
const order=require('../model/OrderModel');
const product=require('../model/ProductModel')
const voucher=require('voucher-code-generator')
const Coupon=require('../model/couponModel')
const moment = require("moment");


const Adminlogin=async(req,res,)=>{
    try {
        const message='hi';
         res.render('Admin/Adminlogin',{message})
    } catch (error) {
        console.log(error.message)
    }
}

const  Home = async(req, res)=>
{
    try
    {

        res.render('Admin/Home')  
         

    }
    catch(error)  
    {
        console.log(error.message)
    }
}


const graph=async(req,res)=>{
  console.log("Enter to Graph");
  try {
    const start = moment().subtract(30, 'days').startOf('day');
    const end = moment().endOf('day');

    const orderSuccessDetails = await order.find({
      order_date: { $gte: start, $lte: end },
      delivery_status:"delivered" 
    });
    console.log(orderSuccessDetails,"OD");
    const monthlySales = {}; 

    orderSuccessDetails.forEach(order => {
      const monthName = moment(order.order_date).format('MMMM');
      console.log(monthName,"name");
      if (!monthlySales[monthName]) {
        monthlySales[monthName] = {
          revenue: 0,
          productCount: 0,
          orderCount: 0,
          codCount: 0,
          razorpayCount: 0,
          walletCount: 0
        };
      }
      monthlySales[monthName].revenue += order.total_price;
      monthlySales[monthName].productCount += order.product_details.length;
      monthlySales[monthName].orderCount++;

      if (order.payment_type=== 'cash on delivery') {
        monthlySales[monthName].codCount++;
      } else if (order.payment_type === 'Razorpay') {
        monthlySales[monthName].razorpayCount++;
      } else if (order.payment_type === 'wallet') {
          monthlySales[monthName].walletCount++;
        } 
    });

    const monthlyData = {
      labels: [],
      revenueData: [],
      productCountData: [],
      orderCountData: [],
      codCountData: [],
      razorpayCountData: [],
      walletCountData: [],

    };

    for (const monthName in monthlySales) {
      if (monthlySales.hasOwnProperty(monthName)) {
        monthlyData.labels.push(monthName);
        monthlyData.revenueData.push(monthlySales[monthName].revenue);
        monthlyData.productCountData.push(monthlySales[monthName].productCount);
        monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
        monthlyData.codCountData.push(monthlySales[monthName].codCount);
        monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
        monthlyData.walletCountData.push(monthlySales[monthName].walletCount);
      }
    }
    console.log(monthlyData);
    return res.json(monthlyData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
  }
}

// const monthlyreport=async(req,res)=>{
//   try {
//     const start = moment().subtract(30, 'days').startOf('day'); // Data for the last 30 days
//     const end = moment().endOf('day');

//     const orderSuccessDetails = await orderModel.find({
//       createdAt: { $gte: start, $lte: end },
//       orderStatus: 'Delivered' 
//     });
//     const monthlySales = {}; 

//     orderSuccessDetails.forEach(order => {
//       const monthName = moment(order.order_date).format('MMMM');
//       if (!monthlySales[monthName]) {
//         monthlySales[monthName] = {
//           revenue: 0,
//           productCount: 0,
//           orderCount: 0,
//           codCount: 0,
//           razorpayCount: 0,
//         };
//       }
//       monthlySales[monthName].revenue += order.GrandTotal;
//       monthlySales[monthName].productCount += order.items.length;
//       monthlySales[monthName].orderCount++;

//       if (order.payment=== 'cod') {
//         monthlySales[monthName].codCount++;
//       } else if (order.payment === 'Razorpay') {
//         monthlySales[monthName].razorpayCount++;
//       } 
//     });

//     const monthlyData = {
//       labels: [],
//       revenueData: [],
//       productCountData: [],
//       orderCountData: [],
//       codCountData: [],
//       razorpayCountData: [],
//     };

//     for (const monthName in monthlySales) {
//       if (monthlySales.hasOwnProperty(monthName)) {
//         monthlyData.labels.push(monthName);
//         monthlyData.revenueData.push(monthlySales[monthName].revenue);
//         monthlyData.productCountData.push(monthlySales[monthName].productCount);
//         monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
//         monthlyData.codCountData.push(monthlySales[monthName].codCount);
//         monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
//       }
//     }
//     return res.json(monthlyData);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
//   }
// };


const verifyadmin = async (req, res) => {
    try {
        console.log("reached verify admin");
        const mail = req.body.email;
        const password = req.body.password;
        const admindata = await Admin.findOne({ email: mail });

        if (admindata) {
            console.log("Admin login");
            const hpassword = await bcrypt.compare(password, admindata.password);
            if (hpassword) {
                console.log("Correct password");
                req.session.admin_id = admindata._id;
                console.log('PPPP', req.session.admin_id);

                const orderCount = await order.countDocuments();
                const userCount = await User.countDocuments();
                console.log("Order Count:", orderCount);
                console.log("User Count:", userCount);

                res.render('Admin/Home', { message: "hello", orderCount, userCount });
            } else {
                console.log("Incorrect password");
                const Message = "Incorrect password";
                res.render('admin/Adminlogin', {Message });
            }
        } else {
            console.log("No admin found");
            const Message = "Your email is not correct";
            res.render('admin/Adminlogin', { Message });
        }
    } catch (error) {
        console.log(error.message);
    }
};






const logOut = (req, res) => {
    console.log("reached logout")
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }else{
        res.redirect('/admin/login');
        }
    });
};



const userList=async (req,res)=>
{
    try {
        const user=await User.find({})
        
        
        res.render('Admin/userList',{user})
    } catch (error) {
        console.log(error.message)
    }
}

const userBlock=async(req,res)=>
{
    try {
        
        const id=req.query.id
        console.log('>>>>>>>',id)
        const block = await User.findByIdAndUpdate(
            id,
            {
                $set:{
                    is_blocked:true
                }
            },
            { new: true }

            
        )
        console.log('???',block)
        if(block)
        {
            console.log("blocked")
        }
        res.redirect('/Admin/userList')
    } catch (error) {
        
    }
}

const userUnblock = async (req, res) => {
    try {
        console.log(req.query.id)
        const id = req.query.id;
        console.log("???????",id)

        const unblock = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    is_blocked: false
                }
            },
            { new: true }
        );
        console.log(unblock)
        if(unblock)
        {
           res.redirect('/Admin/userList');
           console.log("Unblocked");
        }
        else
        {
            res.redirect('/Admin/userList');
            console.log("cannot update")
        }
        
        
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const orderAdmin=async(req,res)=>
{
    try {
        const order1=await order.find()
        res.render('Admin/orderAdmin',{order1});
        console.log(order1,'/////////////////////////////////////////////////');
    } catch (error) {
        console.log(error.message)
    }
}

const orderStatus = async (req, res) => {
    try {
        console.log("reached order status update")
        let status = req.body.status; // Assuming the status is directly in req.body
        console.log("status:", status)
        let id = req.body.order_id;

        const updatedOrder = await order.findByIdAndUpdate(
            id,
            { $set: { delivery_status: status } },
            { new: true } // to return the updated order, if needed
        );

        // Handle the updatedOrder as needed (e.g., send it back in the response)
        res.redirect('/admin/orderAdmin')
    } catch (error) {
        // Handle any errors
        res.status(500).json({ error: 'Internal server error' });
    }
};










// const salesReport = async (req, res) => {
//     try {
//       const itemsPerPage = 5;
//       const currentPage = parseInt(req.query.page) || 1;
//       console.log("VVVVVVVVVV",req.query.page)
//       console.log(req.query)
//       console.log(req.body)
//       const startIndex = (currentPage - 1) * itemsPerPage;
//       const endIndex = startIndex + itemsPerPage;
  
//       // Fetch orders using pagination
//       const allOrders = await order.find();
//       const totalOrders = allOrders.length;
//       const totalPages = Math.ceil(totalOrders / itemsPerPage);
//       const currentOrders = allOrders.slice(startIndex, endIndex);
  
//       res.render('Admin/salesReport', {
//         order2: currentOrders,
//         currentPage,
//         totalPages
//       });
//     } catch (error) {
//       console.log(error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   };


// const salesReport = async (req, res) => {
//     try {
//       const itemsPerPage = 5;
//       const currentPage = parseInt(req.query.page) || 1;
//       const startIndex = (currentPage - 1) * itemsPerPage;
//       const endIndex = startIndex + itemsPerPage;
  
//       // Fetch orders using pagination
//       const allOrders = await order.find().sort({ order_date: 1 }); // Assuming order_date field exists
//       const totalOrders = allOrders.length;
//       const totalPages = Math.ceil(totalOrders / itemsPerPage);
//       const currentOrders = allOrders.slice(startIndex, endIndex);
  
//       // Prepare an object to store weekly sales data
//       const weeklySalesMap = {};
  
//       // Loop through all orders and calculate weekly sales
//       allOrders.forEach((order) => {
//         const orderDate = order.order_date;
//         const weekYear = `${orderDate.getFullYear()}-${getISOWeek(orderDate)}`; // Get ISO week
  
//         if (!weeklySalesMap[weekYear]) {
//           weeklySalesMap[weekYear] = 0;
//         }
  
//         weeklySalesMap[weekYear] += order.total_price;
//       });
  
//       // Sort the weekly sales by year and week
//       const sortedWeeklySales = Object.entries(weeklySalesMap)
//         .sort(([a], [b]) => a.localeCompare(b))
//         .reduce((obj, [key, value]) => {
//           obj[key] = value;
//           return obj;
//         }, {});
  
//       // Extract labels and data for the graph
//       const labels = Object.keys(sortedWeeklySales).map((weekYear) => weekYear.replace('-', ' Week '));
//       const data = Object.values(sortedWeeklySales);
//       console.log("labels",labels)
//       console.log("data",data)
//       res.render('Admin/salesReport', {
//         order2: currentOrders,
//         currentPage,
//         totalPages,
//         salesData: {
//           labels,
//           data,
//         },
//       });
//     } catch (error) {
//       console.log(error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   };



  
  // Function to get ISO week number
//   function getISOWeek(date) {
//     const d = new Date(date);
//     d.setHours(0, 0, 0);
//     d.setDate(d.getDate() + 4 - (d.getDay() || 7));
//     const yearStart = new Date(d.getFullYear(), 0, 1);
//     return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
//   }



const salesReport = (req, res) => {
    console.log("enterrr");
  console.log(req.query.day);
  if (req.query.day) {
    res.redirect(`/Admin/${req.query.day}`);
  } else {
    res.redirect(`/Admin/salesToday`);
  }
};


const salesToday = async (req, res) => {
  let todaysales = new Date();
  const startOfDay = new Date(
    todaysales.getFullYear(),
    todaysales.getMonth(),
    todaysales.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    todaysales.getFullYear(),
    todaysales.getMonth(),
    todaysales.getDate(),
    23,
    59,
    59,
    999
  );
  try {
    const orders = await order
      .aggregate([
        {
          $match: {
            order_date: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
            delivery_status:"Delivered",

          },
        },
      ])
      .sort({ order_date: -1 });
      console.log(orders,"oddd1");
    const itemsperpage = 10;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 10);
    const currentproduct = orders.slice(startindex,endindex);
    res.render("Admin/salesReport", {
      order: currentproduct,
      currentpage,
      totalpages,
      //product: products,
      salesToday: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const salesWeekly = async (req, res) => {
  const currentDate = new Date();

        const startOfWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - currentDate.getDay()
        );
        const endOfWeek = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + (6 - currentDate.getDay()),
            23,
            59,
            59,
            999
        );
  const orders = await order.aggregate([
    {
      $match: {
        order_date: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
        delivery_status:"Delivered",
      },
    },  
    {
      $sort: { order_date: -1 },
    },
  ]);
  console.log(orders,"odr2");
  const itemsperpage = 10;
  const currentpage = parseInt(req.query.page) || 1;
  const startindex = (currentpage - 1) * itemsperpage;
  const endindex = startindex + itemsperpage;
  const totalpages = Math.ceil(orders.length / 10);
  const currentproduct = orders.slice(startindex,endindex);
  res.render("Admin/salesReport", { order: currentproduct, salesWeekly: true,totalpages,currentpage });
};
const salesMonthly = async (req, res) => {
  const thisMonth = new Date().getMonth() + 1;
  const startofMonth = new Date(
    new Date().getFullYear(),
    thisMonth - 1,
    1,
    0,
    0,
    0,
    0
  );
  const endofMonth = new Date(
    new Date().getFullYear(),
    thisMonth,
    0,
    23,
    59,
    59,
    999
  );

  try {
    const orders = await order
      .aggregate([
        {
          $match: {
            order_date: {
              $gte: startofMonth,
              $lt: endofMonth,
            },
            delivery_status:"Delivered",
          },
        },
      ])
      .sort({ order_date: -1 });
    // const productIds = orders.map((order) => order.product.productId);
    // const products = await product.find({
    //   _id: { $in: productIds },
    // });
    const itemsperpage = 10;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 10);
    const currentproduct = orders.slice(startindex,endindex);
    res.render("Admin/salesReport", {
      order: currentproduct,
      totalpages,
      currentpage,
      salesMonthly: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const salesYearly = async (req, res) => {
  const today = new Date().getFullYear();
  const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
  const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);

  try {
    const orders = await order
      .aggregate([
        {
          $match: {
            order_date: {
              $gte: startofYear,
              $lt: endofYear,
            },
            delivery_status:"Delivered",
          },
        },
      ])
      .sort({ order_date: -1 });
    // const productIds = orders.map((order) => order.product.productId);
    // const products = await product.find({
    //   _id: { $in: productIds },
    // });
    const itemsperpage = 10;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(orders.length / 10);
    const currentproduct = orders.slice(startindex,endindex);
    res.render("Admin/salesReport", {
      order: currentproduct,
      totalpages,
      currentpage,
      // product: products,
      salesYearly: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


  
  const addCoupon=async(req,res)=>
  {
    try {
        res.render("admin/coupon")
    } catch (error) {
        console.log("error.message")
    }
  }


  const couponList=async(req,res)=>
  {
    try {
        const coupons=await Coupon.find()
        console.log("hihi",coupons);
        res.render("admin/couponList",{coupons:coupons})
    } catch (error) {
        
    }
}

  


const addVoucher = async (req, res) => {
    try {
        // Generate a coupon code using voucher-code-generator
        const generatedCoupon = voucher.generate({
            length: 8,
            count: 1,
        })[0];

        // Sending the generated coupon code in the response with a status of 200
        res.status(200).json({ status: 200, coupon: generatedCoupon });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

const couponPost=async(req,res)=>
{
    try {
        console.log("reached coupon post")
        const{couponCode,validity,minPurchase,minDiscountPercentage,description}=req.body

        const coupon=new Coupon({
            couponeCode:couponCode,
            validity:validity,
            minPurchase:minPurchase,
            minDiscountPercentage:minDiscountPercentage,
            description:description
        })

           await coupon.save()
           res.redirect("/admin/couponList")
    } catch (error) {
        console.log(error.message)
    }
}

const couponRemove = async (req, res) => {
    try {
        console.log("reached coupon delete")
      const removeId = req.query.couponId; // Retrieve the ID from the query parameters
      console.log(removeId);
  
      // Use the retrieved ID to delete the coupon (assuming Coupon is a Mongoose model)
      const remove = await Coupon.findByIdAndDelete(removeId);
      // Handle the deletion result...
  
      // Respond with success or appropriate status
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      console.log(error.message);
      // Handle errors and send an appropriate response
      res.status(500).json({ error: error.message });
    }
  };
  

  
  




module.exports={
    Adminlogin,
    verifyadmin,
    Home,
    logOut,
    userList,
    userBlock,
    userUnblock,
    orderAdmin,
    orderStatus,
    salesReport,
    addCoupon,
    couponList,
    addVoucher,
    couponPost,
    couponRemove,
    salesReport,
    salesToday,
    salesMonthly,
    salesWeekly,
    salesYearly,
    graph
}