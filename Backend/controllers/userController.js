const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require('crypto');

// register user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: "sampleid",
            url: "sampleurl"
        }
    });

    sendToken(newUser, 201, res);
});

// login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    // 1. Check if email and password exist
    if (!email || !password) {
        return next(new ErrorHandler( "Please provide email and password", 400));
    }
    // 1. check if user exists
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
        return next(new ErrorHandler( "Invalid Credentials",401));
    }
    // 2. check if password is correct
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorHandler("Invalid Credentials", 401));
    }
    // 3. send token to client
    sendToken(user, 200, res);
}
);

// logout user
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        Message: "Logged out"
    });
})

//forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    // 1. Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("There is no user with that email address", 404));
    }
    // 2. Generate the random reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/api/v1/passwors/reset/${resetToken}`;
    const message = `Forgot your password?\n\n ${resetURL}`;
    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for only 10 minutes)",
            message
        });
        res.status(200).json({
            success: true,
            message: "Token sent to email"
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler("Email could not be sent", 500));
    }
}
);

//reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // 1. Get user based on the token
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    // 2. If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new ErrorHandler("Token is invalid or has expired", 400));
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Passwords do not match", 400));
    }
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3. Update changedPasswordAt property for the user
    // 4. Log the user in, send JWT
    sendToken(user, 200, res);
}
);

//get current user
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
});

//update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
        return next(new ErrorHandler("Current password is incorrect", 401));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Passwords do not match", 400));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
}
);
//update user Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    user.name = req.body.name;
    user.email = req.body.email;
    // user.avatar = req.body.avatar;
    await user.save();
    res.status(200).json({
        success: true,
        data: user
    });
});


//delete user -- admin only
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {    
        return next(new ErrorHandler("User not found", 404));
    }
    await user.remove();
    res.status(204).json({
        success: true,
        message:"user deleted successfully"
    });
}
);

//get all users
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        data: users
    });
}
);

//get user by id
exports.getUserById = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        data: user
    });
}
);

// update user role -- admin
exports.updateProfileAdmin = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    user.name = req.body.name;
    user.email = req.body.email;
    user.role = req.body.role;
    // user.avatar = req.body.avatar;
    await user.save();
    res.status(200).json({
        success: true,
        data: user
    });
});