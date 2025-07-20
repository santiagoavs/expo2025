import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useCategories from '../../hooks/useCategories';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import './CategoryForm.css';

const CategoryForm = ({ editingCategory, clearEditing, onSuccess }) => {
  const {
    flatCategories,
    createCategory,
    updateCategory,
    loading,
    error
  } = useCategories();

  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      parent: '',
      description: '',
      isActive: true,
      showOnHomepage: false,
      image: null,
    }
  });

  const parent = watch('parent');
  const imageFile = watch('image');
  const name = watch('name');

  // Función para generar el slug
  const generateSlug = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-");
  };

  // Slug generado en tiempo real
  const generatedSlug = generateSlug(name);
  
  // Resetear formulario
  const resetForm = () => {
    reset({
      name: '',
      parent: '',
      description: '',
      isActive: true,
      showOnHomepage: false,
      image: null,
    });
    setCurrentImage('');
    setImagePreview('');
  };

  // Cargar categoría si es edición
  useEffect(() => {
    if (editingCategory) {
      reset({
        name: editingCategory.name,
        parent: editingCategory.parent?._id || '',
        description: editingCategory.description || '',
        isActive: editingCategory.isActive,
        showOnHomepage: editingCategory.showOnHomepage,
        image: null,
      });
      setCurrentImage(editingCategory.image);
      setImagePreview('');
    } else {
      resetForm();
    }
  }, [editingCategory, reset]);

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    if (!data.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre es obligatorio'
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!editingCategory && (!data.image || data.image.length === 0)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes seleccionar una imagen'
      });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('description', data.description.trim());
    formData.append('parent', data.parent || '');
    formData.append('isActive', data.isActive);
    formData.append('showOnHomepage', data.showOnHomepage);
    if (data.image && data.image.length > 0) formData.append('image', data.image[0]);

    try {
      const result = editingCategory 
        ? await updateCategory(editingCategory._id, formData) 
        : await createCategory(formData);
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: editingCategory ? 'Categoría actualizada' : 'Categoría creada',
        showConfirmButton: false,
        timer: 1500
      });
      
      resetForm();
      if (editingCategory) clearEditing();
      onSuccess();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ha ocurrido un error'
      });
      console.error('Error al guardar categoría:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="CategoryForm-wrapper">
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="CategoryForm-wrapper">
      <div className="error-overlay">
        <p>Error al cargar categorías</p>
      </div>
    </div>
  );

  const parents = flatCategories.filter(cat => 
    !cat.parent && (!editingCategory || cat._id !== editingCategory._id)
  );

  return (
    <motion.div 
      className="CategoryForm-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="CategoryForm-header">
        <h2>{editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h2>
        {editingCategory && (
          <motion.button 
            onClick={() => {
              clearEditing();
              resetForm();
            }} 
            className="CategoryForm-back-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancelar Edición
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="CategoryForm-body">
        <div className="CategoryForm-form">
          <div className="form-group">
            <label>NOMBRE DE CATEGORÍA *</label>
            <input {...register('name')} placeholder="Ej: Camisetas" required />
          </div>
          
          {editingCategory && (
            <div className="form-group">
              <label>SLUG GENERADO</label>
              <div className="slug-preview">
                {editingCategory.slug}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>CATEGORÍA PADRE (opcional)</label>
            <select {...register('parent')}>
              <option value="">Ninguna (principal)</option>
              {parents.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>DESCRIPCIÓN</label>
            <textarea {...register('description')} rows="3" placeholder="Describe la categoría..." />
          </div>
          <div className="CategoryForm-switches">
            <label>
              <input type="checkbox" {...register('isActive')} />
              Categoría activa
            </label>
            <label>
              <input type="checkbox" {...register('showOnHomepage')} />
              Mostrar en página principal
            </label>
          </div>
        </div>

        <div className="CategoryForm-visual">
          <div className="CategoryForm-image-section">
            <div className="CategoryForm-image-preview-box">
              {imagePreview
                ? <img src={imagePreview} alt="preview" />
                : currentImage
                  ? <img src={currentImage} alt="actual" />
                  : <div className="CategoryForm-image-placeholder">Sin imagen</div>}
            </div>
            <label className="CategoryForm-image-upload">
              <input type="file" accept="image/*" {...register('image')} />
              {imagePreview || currentImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </label>
          </div>

          <div className="CategoryForm-preview-section">
            <h3>VISTA PREVIA</h3>
            <p>{parent
              ? `Subcategoría de ${parents.find(c => c._id === parent)?.name || '...'}` 
              : 'Categoría principal'}
            </p>
            <div className="CategoryForm-preview-image-box">
              {imagePreview
                ? <img src={imagePreview} alt="preview" />
                : currentImage
                  ? <img src={currentImage} alt="actual" />
                  : <div className="CategoryForm-image-placeholder">Imagen</div>}
            </div>
            <p>{watch('name') || 'Nombre de categoría'}</p>
            
            <div className="slug-container">
              <p className="slug-label">URL amigable:</p>
              <div className="slug-value">
                {generatedSlug || 'slug-generado'}
              </div>
            </div>
            
            <div className="CategoryForm-actions">
              <motion.button 
                type="submit" 
                className="CategoryForm-save-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="button-loader"></span>
                ) : editingCategory ? 'Guardar Cambios' : 'Guardar Categoría'}
              </motion.button>
              <motion.button 
                type="button" 
                className="CategoryForm-cancel-btn" 
                onClick={resetForm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Limpiar
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default CategoryForm;