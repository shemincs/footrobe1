const express=require("express")
const app=express()
const port=2000
const expressLayouts=require('express-ejs-layouts');
const path=require('path')
const bodyParser = require("body-parser");
const logger=require("morgan")
app.use(logger("dev"))
const session = require('express-session')
const nocache = require('nocache')
const dotenv=require('dotenv').config()



// Parse URL-encoded bodies (usually for form data)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (usually for JSON API payloads)
app.use(express.json())

const mongoose=require("mongoose")

 
const userRoute=require('./routes/userRoute')
const AdminRoute=require('./routes/AdminRoute')

app.set('views', path.join(__dirname, 'views'));


// database connection
        mongoose.connect(process.env.MONGODB_URI)
        .then(console.log('database connected successfully'));

app.use(session({
    secret:'secret-key',
    resave: false,
    saveUninitialized: true
}))
app.use(nocache())

app.use(expressLayouts)
app.use(express.static('public/users'))
app.set('layout','./layouts/Authlayout')
app.use('/assets',express.static(path.resolve(__dirname,"public/assets")))
app.use('/adminassets',express.static(path.resolve(__dirname,"public/admin/assets")))
app.use('/AdminCat',express.static(path.resolve(__dirname,"public/Adcategory")))
app.set('views', path.join(__dirname, 'views'));


app.set('view engine','ejs')


app.use('/',userRoute)



// Admin

app.use('/admin',AdminRoute)
app.use('*', (req, res)=>
{
    res.send('404 File not found')
})





app.listen(port,()=>{
    console.log("successfully started")
})