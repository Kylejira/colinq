import './MessageTemplates.css';

const TEMPLATES = [
  {
    id: 'intro',
    label: '👋 Introduction',
    text: "Hey! I love your content and think we'd make great collab partners. I've been creating [type] content for [time] and my audience really resonates with [topic]. Would love to chat about working together!",
  },
  {
    id: 'collab_idea',
    label: '💡 Collab Idea',
    text: "I have an idea that could be amazing for both our audiences: [describe idea]. I think it would work because [reason]. What do you think?",
  },
  {
    id: 'guest',
    label: '🎙️ Guest Request',
    text: "I'd love to have you as a guest on my [channel/podcast]. Your expertise in [topic] would be perfect for my audience. The episode would be about [topic] and typically runs [length]. Interested?",
  },
  {
    id: 'crosspromo',
    label: '📢 Cross-Promo',
    text: "I think our audiences would really benefit from knowing about each other's content. Would you be interested in doing a shoutout exchange? I can feature you in my [video/story/post] and you could mention me in yours.",
  },
  {
    id: 'followup',
    label: '🔄 Follow Up',
    text: "Just wanted to follow up on my previous message. I'm really excited about the possibility of working together. Let me know if you have any questions or want to hop on a quick call to discuss!",
  },
];

const MessageTemplates = ({ onSelect, onClose }) => {
  return (
    <div className="templates-overlay" onClick={onClose}>
      <div className="templates-panel" onClick={e => e.stopPropagation()}>
        <div className="templates-header">
          <h3>Conversation Starters</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <p className="templates-hint">
          Select a template to use as a starting point. You can customize it before sending.
        </p>

        <div className="templates-list">
          {TEMPLATES.map(template => (
            <button
              key={template.id}
              className="template-item"
              onClick={() => onSelect(template.text)}
            >
              <span className="template-label">{template.label}</span>
              <p className="template-preview">{template.text.substring(0, 80)}...</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageTemplates;

