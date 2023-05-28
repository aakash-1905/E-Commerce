const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

//create product --Admin

exports.createProduct = catchAsyncErrors(async(req,res,next)=> {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })

})

//get Al products
exports.getAllProducts = catchAsyncErrors( async (req,res,next)=>{

    const productCount = await Product.countDocuments();
    const resultPerPage = 5;
    const apiFeatures = new ApiFeatures(Product.find(),req.query).search()
    .filter().pagination(resultPerPage);

    const products = await apiFeatures.query;

    res.status(200).json({
        success:true,
        products,
        productCount    
    })
  
})

//update product --Admin
exports.updateProduct = catchAsyncErrors (async (req,res,next)=>{
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true,
        product
    })
})
    
//delete product --Admin
exports.deleteProduct = catchAsyncErrors(async (req,res,next)=>{
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product deleted"
    })
})

// get product details 
exports.getProductDetails = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        product
    })
})

//create or update review 
exports.createOrUpdateReview = catchAsyncErrors(async (req,res,next)=>{
    
    const {rating ,comment,productId} = req.body;   
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }
    const product = await Product.findById(productId);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    const isReviewed = product.reviews.find(rev=>rev.user.toString() === req.user._id.toString());
    if(isReviewed){
       product.reviews.forEach(rev =>{
        if(rev.user.toString() === req.user._id.toString()){
            rev.rating = Number(rating);
            rev.comment = comment;
    }
    })
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;  
    }

    let avgRating = 0;
    product.reviews.forEach(rev=>{
        avgRating += rev.rating;
    } )
    product.ratings = avgRating/product.reviews.length;
    
    // product.ratings = product.reviews.forEach(rev=>{
    //     avgRating += rev.rating;
    // })/product.reviews.length;
    
    await product.save({validateBeforeSave:false});
    
    res.status(201).json({
        success:true,
        review
    })
});

//get product reviews
exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
}
)

//delete product review
exports.deleteProductReview = catchAsyncErrors(async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    const review = product.reviews.find(rev=>rev._id.toString() === req.query.id.toString());
    if(!review){
        return next(new ErrorHandler("Review not found",404));
    }
    product.reviews.pull(review);
    product.numOfReviews = product.reviews.length;
    let avgRating = 0;
    product.reviews.forEach(rev=>{
        avgRating += rev.rating;
    } )
    product.ratings = avgRating/product.reviews.length;
    await product.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        message:"Review deleted"
    })

    // const product = await Product.findById(req.query.productId);
   
    // if(!product){
    //     return next(new ErrorHandler("Product not found",404));
    // }
    // const reviews = product.reviews.filter((rev)=>rev._id.toString() !== req.query.id.toString());
    
    // let avgRating = 0;
    // reviews.forEach(rev=>{
    //     avgRating += rev.rating;
    // } )
    // const ratings = avgRating/reviews.length;
    
    // const numOfReviews = reviews.length;
   

 
    // await Product.findByIdAndUpdate(req.query.productId,{
    //     reviews,
    //     numOfReviews,
    //     ratings 
    //     },{
    //         new:true,
    //         runValidators:true,
    //         useFindAndModify:false,
    //         })
    // res.status(200).json({
    //     success:true,
    //     message:"Review deleted"
    // })
});