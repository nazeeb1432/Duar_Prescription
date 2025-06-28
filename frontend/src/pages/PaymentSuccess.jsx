import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handlePaymentSuccess = () => {
            try {
                const status = searchParams.get('status');

                console.log('Payment Success Page - appointmentId:', appointmentId, 'status:', status);

                if (appointmentId && (status === 'VALID' || status === 'VALIDATED')) {
                    toast.success('Payment completed successfully!');
                } else {
                    console.log('Invalid payment data:', { appointmentId, status });
                    toast.error('Invalid payment data');
                }

                setTimeout(() => {
                    navigate('/my-appointments?payment=success');
                }, 2000);
            } catch (error) {
                console.log('Payment success page error:', error.message);
                toast.error('Payment verification failed');
                setTimeout(() => {
                    navigate('/my-appointments?payment=failed');
                }, 2000);
            }
        };

        handlePaymentSuccess();
    }, [appointmentId, searchParams, navigate]);

    return (
        <div className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
                <div className='mb-6'>
                    <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                    </div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Successful!</h2>
                    <p className='text-gray-600'>Your appointment payment has been processed successfully.</p>
                </div>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='text-sm text-gray-500 mt-4'>Redirecting to your appointments...</p>
            </div>
        </div>
    );
};

export default PaymentSuccess;