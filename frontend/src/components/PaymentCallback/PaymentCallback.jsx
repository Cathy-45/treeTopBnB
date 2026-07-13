import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { csrfFetch } from '../../store/csrf';
import './PaymentCallback.css';

// PawaPay is now a direct in-app charge (see BookSpot/BookExperience) — the
// guest never leaves the app, so there's no redirect to land back from for
// that gateway anymore; payment confirmation happens via polling inside the
// booking modal itself. This page now only serves the Flutterwave flow,
// kept for whenever card payments come back online: Flutterwave redirects
// the guest's browser back here after hosted checkout, appending
// status/tx_ref/transaction_id as query params. This page never trusts
// those params directly — it hands them to the backend, which re-verifies
// the charge against Flutterwave's own API before marking a booking paid.
const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('checking');
    const [message, setMessage] = useState('Confirming your payment...');

    useEffect(() => {
        const finish = (data) => {
            if (data.paymentStatus === 'paid') {
                setStatus('success');
                setMessage('Payment confirmed — your booking is set.');
            } else {
                setStatus('failed');
                setMessage('We could not confirm this payment. Please contact support if you were charged.');
            }
        };

        const txRef = searchParams.get('tx_ref');
        const transactionId = searchParams.get('transaction_id');
        const flwStatus = searchParams.get('status');

        if (flwStatus === 'cancelled') {
            setStatus('cancelled');
            setMessage('Payment was cancelled.');
            return;
        }

        if (!txRef || !transactionId) {
            setStatus('error');
            setMessage('Missing payment reference — could not confirm this payment.');
            return;
        }

        const verify = async () => {
            try {
                const response = await csrfFetch(`/api/payments/verify?tx_ref=${encodeURIComponent(txRef)}&transaction_id=${encodeURIComponent(transactionId)}`);
                const data = await response.json();
                finish(data);
            } catch (err) {
                setStatus('error');
                setMessage('Something went wrong confirming your payment.');
            }
        };
        verify();
    }, [searchParams]);

    return (
        <div className="payment-callback">
            <div className="payment-callback-card">
                <h1>
                    {status === 'checking' && 'Confirming payment...'}
                    {status === 'success' && 'Payment successful'}
                    {(status === 'failed' || status === 'error') && 'Payment not confirmed'}
                    {status === 'cancelled' && 'Payment cancelled'}
                </h1>
                <p>{message}</p>
                <Link to="/" className="button">Back to ZedBnB</Link>
            </div>
        </div>
    );
};

export default PaymentCallback;
