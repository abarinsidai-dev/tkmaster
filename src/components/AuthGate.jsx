import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

/**
 * Wraps children in an auth-gate. If the user is not logged in,
 * clicking any wrapped content shows the AuthModal instead of proceeding.
 */
function AuthGate({ children, redirectTo }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e) => {
    if (!currentUser) {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
    } else if (redirectTo) {
      navigate(redirectTo);
    }
  };

  return (
    <>
      <div onClick={handleClick} style={{ display: 'contents' }}>
        {children}
      </div>
      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}

export default AuthGate;
