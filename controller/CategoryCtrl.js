const Category=require('../model/CategoryModel')


const Createcategory = async(req, res)=>
{
    try
    {
        console.log("createcategory")
        const {name} = req.body
        console.log(name)

        const exisiting = await Category.findOne({name:{$regex:`^${name}$`, $options:'i'}})
        const categoriesData = await Category.find({})
 
        if(exisiting)
        {
            return res.status(404).send('Category already exist')
        }
        
        const categ = new Category({
            name,
        })
        await categ.save()
        console.log('save')
        return res.status(200).send('Category updated')  //redirect the "/admin/loadcategory" here
    }
    catch(error)
    {
        console.log(error.message)
    }
}


const loadCategory = async(req, res)=>
{
    try
    {
        const categoriesData=await Category.find({})
        res.render('admin/AdCategory',{categoriesData})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const categorypage = async(req, res)=>
{
    try
    {
        const categoriesData=await Category.find({})
        res.render('Admin/Categories',{Categories:categoriesData,categoriesData})
    }
    catch(error)
    {
        console.log(error.message)
    }
}
const loadEditCategory=async (req,res)=>
{
    try {
        const id=req.params.id;
        Category.findById(id).then((data)=>{
            console.log(id)
            console.log(data)
            res.render('admin/EditCategory',{data:data})
        })
        .catch((error)=>{
            console.log(error)
        })
    } catch (error) {
        console.log(error)
    }
}
const UpdateCategory=async(req,res)=>
{
    const id=req.params.id
   
    try {
        const categoryId = id; // Replace 'id' with your category ID
        const newCategoryName = req.body.name.toLowerCase(); // Convert to lowercase
        
        // Check if a category with the same lowercase name already exists
        const existingCategory = await Category.findOne({ _id: { $ne: categoryId }, name: newCategoryName });
        
        if (existingCategory) {
            console.log('Category with the same name already exists (case-insensitive).');
            res.redirect('/admin/Categories'); // Redirect or handle as needed
            return;
        }
        data={
            _id:id,
            name:req.body.name,
            isListed:req.body.isListed,
            description:req.body.description
        }
      
        await Category.findByIdAndUpdate(id,data)
        console.log('hello')
        res.redirect('/admin/Categories')
    } catch (error) {
        console.log(error.message)
        
    }
}

const unList=async(req,res)=>
{
    try {
        const Un=req.query.id
        console.log(Un)
        const Zee=await Category.findByIdAndUpdate(Un,{$set:{listed:false}})
        if(Zee){
            console.log("Unlisted")
            return res.json({status:200, message:"unlisted"})
        }else{
            console.log("unlist  not work")
            return res.json({status:404, message:"Can't Unlist"})
        }
    } catch (error) {
        console.log(error)
        return res.json({status:404, message:"Internal server error"})
        
    }
}

const list=async(req,res)=>
{
    try {
        const Li=req.query.id
        console.log("id:",Li)
        const Zss=await Category.findByIdAndUpdate(Li,{$set:{listed:true}})
        if(Zss){
            console.log("Unlisted")
            return res.json({status:200, message:"listed"})
        }else{
            console.log("list  not work")
            return res.json({status:404, message:"Can't list"})
        }
    } catch (error) {
        console.log(error)
        return res.json({status:404, message:"Internal server error"})
        
    }
}




module.exports={
    Createcategory,
    loadCategory,
    categorypage,
    loadEditCategory,
    UpdateCategory,
    unList,
    list

}