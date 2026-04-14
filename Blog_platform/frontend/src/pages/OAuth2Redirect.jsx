import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2Redirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    localStorage.setItem('token', token);
    setToken(token);
    window.location.replace('/');
  }, [navigate, searchParams, setToken]);

  return (
    <div className="page-container">
      <div className="loader">
        <div className="spinner" />
      </div>
    </div>
  );
}
