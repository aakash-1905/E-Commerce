const Order = require('../models/orderModels');
const Product = require('../models/productModel');
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { validate } = require('../models/orderModels');

// new order 
exports.newOrder = catchAsyncErrors(async (req,res,next)=>{
   const {shippingInfo,orderItems,paymentInfo,itemPrice,taxPrice,shippingPrice,totalPrice}=req.body;
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user.id,
});
    res.status(201).json({
        success:true,
        order
    })
} );

// get single order
exports.getSingleOrder = catchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new ErrorHandler(404,"Order not found"));
    }
    res.status(200).json({
        success:true,
        order
    })
}
);
// get loggedin user order
exports.myOrders = catchAsyncErrors(async (req,res,next)=>{
    const orders = await Order.find({user: req.user._id});
    if(!orders){
        return next(new ErrorHandler(404,"Order not found"));
    }
    res.status(200).json({
        success:true,
        orders
    })
}
);

// get all orders -- admin
exports.getAllOrders = catchAsyncErrors(async (req,res,next)=>{
    const orders = await Order.find();
    let totalAmnt = 0;
    orders.forEach(order=>{
        totalAmnt += order.totalPrice;
    } );
    if(!orders){
        return next(new ErrorHandler(404,"Order not found"));
    }
    res.status(200).json({
        success:true,
        totalAmnt,
        orders
    })
}
);

// update order status -- admin
exports.updateOrderStatus = catchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(order.orderStatus === "delivered"){
        return next(new ErrorHandler("Order already delivered",400));
    }
    if(!order){
        return next(new ErrorHandler("Order not found",400));
    }
    order.orderItems.forEach(async (item)=>{
        await updateStock(item.product,item.quantity);
    } );
    order.orderStatus = req.body.status;
    if(req.body.status === "delivered"){
        order.deliveredAt = Date.now();
    }
    await order.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        order
    })
});
async function updateStock(productId,quantity){
    const product = await Product.findById(productId);
    product.stock -= quantity;
    await product.save({validateBeforeSave:false});
}

//delete order -- admin
exports.deleteOrder = catchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",400));
    }
    await order.remove();
    res.status(200).json({
        success:true,
        message:"Order deleted successfully"
    })
}
);

