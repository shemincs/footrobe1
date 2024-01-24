
const User = require('../model/UserModel')



const islogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            console.log(req.session.user_id);
            // User is logged in, continue with the current route
            next();
        } else {
            console.log('skdfhjkjdshfkjlogin')
            // User is not logged in, you can also store the original URL
            // in the session to redirect them back after login if needed
            req.session.originalUrl = req.originalUrl;
            res.redirect('/login'); // Redirect to the login page
        }
    } catch (error) {
        console.log(error.message);
    }
}

const usernotLogin=async(req,res,next)=>{
    try {
        if(req.session.user_id)
        {
            redirect('/')
        }
        else
        {
            next()
        }
    } catch (error) {
        
    }
}


// Middleware function to check if the user is blocked
const checkBlocked = async (req, res, next) => {
    try {
        const id = req.session.user_id; // Assuming you have a userId in your request
         console.log("GTTT",id)
        // Fetch the user details based on the userId
        const user = await User.findById(id);

        if (user && user.is_blocked) {
            // If the user is blocked, clear the session and redirect to login
            req.session.destroy((err) => {
                if (err) {
                    console.log('Error destroying session:', err);
                }
                res.redirect('/login'); // Redirect to your login page
            });
        } else {
            next(); // User is not blocked, proceed with the request
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const setOTPTimer = (req, res, next) => {
    const OTP_EXPIRATION_TIME_SECONDS = 300; // 5 minutes, adjust as needed
  
    // Store the OTP expiration time in the session
    req.session.otpExpirationTime = Date.now() + OTP_EXPIRATION_TIME_SECONDS * 1000;
  
    next();
  };
  





module.exports={
    islogin,
    usernotLogin,
    checkBlocked,
    setOTPTimer
}