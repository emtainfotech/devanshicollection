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
    // Note: PhonePe might send transaction status in POST body to callbackUrl, 
    // but the redirectUrl is just a GET. We should poll our server for status.
    
    // Extract order ID from merchantTransactionId if possible, or just wait for callback to hit server.
    // For now, let's assume we can find the order status by polling our API.
    
    let pollCount = 0;
    const maxPolls = 10;
    
    const checkStatus = async () => {
      try {
        // We need the orderId. If it's not in URL, we might need to find it by merchantTransactionId
        // but our current API status endpoint takes orderId.
        // Let's search for the latest order of the user or wait for the server to update.
        
        const orders = await api.get('/my-orders');
        const latestOrder = orders[0];
        
        if (latestOrder && latestOrder.payment_status === 'paid') {
          setStatus('success');
          setMessage('Your payment was successful! Your order is being processed.');
        } else if (pollCount < maxPolls) {
          pollCount++;
          setTimeout(checkStatus, 2000);
        } else {
          setStatus('failed');
          setMessage('We could not verify your payment status. Please check your account or raise a complaint if the amount was deducted.');
        }
      } catch (error) {
        setStatus('failed');
        setMessage('An error occurred while verifying payment.');
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
