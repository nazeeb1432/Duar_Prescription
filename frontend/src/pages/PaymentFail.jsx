import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentFail = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handlePaymentFailure = () => {
            try {
                const error = searchParams.get('error');

                console.log('Payment Fail Page - appointmentId:', appointmentId, 'error:', error);

                toast.error(error || 'Payment failed. Please try again.');

                setTimeout(() => {
                    navigate('/my-appointments?payment=failed');
                }, 3000);
            } catch (error) {
                console.log('Payment fail page error:', error.message);
                toast.error('Payment failed. Please try again.');
                setTimeout(() => {
                    navigate('/my-appointments?payment=failed');
                }, 3000);
            }
        };

        handlePaymentFailure();
    }, [appointmentId, searchParams, navigate]);

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
                <div className='mb-6'>
                    <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Failed!</h2>
                    <p className='text-gray-600'>Unfortunately, your payment could not be processed.</p>
                    <p className='text-gray-600'>Please try again or contact support if the issue persists.</p>
                    {searchParams.get('error') && (
                        <p className='text-red-500 text-sm mt-2'>Error: {searchParams.get('error')}</p>
                    )}
                </div>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto'></div>
                <p className='text-sm text-gray-500 mt-4'>Redirecting back to appointments...</p>
            </div>
        </div>
    );
};

export default PaymentFail;