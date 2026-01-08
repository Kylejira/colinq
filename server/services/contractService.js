const PDFDocument = require('pdfkit');
const storageService = require('./storageService');

// Contract templates
const CONTRACT_TEMPLATES = {
  joint_video: {
    id: 'joint_video',
    name: 'Joint Video Agreement',
    description: 'Agreement for creating collaborative video content',
    fields: [
      { key: 'video_title', label: 'Video Title', type: 'text', required: true },
      { key: 'video_description', label: 'Video Description', type: 'textarea', required: true },
      { key: 'filming_date', label: 'Filming Date', type: 'date', required: true },
      { key: 'release_date', label: 'Release Date', type: 'date', required: true },
      { key: 'revenue_split', label: 'Revenue Split (%)', type: 'text', required: true, placeholder: '50/50' },
      { key: 'publishing_channel', label: 'Publishing Channel(s)', type: 'text', required: true },
      { key: 'additional_terms', label: 'Additional Terms', type: 'textarea', required: false },
    ],
  },
  guest_appearance: {
    id: 'guest_appearance',
    name: 'Guest Appearance Agreement',
    description: 'Agreement for appearing as a guest on another creator\'s content',
    fields: [
      { key: 'content_type', label: 'Content Type', type: 'select', options: ['Video', 'Podcast', 'Live Stream', 'Other'], required: true },
      { key: 'topic', label: 'Topic/Subject', type: 'text', required: true },
      { key: 'recording_date', label: 'Recording Date', type: 'date', required: true },
      { key: 'duration', label: 'Expected Duration', type: 'text', required: true },
      { key: 'compensation', label: 'Compensation (if any)', type: 'text', required: false },
      { key: 'cross_promotion', label: 'Cross-Promotion Agreement', type: 'textarea', required: false },
      { key: 'additional_terms', label: 'Additional Terms', type: 'textarea', required: false },
    ],
  },
  channel_takeover: {
    id: 'channel_takeover',
    name: 'Channel Takeover Agreement',
    description: 'Agreement for temporary channel access and content creation',
    fields: [
      { key: 'takeover_date', label: 'Takeover Date', type: 'date', required: true },
      { key: 'duration', label: 'Duration', type: 'text', required: true },
      { key: 'content_guidelines', label: 'Content Guidelines', type: 'textarea', required: true },
      { key: 'approval_process', label: 'Approval Process', type: 'textarea', required: true },
      { key: 'access_level', label: 'Access Level', type: 'select', options: ['Full Access', 'Limited Access', 'Supervised'], required: true },
      { key: 'additional_terms', label: 'Additional Terms', type: 'textarea', required: false },
    ],
  },
  general: {
    id: 'general',
    name: 'General Collaboration Agreement',
    description: 'Flexible agreement for various collaboration types',
    fields: [
      { key: 'collaboration_type', label: 'Collaboration Type', type: 'text', required: true },
      { key: 'description', label: 'Description of Collaboration', type: 'textarea', required: true },
      { key: 'start_date', label: 'Start Date', type: 'date', required: true },
      { key: 'end_date', label: 'End Date', type: 'date', required: false },
      { key: 'deliverables', label: 'Deliverables', type: 'textarea', required: true },
      { key: 'responsibilities_party1', label: 'Party 1 Responsibilities', type: 'textarea', required: true },
      { key: 'responsibilities_party2', label: 'Party 2 Responsibilities', type: 'textarea', required: true },
      { key: 'compensation', label: 'Compensation/Revenue Split', type: 'textarea', required: false },
      { key: 'additional_terms', label: 'Additional Terms', type: 'textarea', required: false },
    ],
  },
};

// Get all templates
const getTemplates = () => {
  return Object.values(CONTRACT_TEMPLATES).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }));
};

// Get template by ID
const getTemplate = (templateId) => {
  return CONTRACT_TEMPLATES[templateId] || null;
};

// Generate PDF contract
const generateContractPdf = async (contract, collaboration, users) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const template = CONTRACT_TEMPLATES[contract.template_id] || CONTRACT_TEMPLATES.general;
      const fields = contract.fields || {};
      const [user1, user2] = users;

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
        .text('CREATOR COLLABORATION AGREEMENT', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold')
        .text(template.name, { align: 'center' });
      doc.moveDown(2);

      // Parties
      doc.fontSize(12).font('Helvetica-Bold').text('PARTIES');
      doc.font('Helvetica').fontSize(11);
      doc.text(`Party 1: ${user1.display_name} ("Creator 1")`);
      doc.text(`Party 2: ${user2.display_name} ("Creator 2")`);
      doc.moveDown();

      // Date
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);

      // Agreement Details
      doc.fontSize(12).font('Helvetica-Bold').text('AGREEMENT DETAILS');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(11);

      template.fields.forEach(field => {
        const value = fields[field.key];
        if (value) {
          doc.font('Helvetica-Bold').text(`${field.label}:`, { continued: true });
          doc.font('Helvetica').text(` ${value}`);
          doc.moveDown(0.5);
        }
      });
      doc.moveDown();

      // Standard Terms
      doc.fontSize(12).font('Helvetica-Bold').text('STANDARD TERMS');
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(10);

      const standardTerms = [
        '1. Both parties agree to act in good faith and communicate openly throughout the collaboration.',
        '2. All content created under this agreement remains the intellectual property of the respective creators unless otherwise specified.',
        '3. Neither party shall disclose confidential information shared during the collaboration.',
        '4. This agreement may be terminated by mutual consent or with 7 days written notice.',
        '5. Any disputes shall be resolved through good-faith negotiation.',
        '6. This agreement constitutes the entire understanding between the parties.',
      ];

      standardTerms.forEach(term => {
        doc.text(term);
        doc.moveDown(0.5);
      });
      doc.moveDown();

      // Signatures Section
      doc.fontSize(12).font('Helvetica-Bold').text('SIGNATURES');
      doc.moveDown();

      // Creator 1 Signature
      doc.fontSize(11).font('Helvetica');
      doc.text(`${user1.display_name}`);
      doc.text('_'.repeat(40));
      
      const sig1 = contract.signatures?.find(s => s.user_id === user1.id);
      if (sig1?.signed_at) {
        doc.text(`Signed: ${new Date(sig1.signed_at).toLocaleString()}`);
      } else {
        doc.text('Signature: _______________');
        doc.text('Date: _______________');
      }
      doc.moveDown();

      // Creator 2 Signature
      doc.text(`${user2.display_name}`);
      doc.text('_'.repeat(40));
      
      const sig2 = contract.signatures?.find(s => s.user_id === user2.id);
      if (sig2?.signed_at) {
        doc.text(`Signed: ${new Date(sig2.signed_at).toLocaleString()}`);
      } else {
        doc.text('Signature: _______________');
        doc.text('Date: _______________');
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('gray')
        .text('Generated by Colinq', { align: 'center' });
      doc.text(`Contract ID: ${contract.id}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Upload contract PDF to storage
const uploadContractPdf = async (contractId, pdfBuffer) => {
  const key = `contracts/${contractId}.pdf`;
  const url = await storageService.uploadFile(key, pdfBuffer, 'application/pdf');
  return url;
};

module.exports = {
  CONTRACT_TEMPLATES,
  getTemplates,
  getTemplate,
  generateContractPdf,
  uploadContractPdf,
};

