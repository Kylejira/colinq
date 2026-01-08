import { useEffect, useRef } from 'react';
import './MessageThread.css';

const MessageThread = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0) return timeStr;
    if (diffDays === 1) return `Yesterday ${timeStr}`;
    if (diffDays < 7) return `${date.toLocaleDateString([], { weekday: 'short' })} ${timeStr}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
  };

  const parseCollabProposal = (content) => {
    const match = content.match(/^\[Collaboration Proposal: (.+)\]\n\n(.+)$/s);
    if (match) {
      return { collabType: match[1], message: match[2] };
    }
    return null;
  };

  const renderMessageContent = (content) => {
    const proposal = parseCollabProposal(content);
    
    if (proposal) {
      return (
        <>
          <div className="collab-proposal-badge">
            🤝 {proposal.collabType}
          </div>
          <p>{proposal.message}</p>
        </>
      );
    }

    return <p>{content}</p>;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="message-thread">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="message-group">
          <div className="date-divider">
            <span>{formatDateHeader(date)}</span>
          </div>
          {dateMessages.map((message, index) => {
            const isMine = message.is_mine || message.sender_id === currentUserId;
            const showTime = index === dateMessages.length - 1 || 
              dateMessages[index + 1]?.sender_id !== message.sender_id;

            return (
              <div
                key={message.id}
                className={`message ${isMine ? 'mine' : 'theirs'}`}
              >
                <div className="message-bubble">
                  {renderMessageContent(message.content)}
                </div>
                {showTime && (
                  <span className="message-time">{formatTime(message.created_at)}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageThread;



