import express from 'express';
import {registerUser,loginUser, getProfile,updateProfile,bookAppointment, listAppointment,cancelAppointment,paymentSSLCommerz,paymentSuccess,paymentFail,paymentCancel} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register' ,registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/get-profile',authUser, getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser, updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)


// Payment callback routes - handle both GET and POST
// Payment initiation
userRouter.post('/payment-sslcommerz', authUser, paymentSSLCommerz);

// Payment callback routes - handle both GET and POST since SSLCommerz can send either
userRouter.get('/payment/success/:appointmentId', paymentSuccess);
userRouter.post('/payment/success/:appointmentId', paymentSuccess);
userRouter.get('/payment/fail/:appointmentId', paymentFail);
userRouter.post('/payment/fail/:appointmentId', paymentFail);
userRouter.get('/payment/cancel/:appointmentId', paymentCancel);
userRouter.post('/payment/cancel/:appointmentId', paymentCancel);

export default userRouter;