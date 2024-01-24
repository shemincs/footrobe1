const express = require("express");
const admin_router = express.Router();
const AdminController = require('../controller/AdminCtrl')
const session = require('express-session')
const AdminAuth = require('../middleware/AdminAuth')
const CategoryControler = require('../controller/CategoryCtrl')
const ProductController=require('../controller/ProductCtrl')
const multer = require('multer')
const path = require('path')
const nocache = require('nocache')


// multer-product
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/admin/assets/products'));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  

   const productUpload = multer({ storage: productStorage });

//   const productUpload = multer({
//     storage: productStorage,
// }).array('images'); // 'images' should match the name attribute in your form


  const productCrop=require('../middleware/crop')






admin_router.get('/login',AdminAuth.adminnotLogin,AdminController.Adminlogin)
admin_router.get('/home',AdminAuth.adminlogin,AdminController.Home)
admin_router.get('/monthly-report',AdminAuth.adminlogin,AdminController.graph)

admin_router.get('/logOut',AdminAuth.adminlogin,AdminController.logOut)
admin_router.post('/home', AdminController.verifyadmin)
admin_router.get('/AdCategory',AdminAuth.adminlogin,CategoryControler.loadCategory)

admin_router.post('/AdCategory', AdminAuth.adminlogin,CategoryControler.Createcategory)
admin_router.get('/Categories',AdminAuth.adminlogin,CategoryControler.categorypage)
admin_router.get('/Addproduct',AdminAuth.adminlogin,ProductController.loadProduct)
admin_router.get('/Addproduct',ProductController.Addproductpage)

admin_router.post('/Addproduct',productUpload.array('image'),productCrop.productCrop,ProductController.addproduct),
admin_router.get('/Product',AdminAuth.adminlogin,ProductController.loadProducts),
admin_router.get('/EditCategory/:id',AdminAuth.adminlogin,CategoryControler.loadEditCategory),
admin_router.post('/EditCategory/:id',AdminAuth.adminlogin,CategoryControler.UpdateCategory),

admin_router.get('/userList',AdminAuth.adminlogin,AdminController.userList),
admin_router.get('/userBlock',AdminAuth.adminlogin,AdminController.userBlock)
admin_router.get('/userUnblock',AdminController.userUnblock)

admin_router.get('/editProduct',AdminAuth.adminlogin,ProductController.editProduct)
admin_router.post('/updateProduct',AdminAuth.adminlogin, productUpload.array('image'),ProductController.updateProduct)
admin_router.get('/orderAdmin',AdminAuth.adminlogin,AdminController.orderAdmin)
admin_router.post('/change-status',AdminAuth.adminlogin,AdminController.orderStatus)
// admin_router.get('/salesReport',AdminAuth.adminlogin,AdminController.salesReport)
admin_router.post('/deleteProduct',AdminAuth.adminlogin,ProductController.deleteProduct)
admin_router.post('/Unlist',AdminAuth.adminlogin,CategoryControler.unList)
admin_router.post('/list',AdminAuth.adminlogin,CategoryControler.list)

admin_router.get("/coupon",AdminAuth.adminlogin,AdminController.addCoupon)
admin_router.get("/couponList",AdminAuth.adminlogin,AdminController.couponList)
admin_router.post("/couponGen",AdminAuth.adminlogin,AdminController.addVoucher)
admin_router.post("/couponPost",AdminAuth.adminlogin,AdminController.couponPost)
admin_router.delete("/couponRemove",AdminAuth.adminlogin,AdminController.couponRemove)

// admin_router.get('/Product',ProductController.productList)
admin_router.get('/salesReport',AdminAuth.adminlogin,AdminController.salesReport)

admin_router.get("/salesToday",AdminAuth.adminlogin,AdminController.salesToday )

admin_router.get('/salesWeekly',AdminAuth.adminlogin,AdminController.salesWeekly )

admin_router.get('/salesMonthly',AdminAuth.adminlogin,AdminController.salesMonthly )

admin_router.get('/salesYearly',AdminAuth.adminlogin,AdminController.salesYearly)



module.exports=admin_router