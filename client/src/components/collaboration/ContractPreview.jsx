import './ContractPreview.css';

const ContractPreview = ({ contract, users, currentUserId, onSign, onEdit }) => {
  const template = contract?.template_id;
  const fields = contract?.fields || {};
  const signatures = contract?.signatures || [];
  
  const currentUserSigned = signatures.some(s => s.user_id === currentUserId);
  const allSigned = contract?.status === 'signed';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = () => {
    switch (contract?.status) {
      case 'draft':
        return <span className="status-badge draft">Draft</span>;
      case 'pending_signatures':
        return <span className="status-badge pending">Awaiting Signatures</span>;
      case 'signed':
        return <span className="status-badge signed">Fully Signed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="contract-preview">
      <div className="preview-header">
        <h2>Contract Preview</h2>
        {getStatusBadge()}
      </div>

      <div className="contract-document">
        <div className="document-header">
          <h3>CREATOR COLLABORATION AGREEMENT</h3>
          <p className="template-name">{getTemplateName(template)}</p>
        </div>

        <div className="parties-section">
          <h4>Parties</h4>
          {users?.map((user, index) => (
            <p key={user.id}>
              Party {index + 1}: <strong>{user.display_name}</strong>
            </p>
          ))}
        </div>

        <div className="fields-section">
          <h4>Agreement Details</h4>
          {Object.entries(fields).map(([key, value]) => (
            value && (
              <div key={key} className="field-item">
                <span className="field-label">{formatFieldLabel(key)}:</span>
                <span className="field-value">{value}</span>
              </div>
            )
          ))}
        </div>

        <div className="terms-section">
          <h4>Standard Terms</h4>
          <ol>
            <li>Both parties agree to act in good faith and communicate openly throughout the collaboration.</li>
            <li>All content created under this agreement remains the intellectual property of the respective creators unless otherwise specified.</li>
            <li>Neither party shall disclose confidential information shared during the collaboration.</li>
            <li>This agreement may be terminated by mutual consent or with 7 days written notice.</li>
            <li>Any disputes shall be resolved through good-faith negotiation.</li>
          </ol>
        </div>

        <div className="signatures-section">
          <h4>Signatures</h4>
          <div className="signatures-grid">
            {users?.map(user => {
              const sig = signatures.find(s => s.user_id === user.id);
              return (
                <div key={user.id} className={`signature-box ${sig ? 'signed' : ''}`}>
                  <p className="signer-name">{user.display_name}</p>
                  {sig ? (
                    <>
                      <div className="signature-mark">✓ Signed</div>
                      <p className="signed-date">{formatDate(sig.signed_at)}</p>
                    </>
                  ) : (
                    <div className="signature-pending">Awaiting signature</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="preview-actions">
        {contract?.status === 'draft' && (
          <button className="edit-btn" onClick={onEdit}>
            Edit Contract
          </button>
        )}
        
        {contract?.pdf_url && (
          <a 
            href={contract.pdf_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="download-btn"
          >
            Download PDF
          </a>
        )}

        {!allSigned && !currentUserSigned && contract?.status !== 'draft' && (
          <button className="sign-btn" onClick={onSign}>
            Sign Contract
          </button>
        )}

        {!allSigned && currentUserSigned && (
          <p className="waiting-message">
            ✓ You've signed. Waiting for the other party.
          </p>
        )}

        {contract?.status === 'draft' && (
          <button className="send-btn" onClick={onSign}>
            Send for Signatures
          </button>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getTemplateName = (templateId) => {
  const names = {
    joint_video: 'Joint Video Agreement',
    guest_appearance: 'Guest Appearance Agreement',
    channel_takeover: 'Channel Takeover Agreement',
    general: 'General Collaboration Agreement',
  };
  return names[templateId] || 'Collaboration Agreement';
};

const formatFieldLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

export default ContractPreview;

