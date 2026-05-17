import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function GuestRoute({ children }) {
  const { isLoggedIn, role, loading } = useUser();

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-slate-400 font-medium">Loading...</p>
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
