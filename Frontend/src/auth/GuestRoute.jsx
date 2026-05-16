import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function GuestRoute({ children }) {
  const { isLoggedIn, role, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <Navigate
        to={role === 'doctor' ? '/doctor-dashboard' : '/dashboard'}
        replace
      />
    );
  }

  return children;
}

export default GuestRoute;
