import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { disconnectSocket } from '../services/socket';

function Logout() {
  const { logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    disconnectSocket();
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
}

export default Logout;
