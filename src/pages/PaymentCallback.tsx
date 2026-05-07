import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { api } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const merchantTransactionId = searchParams.get('merchantTransactionId') || searchParams.get('transactionId');
    const orderIdFromUrl = searchParams.get('orderId');
    
    // Note: PhonePe might send transaction status in POST body to callbackUrl, 
    // but the redirectUrl is just a GET. We should poll our server for status.
    
    let pollCount = 0;
    const maxPolls = 15; // Increased max polls for production stability
    
    const checkStatus = async () => {
      try {
        let orderStatus = null;

        if (orderIdFromUrl) {
          // Use the specific order ID if available in URL
          const response = await api.get(`/payment/status/${orderIdFromUrl}`);
          orderStatus = response.status;
        } else {
          // Fallback to latest order if no orderId in URL
          const orders = await api.get('/my-orders');
          const latestOrder = orders[0];
          if (latestOrder) {
            orderStatus = latestOrder.payment_status;
          }
        }
        
        if (orderStatus === 'paid') {
          setStatus('success');
          setMessage('Your payment was successful! Your order is being processed.');
        } else if (pollCount < maxPolls) {
          pollCount++;
          setTimeout(checkStatus, 3000); // Poll every 3 seconds
        } else {
          setStatus('failed');
          setMessage('We could not verify your payment status. Please check your account or raise a complaint if the amount was deducted.');
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (pollCount < maxPolls) {
          pollCount++;
          setTimeout(checkStatus, 3000);
        } else {
          setStatus('failed');
          setMessage('An error occurred while verifying payment.');
        }
      }
    };

    checkStatus();
  }, [searchParams]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h1 className="font-display text-2xl font-semibold">{message}</h1>
            <p className="font-body text-muted-foreground text-sm">Please do not close this window.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="font-display text-3xl font-semibold">Payment Successful!</h1>
            <p className="font-body text-muted-foreground">{message}</p>
            <Button onClick={() => navigate('/account')} className="w-full">
              Go to My Account
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="space-y-6">
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="font-display text-3xl font-semibold">Payment Verification Failed</h1>
            <p className="font-body text-muted-foreground">{message}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/account')} variant="outline" className="w-full">
                Check Order History
              </Button>
              <Button onClick={() => navigate('/contact')} variant="ghost" className="w-full">
                Contact Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentCallback;
