import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { collaborationsApi } from '../../services/api';
import './ContractGenerator.css';

const ContractGenerator = ({ collaborationId, onContractCreated, onCancel }) => {
  const { getToken } = useAuthContext();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateFields, setTemplateFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select'); // select, fill

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await collaborationsApi.getTemplates(getToken);
        setTemplates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [getToken]);

  const handleSelectTemplate = async (templateId) => {
    setLoading(true);
    try {
      const template = await collaborationsApi.getTemplate(templateId, getToken);
      setSelectedTemplate(template);
      setTemplateFields(template.fields);
      
      // Initialize form data
      const initialData = {};
      template.fields.forEach(field => {
        initialData[field.key] = '';
      });
      setFormData(initialData);
      
      setStep('fill');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = templateFields
      .filter(f => f.required && !formData[f.key])
      .map(f => f.label);
    
    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await collaborationsApi.createContract(collaborationId, {
        templateId: selectedTemplate.id,
        fields: formData,
      }, getToken);
      
      onContractCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="contract-generator loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="contract-generator">
      <div className="generator-header">
        <h2>{step === 'select' ? 'Choose a Contract Template' : selectedTemplate?.name}</h2>
        {step === 'fill' && (
          <button className="back-btn" onClick={() => setStep('select')}>
            ← Back to Templates
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {step === 'select' ? (
        <div className="templates-grid">
          {templates.map(template => (
            <button
              key={template.id}
              className="template-card"
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div className="template-icon">📄</div>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <form className="contract-form" onSubmit={handleSubmit}>
          <p className="form-description">{selectedTemplate?.description}</p>

          {templateFields.map(field => (
            <div key={field.key} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContractGenerator;

