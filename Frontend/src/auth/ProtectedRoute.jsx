import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function ProtectedRoute({ children, role }) {
  const { isLoggedIn, role: userRole, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return (
      <Navigate
        to={userRole === 'doctor' ? '/doctor-dashboard' : '/dashboard'}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
