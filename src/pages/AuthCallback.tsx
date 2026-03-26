import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      toast.success('Successfully logged in!');
      navigate('/account');
    } else {
      toast.error('Authentication failed.');
      navigate('/account');
    }
  }, [searchParams, navigate, setToken]);

  return <div>Loading...</div>;
};

export default AuthCallback;
