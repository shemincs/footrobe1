
const User = require('../model/UserModel')

const adminlogin = async(req, res, next)=>
{
    try
    {
        console.log(req.session.admin_id)
      if(req.session.admin_id)
      {
        console.log(req.session.admin_id)
        console.log("adminlogin")
        next()
      }
      else
      {
        console.log("seeee")
        return res.redirect('/admin/login')
      }
    }
    catch(error)
    {
        console.log(error.message)
        return res.status(500).send("Internal Server error")
    }
} 

const adminnotLogin = async(req, res, next)=>
{
    try
    {   console.log(req.session.admin_id)
        if(req.session.admin_id )
        {
            res.redirect('/admin/home')
        }
        else
        {
            console.log("NEXTTTTTTTTTTTTTTTTTTTT")
            next()
        }
    }
    catch(error)
    {
        console.log(error.message)
    }


}// Middleware function to check user authorization
// const checkAuthorization = async (req, res, next) => {
//     try {
//         const cB = req.session.user_id;
//         console.log("Session User ID:", cB);

//         // Set a timeout to limit the waiting time for the database query
//         const timeoutDuration = 5000; // 5 seconds (adjust as needed)
//         const userDataPromise = User.findById(cB).exec();

//         const timeoutPromise = new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve({ timeout: true });
//             }, timeoutDuration);
//         });

//         const userData = await Promise.race([userDataPromise, timeoutPromise]);

//         if (userData.timeout) {
//             throw new Error('Database query timeout');
//         }

//         if (userData && userData.is_blocked === false) {
//             console.log("User is not blocked");
//             next();
//         } else {
//             console.log("User is blocked or not found");
//             res.redirect('/login');
//         }
//     } catch (error) {
//         console.error("Authorization Error:", error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };



module.exports={
    adminlogin,
    adminnotLogin,


}