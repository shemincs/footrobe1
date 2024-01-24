
const Product = require('../model/ProductModel')
const Cart = require('../model/CartModel')
const mongoose = require('mongoose')



// const LoadCart = async (req, res) => {
//     try {
//         const user_id = req.session.user_id;
//         console.log('User ID:', user_id);
//         const cart = await Cart.findOne({ user: user_id });

//         if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
//             console.log("No items in the cart");
//             res.render('User/cart', { cart: null });
//         } else {
//             console.log("Cart found");
//             console.log(cart);
//             let grandTotal = 0;
//             for(let i=0;i<cart.cartItems.length;i++){
//                 grandTotal += cart.cartItems[i].Quantity * cart.cartItems[i].SalesPrice;
//             }
//             console.log(grandTotal)
//             res.render('User/cart', { cart , grandTotal});
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }
// const LoadCart = async (req, res) => {
//     try {
//         const user_id = req.session.user_id;
//         console.log('User ID:', user_id);
//         const cart = await Cart.findOne({ user: user_id });

//         if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
//             console.log("No items in the cart");
//             res.render('User/cart', { cart: null, grandTotal: 0 }); // Pass grandTotal as 0
//         } else {
//             console.log("Cart found");
//             console.log(cart);
//             let grandTotal = 0;
//             for (let i = 0; i < cart.cartItems.length; i++) {
//                 grandTotal += cart.cartItems[i].Quantity * cart.cartItems[i].SalesPrice;
//             }
//             console.log(grandTotal);
//             res.render('User/cart', { cart, grandTotal });
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }


// const LoadCart = async (req, res) => {
//     try {
//         const user_id = req.session.user_id;
//         console.log('User ID:', user_id);
//         const cart = await Cart.findOne({ user: user_id });

//         if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
//             console.log("No items in the cart");
//             res.render('User/cart', { cart: null, grandTotal: 0 }); // Pass grandTotal as 0
//         } else {
//             console.log("Cart found");
//             console.log(cart);
//             let grandTotal = 0;
//             for (let i = 0; i < cart.cartItems.length; i++) {
//                 // Check if offer price exists, if yes, use offer price for the calculation
//                 const price = cart.cartItems[i].offerPrice ? cart.cartItems[i].offerPrice : cart.cartItems[i].SalesPrice;
//                 grandTotal += cart.cartItems[i].Quantity * price; // Calculate the total based on the price (offer or sales)
//             }
//             console.log(grandTotal);
//             res.render('User/cart', { cart, grandTotal });
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }

const LoadCart = async (req, res) => {
    let cartCount = 0; // Declare cartCount outside the try block

    try {
        const user_id = req.session.user_id;
        console.log('User ID:', user_id);
        const cart = await Cart.findOne({ user: user_id });

        if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
            console.log("No items in the cart");
            res.render('User/cart', { cart: null, grandTotal: 0, cartCount }); // Use cartCount without redeclaration
        } else {
            console.log("Cart found");
            console.log(cart);
            let grandTotal = 0;
            for (let i = 0; i < cart.cartItems.length; i++) {
                // Check if offer price exists, if yes, use offer price for the calculation
                const price = cart.cartItems[i].offerPrice ? cart.cartItems[i].offerPrice : cart.cartItems[i].SalesPrice;
                grandTotal += cart.cartItems[i].Quantity * price; // Calculate the total based on the price (offer or sales)
            }
            console.log(grandTotal);

            // Calculate cart count by using the length of cartItems array
            cartCount = cart.cartItems.length;
            console.log("CaartCC",cartCount)

            res.render('User/cart', { cart, grandTotal, cartCount });
        }
    } catch (error) {
        console.error(error);
    }
}





const AddtoCart = async (req, res) => {
    try {
        const user_id = req.session.user_id;
        const productId = req.query.productId;

        const product = await Product.findOne({ _id: productId });
        
        if (!product) {
            return res.status(404).send("Product not found");
        }

        const cart = await Cart.findOne({ user: user_id });

        if (cart) {
            const existingItem = cart.cartItems.find(item => item.productId.toString() === productId);

            if (existingItem) {
                existingItem.Quantity += 1;
                existingItem.total = existingItem.Quantity * (product.offerPrice || product.SalesPrice); // Consider offer price if available

            } else {
                console.log("BBBB",product?.offerPrice)
                const cartItem = {
                    productName: product.ProductName,
                    user: user_id,
                    productId: productId,
                    image: product.image[0],
                    Quantity: 1,
                    SalesPrice: product.SalesPrice,
                    offerPrice:product.offerPrice,
                    total: product.offerPrice || product.SalesPrice // Consider offer price if available
                };
                cart.cartItems.push(cartItem);
            }

            cart.total = cart.cartItems.reduce((total, item) => total + item.total, 0);

            await cart.save();
        } else {
            const newCart = new Cart({
                user: user_id,
                cartItems: [{
                    productName: product.ProductName,
                    user: user_id,
                    productId: productId,
                    image: product.image[0],
                    Quantity: 1,
                    offerPrice:product.offerPrice,
                    SalesPrice: product.SalesPrice,
                    total: product.offerPrice || product.SalesPrice // Consider offer price if available
                }],
                total: product.offerPrice || product.SalesPrice // Consider offer price if available
            });

            await newCart.save();
        }

        res.redirect('/Cart');
    } catch (error) {
        console.error(error.message);
        res.status(500).send("An error occurred.");
    }
}








