import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentCancel = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handlePaymentCancellation = () => {
            try {
                console.log('Payment Cancel Page - appointmentId:', appointmentId);
                toast.info('Payment was cancelled.');
                setTimeout(() => {
                    navigate('/my-appointments?payment=cancelled');
                }, 3000);
            } catch (error) {
                console.log('Payment cancel page error:', error.message);
                toast.info('Payment was cancelled.');
                setTimeout(() => {
                    navigate('/my-appointments?payment=cancelled');
                }, 3000);
            }
        };

        handlePaymentCancellation();
    }, [appointmentId, searchParams, navigate]);

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
                <div className='mb-6'>
                    <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
                        </svg>
                    </div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Cancelled</h2>
                    <p className='text-gray-600'>You have cancelled the payment process.</p>
                    <p className='text-gray-600'>You can try again anytime from your appointments page.</p>
                </div>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto'></div>
                <p className='text-sm text-gray-500 mt-4'>Redirecting back to appointments...</p>
            </div>
        </div>
    );
};

export default PaymentCancel;