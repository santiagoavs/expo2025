// Enhanced Design Editor Modal - Integrates Advanced Editor with Existing Modal
import React, { useState, useCallback } from 'react';
import AdvancedDesignEditor from './advanced/AdvancedDesignEditor';
import './designEditorModal.css';

const EnhancedDesignEditorModal = ({ 
  isOpen, 
  onClose, 
  design, 
  onSave, 
  product,
  onDesignUpdate 
}) => {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Enhanced save handler that works with the advanced editor
  const handleAdvancedSave = useCallback(async (designData) => {
    try {
      setSaving(true);
      setSaveStatus('saving');
      
      const updatedDesign = {
        ...design,
        name: design?.name || 'Diseño sin nombre',
        elements: designData.elements || [],
        productColorFilter: designData.productColorFilter,
        lastModified: new Date().toISOString(),
        // Preserve existing design properties
        productId: design?.productId || product?._id || product?.id,
        userId: design?.userId,
        status: design?.status || 'draft'
      };
      
      await onSave(updatedDesign);
      setSaveStatus('saved');
      
      // Notify parent component of update if provided
      if (onDesignUpdate) {
        onDesignUpdate(updatedDesign);
      }
      
      // Auto-close after successful save
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving design:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [design, product, onSave, onClose, onDesignUpdate]);

  if (!isOpen) return null;

  // Parse existing elements for the advanced editor
  const initialElements = design?.elements || [];
  const initialProductColor = design?.productColorFilter || '#ffffff';

  return (
    <AdvancedDesignEditor
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleAdvancedSave}
      product={product}
      initialElements={initialElements}
      initialProductColor={initialProductColor}
    />
  );
};

export default EnhancedDesignEditorModal;
