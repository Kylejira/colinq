import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DemoUserButton from '../components/auth/DemoUserButton';
import { useAuthContext } from '../context/AuthContext';
import { collaborationsApi } from '../services/api';
import ContractGenerator from '../components/collaboration/ContractGenerator';
import ContractPreview from '../components/collaboration/ContractPreview';
import SignatureCanvas from '../components/collaboration/SignatureCanvas';
import CollaborationChecklist from '../components/collaboration/CollaborationChecklist';
import './CollaborationPage.css';

const CollaborationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuthContext();
  
  const [collaboration, setCollaboration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showContractGenerator, setShowContractGenerator] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadCollaboration = async () => {
    try {
      const data = await collaborationsApi.getCollaboration(id, getToken);
      setCollaboration(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaboration();
  }, [id, getToken]);

  const handleContractCreated = () => {
    setShowContractGenerator(false);
    loadCollaboration();
  };

  const handleSign = async (signatureData) => {
    setSigning(true);
    try {
      await collaborationsApi.signContract(id, signatureData, getToken);
      setShowSignature(false);
      loadCollaboration();
    } catch (err) {
      setError(err.message);
    } finally {
      setSigning(false);
    }
  };

  const handleChecklistUpdate = async (checklist) => {
    try {
      await collaborationsApi.updateChecklist(id, checklist, getToken);
      setCollaboration(prev => ({ ...prev, checklist }));
    } catch (err) {
      console.error('Update checklist error:', err);
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await collaborationsApi.updateStatus(id, status, getToken);
      setCollaboration(prev => ({ ...prev, status }));
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'proposed': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="collaboration-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error && !collaboration) {
    return (
      <div className="collaboration-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate('/matches')}>Back to Matches</button>
        </div>
      </div>
    );
  }

  const partner = collaboration?.users?.find(u => u.id !== user?.id);
  const hasContract = collaboration?.contract?.id;

  return (
    <div className="collaboration-page">
      <header className="collab-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="collab-title">
          <h1>{collaboration?.title}</h1>
          <span 
            className="status-badge"
            style={{ background: getStatusColor(collaboration?.status) }}
          >
            {collaboration?.status?.replace('_', ' ')}
          </span>
        </div>
        <DemoUserButton afterSignOutUrl="/" />
      </header>

      <div className="collab-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'contract' ? 'active' : ''}
          onClick={() => setActiveTab('contract')}
        >
          Contract
        </button>
        <button 
          className={activeTab === 'checklist' ? 'active' : ''}
          onClick={() => setActiveTab('checklist')}
        >
          Checklist
        </button>
      </div>

      <main className="collab-main">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="partner-card">
              <h3>Collaborating With</h3>
              <div className="partner-info">
                {partner?.profile_photo_url ? (
                  <img src={partner.profile_photo_url} alt={partner.display_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {partner?.display_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="partner-name">{partner?.display_name}</p>
                  {partner?.verification_status === 'verified' && (
                    <span className="verified">✓ Verified</span>
                  )}
                </div>
                <Link to={`/messages/${collaboration?.match_id}`} className="message-link">
                  Message →
                </Link>
              </div>
            </div>

            <div className="details-card">
              <h3>Collaboration Details</h3>
              {collaboration?.collaboration_type && (
                <p><strong>Type:</strong> {collaboration.collaboration_type}</p>
              )}
              {collaboration?.description && (
                <p><strong>Description:</strong> {collaboration.description}</p>
              )}
              <p><strong>Created:</strong> {new Date(collaboration?.created_at).toLocaleDateString()}</p>
            </div>

            <div className="status-card">
              <h3>Update Status</h3>
              <div className="status-buttons">
                {['proposed', 'in_progress', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    className={collaboration?.status === status ? 'active' : ''}
                    onClick={() => handleStatusUpdate(status)}
                    style={{ 
                      borderColor: collaboration?.status === status ? getStatusColor(status) : undefined,
                      color: collaboration?.status === status ? getStatusColor(status) : undefined,
                    }}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contract' && (
          <div className="contract-tab">
            {showContractGenerator ? (
              <ContractGenerator
                collaborationId={id}
                onContractCreated={handleContractCreated}
                onCancel={() => setShowContractGenerator(false)}
              />
            ) : showSignature ? (
              <SignatureCanvas
                onSign={handleSign}
                onCancel={() => setShowSignature(false)}
                disabled={signing}
              />
            ) : hasContract ? (
              <ContractPreview
                contract={collaboration.contract}
                users={collaboration.users}
                currentUserId={user?.id}
                onSign={() => setShowSignature(true)}
                onEdit={() => setShowContractGenerator(true)}
              />
            ) : (
              <div className="no-contract">
                <div className="no-contract-icon">📄</div>
                <h3>No Contract Yet</h3>
                <p>Create a contract to formalize your collaboration agreement.</p>
                <button onClick={() => setShowContractGenerator(true)}>
                  Create Contract
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="checklist-tab">
            <CollaborationChecklist
              checklist={collaboration?.checklist || []}
              onUpdate={handleChecklistUpdate}
              disabled={collaboration?.status === 'completed' || collaboration?.status === 'cancelled'}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default CollaborationPage;