// const changeQuantity=(req,res)=>{
//     console.log('i am here')
//     req.body.count = parseInt(req.body.count);
//     req.body.quantity = parseInt(req.body.quantity);
//     console.log(req.body.proId)
//     if(req.body.count == -1 && req.body.quantity == 1){
//         user.updateOne(
//             {_id: req.body.user},
//             {$pull: {cart: {ProductId: req.body.proId}}
//         }).then((status)=>{
//             res.json({status:true})
//         })
//     }else{
//         console.log(req.body)
//         Cart.updateOne(
//             {
//               user: req.session.user_id,
//               'cartItems.productId': req.body.proId,
//             },
//             {
//               $inc: {
//                 'cartItems.$.Quantity': req.body.count,
//               }
//             },
//             {
//                 new:true
//             }
//         ).then((status)=>{
//             console.log(status)
//             res.json({status:false})
//         })
//     }
// }


const changeQuantity = (req, res) => {
    console.log('I am here');
    req.body.count = parseInt(req.body.count);
    req.body.quantity = parseInt(req.body.quantity);
    console.log(req.body.proId);

    // Fetch the product from your database using req.body.proId and get its stock quantity
    Product.findById(req.body.proId)
        .then((product) => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // Check if the new quantity will exceed the available stock
            const newQuantity = req.body.quantity + req.body.count;
            if (newQuantity > product.stock) {
                return res.json({ status: false,scheck:true, error: 'Exceeds available stock' });
            }

            if (req.body.count === -1 && req.body.quantity === 1) {
                user.updateOne(
                    { _id: req.body.user },
                    { $pull: { cart: { ProductId: req.body.proId } } }
                ).then((status) => {
                    res.json({ status: true });
                });
            } else {
                Cart.updateOne(
                    {
                        user: req.session.user_id,
                        'cartItems.productId': req.body.proId,
                    },
                    {
                        $inc: {
                            'cartItems.$.Quantity': req.body.count,
                        },
                    },
                    {
                        new: true,
                    }
                ).then((status) => {
                    console.log(status);
                    res.json({ status: false });
                });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
};


// const removeCart = async (req, res) => {
//     const productIdToRemove = req.body.productId;
//     console.log('Product ID to remove:', productIdToRemove);
//     try {
//         const userCart = await Cart.findOne({ user: req.user_id });
//         console.log('User Cart:', userCart); // Log userCart to check if it's retrieved

//         if (!userCart) {
//             return res.status(404).json({ message: 'Cart not found for this user.' });
//         }

//         userCart.cartItems = userCart.cartItems.filter(item => item.productId.toString() !== productIdToRemove);

//         // Recalculate the cartTotal if needed
//         userCart.cartTotal = calculateCartTotal(userCart.cartItems); // You need to implement this function

//         // Save the updated cart
//         await userCart.save();

//         res.status(200).json({ message: 'Item removed from the cart successfully.', updatedCart: userCart });
//     } catch (error) {
//         console.error('Error:', error); // Log any potential errors
//         res.status(500).json({ message: 'Internal server error.', error: error.message });
//     }
// }

// Calculate cart total function
const calculateCartTotal = (cartItems) => {
    let total = 0;
    for (const item of cartItems) {
        total += item.total || (item.Quantity * item.SalesPrice);
    }
    return total;
};

const removeCart = async (req, res) => {
    const productIdToRemove = req.body.productId;
    console.log('Product ID to remove:', productIdToRemove);
    try {
        const userCart = await Cart.findOne({ user: req.session.user_id }); // Ensure correct property access for user ID
        console.log('User Cart:', userCart);

        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        userCart.cartItems = userCart.cartItems.filter(item => item.productId.toString() !== productIdToRemove);
        userCart.cartTotal = calculateCartTotal(userCart.cartItems);
        await userCart.save();

        res.status(200).json({ message: 'Item removed from the cart successfully.', updatedCart: userCart });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

module.exports={
    LoadCart,
    AddtoCart,
    changeQuantity,
    removeCart

}