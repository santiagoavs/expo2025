// Enhanced Design Editor Modal - Integrates Advanced Editor with Existing Modal
import React, { useState, useCallback } from 'react';
import AdvancedDesignEditor from './advanced/AdvancedDesignEditor';
import './EnhancedDesignEditorModal.css';

const EnhancedDesignEditorModal = ({ 
  isOpen, 
  onClose, 
  design, 
  onSave, 
  product,
  onDesignUpdate 
}) => {
  console.log('EnhancedDesignEditorModal props:', { design, product });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  // Enhanced save handler that works with the advanced editor
  const handleAdvancedSave = useCallback(async (designData) => {
    try {
      setSaving(true);
      setSaveStatus('saving');
      
      console.log('💾 EnhancedDesignEditorModal - Saving design data:', designData);
      console.log('💾 Original design:', design);
      console.log('💾 Product:', product);
      
      // ✅ DEBUGGING: Check design ID structure
      console.log('🔍 [EnhancedDesignEditorModal] Design ID debugging:', {
        'design?._id': design?._id,
        'design?.design?._id': design?.design?._id,
        'design?.id': design?.id,
        'design?.design?.id': design?.design?.id,
        isUpdate: !!(design?._id || design?.design?._id || design?.id || design?.design?.id)
      });
      
      // ✅ CRITICAL FIX: Preserve ALL fields from AdvancedDesignEditor like private admin
      const updatedDesign = {
        ...design,
        // ✅ CRITICAL: Pass through ALL designData fields from AdvancedDesignEditor
        ...designData, // This includes productId, elements, canvasConfig, metadata, and name
        // ✅ FIX: Preserve name from designData first, then fallback to existing design name
        name: designData.name || design?.name || design?.design?.name || 'Diseño sin nombre',
        lastModified: new Date().toISOString(),
        // ✅ CRITICAL: Preserve design ID for updates (check multiple possible locations)
        _id: design?._id || design?.design?._id,
        id: design?.id || design?.design?.id,
        // Preserve existing design properties (but don't override designData)
        productId: designData.productId || design?.productId || design?.design?.productId || product?._id || product?.id,
        userId: design?.userId || design?.design?.userId,
        status: design?.status || design?.design?.status || 'draft'
      };
      
      console.log('💾 Final design data to save:', updatedDesign);
      
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

  // Parse existing elements for the advanced editor - check multiple possible locations
  const designData = design?.design || design;
  const initialElements = designData?.elements || designData?.designElements || designData?.canvasElements || [];
  const initialProductColor = designData?.productColorFilter || designData?.productColor || '#ffffff';
  const initialDesignName = designData?.name || design?.name || '';
  
  // Extract product from design data if not provided directly
  const productData = product || designData?.product || design?.product;
  
  console.log('=== DESIGN DATA DEBUGGING ===');
  console.log('Full design object:', design);
  console.log('Design data extracted:', designData);
  console.log('Initial elements found:', initialElements);
  console.log('Elements length:', initialElements?.length);
  console.log('Initial product color:', initialProductColor);
  console.log('Product data:', productData);
  console.log('=== END DEBUG ===');

  return (
    <AdvancedDesignEditor
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleAdvancedSave}
      product={productData}
      initialElements={initialElements}
      initialProductColor={initialProductColor}
      initialDesignName={initialDesignName}
    />
  );
};

export default EnhancedDesignEditorModal;
