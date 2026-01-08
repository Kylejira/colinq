import { useState } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSend, disabled, placeholder }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(message.trim());
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type a message..."}
        disabled={disabled || sending}
        rows={1}
      />
      <button 
        type="submit" 
        disabled={!message.trim() || sending || disabled}
        className="send-btn"
      >
        {sending ? '...' : '➤'}
      </button>
    </form>
  );
};

export default MessageInput;

