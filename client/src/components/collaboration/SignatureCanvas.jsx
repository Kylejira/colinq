import { useRef, useState, useEffect } from 'react';
import './SignatureCanvas.css';

const SignatureCanvas = ({ onSign, onCancel, disabled }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up canvas
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    if (disabled) return;
    e.preventDefault();
    
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!hasSignature) return;
    
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    onSign(signatureData);
  };

  return (
    <div className="signature-canvas-container">
      <div className="signature-header">
        <h3>Sign Contract</h3>
        <p>Draw your signature below</p>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className={`signature-canvas ${disabled ? 'disabled' : ''}`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="signature-line">
          <span>Sign above this line</span>
        </div>
      </div>

      <div className="signature-actions">
        <button 
          type="button" 
          className="clear-btn" 
          onClick={clearCanvas}
          disabled={disabled || !hasSignature}
        >
          Clear
        </button>
        <button 
          type="button" 
          className="cancel-btn" 
          onClick={onCancel}
          disabled={disabled}
        >
          Cancel
        </button>
        <button 
          type="button" 
          className="sign-btn" 
          onClick={handleSign}
          disabled={disabled || !hasSignature}
        >
          {disabled ? 'Signing...' : 'Sign Contract'}
        </button>
      </div>

      <p className="legal-note">
        By clicking "Sign Contract", you agree to the terms outlined in this agreement.
        This electronic signature is legally binding.
      </p>
    </div>
  );
};

export default SignatureCanvas;



