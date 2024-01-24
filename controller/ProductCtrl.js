const Product=require('../model/ProductModel')
const Category=require('../model/CategoryModel')
const path = require('path')


const loadProduct=async(req,res)=>
{
    try {
        const category=await Category.find();
        res.render('admin/Addproduct',{category})
        console.log(category);

    } catch (error) {
        console.log(error.message)
    }
}
const Addproductpage= async(req, res)=>
{
    try
    {
        const category=await Category.find({})
        console.log(category);
        res.render('admin/Addproduct',{Addproductpage})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const  addproduct=async(req,res)=>
{
    try {


        console.log('req')
        console.log(req)
        console.log('req.files')
        console.log(req.files)
        const fileNames = req.files.map((file) => file.filename);
        console.log(fileNames)
        let product=new Product({
        ProductName:req.body.ProductName,
        BrandName:req.body.BrandName,
        category:req.body.category,
        Description:req.body.Description,
        RegularPrice:req.body.RegularPrice,
        SalesPrice:req.body.SalesPrice,
        stock:req.body.stock,
        // Quantity:req.body.Quantity,
       image:fileNames,
       offerPrice:req.body.offerPrice

        })
        console.log(product)
        product=await product.save()
        res.redirect('/admin/Product')

    }catch (error) {
        console.log(error.message)
        
    }
}

   const loadProducts=async(req,res)=>
{
  try {
    const products=await Product.find({isListed:true})
    const category=await Category.find()
            const itemsperpage = 5;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(products.length / 5);
            const currentproduct = products.slice(startindex,endindex);

    res.render('admin/Product',{products:currentproduct,category , totalpages , currentpage:currentpage})
  } catch (error) {
    
  }
}

productShow=async(req,res)=>
{
    console.log("enterr");
    const products=await Product.find()
    console.log(products,".>>>>>>>>>>>>>>>>>>>>>..");
    res.render("User/Home",{products})
}



// Pagination

// const productList=async (req,res)=>
// {
//     try {
//         const page=req.query.page || 1;
//         const items_per_page=5
//         const totalProduct=await Product.countDocuments({is_listed:true})
//         const totalPage=Math.ceil(totalProduct/items_per_page)
//         const sort=req.query.sort || ''


//         filter={is_listed:true};
//         let sorting={}
//         if(sort){
//             if(sort=='price_acend'){
//                 sorting.price=1
//             }else{
//                 sorting.price=-1
//             }
//         }

//         const products=await Product.find(filter)
//            .sort(sorting)
//            .skip((page-1)*items_per_page)
//            .limit(items_per_page)
//            res.render('Product',{
//             products,
//             totalPage,
//             currentpage:page,
//             sort:sort
//            })

//     } catch (error) {
//         console.log(error.message)
//     }
// }



const productList = async (req, res) => {
    try {
        console.log("HIi")
        const page = parseInt(req.query.page) || 1; // Parse page as an integer
        const itemsPerPage = 5;

        // Get the total number of products with is_listed: true
        const totalProduct = await Product.countDocuments({ isListed: true });
        console.log("tt:",totalProduct)
        const totalPage = Math.ceil(totalProduct / itemsPerPage);
        console.log("number:",totalPage)

        const sort = req.query.sort || '';

        const filter = { isListed: true };
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
        console.log("======================>",totalPage)
        res.render('Product', {
            products,
            totalPage,
            currentPage: page,
            sort: sort
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error'); // Handle the error more gracefully
    }
};


const editProduct=async(req,res)=>
{
    try {
        const proId=req.query.id
        console.log('LLLLL',proId)
        const prodDoc=await  Product.findById(proId)
        const categories=await Category.find();
        res.render('admin/editProduct',{category:categories,prodDoc})
    } catch (error) {
        console.log(error.message)
    }

}




// const updateProduct = async (req, res) => {
//   try {
//     console.log("reached update product")
//     const id  = req.body.productId
//     console.log(id)
//     const existingProduct = await Product.findById(id);

//     if (!existingProduct) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
//     const category=req.body.category
//     console.log(category);
//     const imageFile=req.file

//     if
        

//     console.log(imageFiles)

//     // Update the product fields based on the request body
//     const {
//       ProductName,
//       BrandName,
//       Description,
//       RegularPrice,
//       SalesPrice,
//       image,
//       stock,
//     } = req.body;

    
//     console.log(ProductName,
//         BrandName,
//         Description,
//         RegularPrice,
//         category,
//         SalesPrice,
//         image,
//         stock,)

//     existingProduct.ProductName = ProductName;
//     existingProduct.BrandName = BrandName;
//     existingProduct.category = category;
//     existingProduct.Description = Description;
//     existingProduct.RegularPrice = RegularPrice;
//     existingProduct.SalesPrice = SalesPrice;
//     existingProduct.image = imageFiles,
//     existingProduct.stock = stock;

//     // Save the updated product
//     const updatedProduct = await existingProduct.save();
//     console.log("updated")

//     res.json(updatedProduct);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const updateProduct = async (req, res) => {
    try {
        console.log("reached update product");
        const id = req.body.productId;
        console.log(id);
        const existingProduct = await Product.findById(id);
        console.log('File upload middleware executed');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const category = req.body.category;
        console.log(category);

       // Access the uploaded image files
       const imageFiles = req.files;
       console.log(imageFiles);
       const images = imageFiles ? imageFiles.map((file) => file.filename) : [];
       console.log(images);


        // Update the product fields based on the request body
        const {
            ProductName,
            BrandName,
            Description,
            RegularPrice,
            SalesPrice,
            stock,
            
        } = req.body;

        

        console.log(
            ProductName,
            BrandName,
            RegularPrice,
            category,
            SalesPrice,
            stock
        );

        existingProduct.ProductName = ProductName || existingProduct.ProductName;
        existingProduct.BrandName = BrandName || existingProduct.BrandName;
        existingProduct.category = category || existingProduct.category;
        existingProduct.RegularPrice = RegularPrice || existingProduct.RegularPrice;
        existingProduct.SalesPrice = SalesPrice || existingProduct.SalesPrice;
        existingProduct.image = images || existingProduct.image;
        existingProduct.stock = stock || existingProduct.stock;

        // Save the updated product
        const updatedProduct = await existingProduct.save();
        console.log("updated");
        
        res.redirect('/admin/Product')
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteProduct=async(req,res)=>
{
    try {
        const De=req.query.id
        console.log(De)
        const we=await Product.findByIdAndUpdate(De,{$set:{isListed:false}})
        if(we){
            console.log("soft deleted")
            return res.json({status:200, message:"deleted"})
        }else{
            console.log("soft deletion not work")
            return res.json({status:404, message:"Can't delete"})
        }
        
    } catch (error) {
        console.log(error)
            return res.json({status:404, message:"Internal server error"})
    }
}



module.exports={
    loadProduct,
    Addproductpage,
    addproduct,
    loadProducts,
    productList,
    editProduct,
    updateProduct,
    deleteProduct
}