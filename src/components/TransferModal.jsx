import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './TransferModal.css';

export default function TransferModal({ order, onClose, onTransferred }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { getAuthHeaders } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || '';

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/orders/${order.id || order._id}/transfer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ recipientEmail: email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transfer failed');

      setSuccess(true);
      setTimeout(() => {
        onTransferred(order.id || order._id);
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="transfer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="transfer-modal glass-panel"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="transfer-header">
            <h2>Transfer Ticket</h2>
            <button className="transfer-close" onClick={onClose}><X size={20} /></button>
          </div>

          {success ? (
            <div className="transfer-success">
              <CheckCircle size={56} className="success-icon" />
              <h3>Ticket Transferred!</h3>
              <p>The ticket for <strong>{order.eventTitle}</strong> has been sent to <strong>{email}</strong>.</p>
              <p className="transfer-note">Both you and the recipient will receive a confirmation email.</p>
            </div>
          ) : (
            <>
              <div className="transfer-ticket-preview">
                <UserCheck size={18} className="preview-icon" />
                <div>
                  <p className="preview-label">Transferring</p>
                  <p className="preview-event">{order.eventTitle}</p>
                  <p className="preview-section">{order.section?.name || 'General Admission'} · {order.ticketCount} ticket{order.ticketCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <form onSubmit={handleTransfer} className="transfer-form">
                <label>Recipient's tickt Email</label>
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                {error && <p className="transfer-error">{error}</p>}
                <button
                  type="submit"
                  className={`btn-primary full-width ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Transferring...' : (
                    <><Send size={16} /> Transfer Ticket</>
                  )}
                </button>
                <p className="transfer-warning">⚠️ This action is irreversible. The ticket will be permanently moved to the recipient's account.</p>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
