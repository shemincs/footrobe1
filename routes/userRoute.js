const express = require("express");
const router = express.Router();
const session = require('express-session');
const nocache=require("nocache")
const dotenv=require('dotenv').config()



const userController = require('../controller/authCtrl')
const auth=require('../middleware/Auth')
const cartcontroller=require('../controller/CartCtrl')
const PlaceOrdercontroller=require('../controller/PlaceOrderCtrl')

const MDBsession=require('connect-mongodb-session')(session)
const store=new MDBsession({
    uri:process.env.MONGODB_URI,
    collection:"session_idS"
})

router.use(session({
    secret:"sessionid",
    store:store,
    resave:false,
    saveUninitialized:false
}))

router.use(nocache())

router.get('/signup',userController.getSignupPage)
router.get('/login',auth.usernotLogin, userController.getLoginPage)
router.get('/',userController.getHomePage)
// router.get('/search',userController.search)
router.get('/mensPage',userController.mensPage)
router.get('/forgotpassword',userController.forgotpassword)

router.get('/Cart',auth.checkBlocked,auth.islogin,cartcontroller.LoadCart)
router.get('/addtocart',auth.checkBlocked,auth.islogin,cartcontroller.AddtoCart)
router.get('/DetailP',auth.checkBlocked,auth.islogin,userController.ProductDetails)
router.get('/PlaceOrder',auth.checkBlocked,auth.islogin,PlaceOrdercontroller.placeorder)
router.post('/cancelOrder/:OrderId/:OrderId',auth.checkBlocked,auth.islogin,PlaceOrdercontroller.cancelOrder)
router.post('/returnOrder',userController.returnOrder)
router.get('/orderDetails',auth.checkBlocked,auth.islogin,userController.orderDetails)
router.get('/logout',userController.logout)
router.get('/detailButton',auth.checkBlocked,auth.islogin,userController.detailButton)

router.post('/signup',userController.veryfySignin)
router.post('/login',userController.verifylogin)
router.post('/OTP', userController.verifyOTP),
router.post('/resendOTP',userController.resendOTP)
router.post('/FPOTP',userController.sentforgotOTP)
router.post('/Resetpassword',userController.otpverification)
router.post('/FPOT',userController.Resetpassword)
router.post('/Address',PlaceOrdercontroller.Address)
router.post('/thank',PlaceOrdercontroller.thank)
router.post('/change-quantity' ,cartcontroller.changeQuantity)
router.post('/placeOrder',PlaceOrdercontroller.thank)
router.post('/verifyPayment',PlaceOrdercontroller.verifyPayment)
router.post('/removeCart',cartcontroller.removeCart)
router.get('/Invoice',auth.checkBlocked,auth.islogin,PlaceOrdercontroller.Invoice)

// router.post("/couponApply",userController.couponApply)
router.post("/applycoupon/:couponCode", userController.couponApply);

router.get("/wallet",auth.checkBlocked,auth.islogin,userController.wallet)
router.get("/myAccount",auth.checkBlocked,auth.islogin,userController.myAccount)
router.post("/editAddress",auth.checkBlocked,auth.islogin,userController.editAddress)
router.post("/deleteAddress",userController.deleteAddress),
router.get("/editAddress",auth.checkBlocked,auth.islogin,userController.editAddress),
router.post("/updateAddress",auth.checkBlocked,auth.islogin,userController.updateAddress)

module.exports=router;