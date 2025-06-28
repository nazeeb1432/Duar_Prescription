import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import SSLCommerzPayment from 'sslcommerz-lts';

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing details' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid email' });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Enter a strong password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userData = { name, email, password: hashedPassword };
        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ success: false, message: 'Missing details' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dob, gender } = req.body;
        const userId = req.userId;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: 'Data Missing' });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: 'Profile Updated' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime } = req.body;
        const userId = req.userId;

        const docData = await doctorModel.findById(docId).select('-password');
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        let slots_booked = docData.slots_booked;
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [slotTime];
        }

        const userData = await userModel.findById(userId).select('-password');
        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({ success: true, message: 'Appointment Booked' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.userId;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;
        slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Cancelled' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const listAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const paymentSSLCommerz = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.userId;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        if (appointmentData.payment) {
            return res.json({ success: false, message: 'Payment already completed' });
        }

        const userData = await userModel.findById(userId).select('-password');

        const store_id = process.env.SSLCOMMERZ_STORE_ID;
        const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
        const is_live = false;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

        if (!store_id || !store_passwd) {
            return res.json({ success: false, message: 'SSLCommerz credentials not configured' });
        }

        const data = {
            total_amount: appointmentData.amount,
            currency: 'BDT',
            tran_id: appointmentId,
            success_url: `${backendUrl}/api/user/payment/success/${appointmentId}`,
            fail_url: `${backendUrl}/api/user/payment/fail/${appointmentId}`,
            cancel_url: `${backendUrl}/api/user/payment/cancel/${appointmentId}`,
            shipping_method: 'NO',
            product_name: 'Doctor Appointment',
            product_category: 'Service',
            product_profile: 'general',
            cus_name: userData.name || 'Customer',
            cus_email: userData.email,
            cus_add1: userData.address?.line1 || 'Dhaka',
            cus_add2: userData.address?.line2 || 'Bangladesh',
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: userData.phone || '01700000000',
            cus_fax: userData.phone || '01700000000',
            ship_name: userData.name || 'Customer',
            ship_add1: userData.address?.line1 || 'Dhaka',
            ship_add2: userData.address?.line2 || 'Bangladesh',
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        const apiResponse = await sslcz.init(data);

        if (apiResponse.status === 'SUCCESS') {
            console.log('Payment initiated - appointmentId:', appointmentId, 'GatewayPageURL:', apiResponse.GatewayPageURL);
            res.json({ success: true, url: apiResponse.GatewayPageURL, tran_id: appointmentId });
        } else {
            console.log('SSLCommerz Error:', apiResponse);
            res.json({ success: false, message: 'Payment initialization failed' });
        }
    } catch (error) {
        console.log('Payment error:', error);
        res.json({ success: false, message: error.message });
    }
};

const paymentSuccess = async (req, res) => {
    let appointmentId;
    try {
        appointmentId = req.params.appointmentId;
        console.log('Payment Success - Incoming request:', {
            url: req.url,
            method: req.method,
            params: req.params,
            body: req.body,
            query: req.query,
            headers: req.headers,
        });

        // Get data from both body and query (SSLCommerz can send via either)
        const status = req.body?.status || req.query?.status;
        const tran_id = req.body?.tran_id || req.query?.tran_id;
        const val_id = req.body?.val_id || req.query?.val_id;

        console.log('Payment data:', { status, tran_id, val_id, appointmentId });

        if (!appointmentId || appointmentId !== tran_id) {
            console.log('Invalid or missing appointmentId/tran_id', { appointmentId, tran_id });
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId || ''}?error=Invalid transaction ID`);
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            console.log('Appointment not found for ID:', appointmentId);
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId}?error=Invalid appointment`);
        }

        // If we have a val_id, validate the transaction with SSLCommerz
        if (val_id) {
            try {
                const store_id = process.env.SSLCOMMERZ_STORE_ID;
                const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
                const is_live = false;

                const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
                const validationResponse = await sslcz.validate({ val_id });

                console.log('Validation response:', validationResponse);

                if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
                    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
                    console.log('Payment validated and updated for appointment:', appointmentId);
                    return res.redirect(`${process.env.FRONTEND_URL}/payment/success/${appointmentId}?status=VALIDATED`);
                } else {
                    console.log('Payment validation failed:', validationResponse);
                    return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId}?error=Payment validation failed`);
                }
            } catch (validationError) {
                console.log('Validation error:', validationError);
                // If validation fails, fall back to status check
            }
        }

        // Fallback: check status without validation (not recommended for production)
        if (status === 'VALID' || status === 'VALIDATED') {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            console.log('Payment updated for appointment (fallback):', appointmentId);
            return res.redirect(`${process.env.FRONTEND_URL}/payment/success/${appointmentId}?status=${status}`);
        } else {
            console.log('Invalid or missing payment status:', status);
            return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId}?error=Invalid payment status: ${status || 'undefined'}`);
        }
    } catch (error) {
        console.log('Payment success error:', error.message, 'appointmentId:', appointmentId || 'undefined');
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId || ''}?error=Server error: ${error.message}`);
    }
};

const paymentFail = async (req, res) => {
    let appointmentId;
    try {
        appointmentId = req.params.appointmentId;
        console.log('Payment Fail - Incoming request:', {
            url: req.url,
            method: req.method,
            params: req.params,
            body: req.body,
            query: req.query,
        });

        const tran_id = req.body?.tran_id || req.query?.tran_id;
        const error = req.body?.error || req.query?.error || 'Payment failed';
        
        console.log('Payment Failed - appointmentId:', appointmentId, 'tran_id:', tran_id, 'error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId || ''}?error=${encodeURIComponent(error)}`);
    } catch (error) {
        console.log('Payment fail error:', error.message, 'appointmentId:', appointmentId || 'undefined');
        return res.redirect(`${process.env.FRONTEND_URL}/payment/fail/${appointmentId || ''}?error=Server error: ${error.message}`);
    }
};

const paymentCancel = async (req, res) => {
    let appointmentId;
    try {
        appointmentId = req.params.appointmentId;
        console.log('Payment Cancel - Incoming request:', {
            url: req.url,
            method: req.method,
            params: req.params,
            body: req.body,
            query: req.query,
        });

        const tran_id = req.body?.tran_id || req.query?.tran_id;
        console.log('Payment Cancelled - appointmentId:', appointmentId, 'tran_id:', tran_id);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel/${appointmentId || ''}`);
    } catch (error) {
        console.log('Payment cancel error:', error.message, 'appointmentId:', appointmentId || 'undefined');
        return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel/${appointmentId || ''}?error=Server error: ${error.message}`);
    }
};

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentSSLCommerz, paymentSuccess, paymentFail, paymentCancel };