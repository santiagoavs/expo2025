import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { 
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  styled
} from '@mui/material';
import {
  X as CloseIcon,
  Plus as AddIcon,
  Trash as DeleteIcon,
  Image as ImageIcon,
  Eye as VisibilityIcon,
  FloppyDisk as SaveIcon,
  Pencil as EditIcon,
  Tag as TagIcon,
  Package as PackageIcon,
  Upload as UploadIcon,
  Warning
} from '@phosphor-icons/react';
import KonvaAreaEditor from '../KonvaAreaEditor/KonvaAreaEditor';
import useCategories from '../../hooks/useCategories'; // ✅ IMPORTAR HOOK DE CATEGORÍAS

// Configuración global de SweetAlert2
Swal.mixin({
  customClass: {
    container: 'swal-overlay-custom',
    popup: 'swal-modal-custom'
  },
  didOpen: () => {
    const container = document.querySelector('.swal-overlay-custom');
    if (container) {
      container.style.zIndex = '1400';
    }
  }
});

// ================ ESTILOS (mantener los mismos) ================
const ModalOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1300,
});

const ModalContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
  width: '95%',
  maxWidth: '800px',
  maxHeight: '95vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxHeight: '100vh',
    borderRadius: 0,
  }
}));

const ModalHeader = styled(Box)({
  padding: '20px 24px',
  borderBottom: '2px solid rgba(4, 13, 191, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ModalTabs = styled(Box)({
  display: 'flex',
  borderBottom: '2px solid rgba(4, 13, 191, 0.1)',
  backgroundColor: '#f8fafc',
  overflowX: 'auto',
});

const TabButton = styled(Button)(({ theme }) => ({
  padding: '14px 20px',
  borderRadius: 0,
  fontWeight: 600,
  color: '#64748b',
  backgroundColor: 'transparent',
  minWidth: 'unset',
  whiteSpace: 'nowrap',
  fontSize: '14px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: 'rgba(4, 13, 191, 0.05)',
  },
  '&.active': {
    borderBottom: '2px solid #040DBF',
    fontWeight: 700,
    color: '#010326',
    backgroundColor: '#ffffff',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px',
    fontSize: '13px',
  }
}));

const ModalContent = styled(Box)(({ theme }) => ({
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
    gap: '24px',
  }
}));

const ModalFooter = styled(Box)(({ theme }) => ({
  padding: '16px 24px',
  borderTop: '1px solid rgba(4, 13, 191, 0.1)',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    padding: '12px 16px',
    flexDirection: 'column',
  }
}));

const FormSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  [theme.breakpoints.down('sm')]: {
    gap: '16px',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '16px',
  fontWeight: 700,
  color: '#010326',
  margin: 0,
  paddingBottom: '12px',
  borderBottom: '2px solid rgba(4, 13, 191, 0.1)',
  [theme.breakpoints.down('sm')]: {
    fontSize: '15px',
    gap: '8px',
  }
}));

const FormField = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

const FormLabel = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
  marginBottom: '4px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '12px',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      border: '2px solid #e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#040DBF',
      boxShadow: '0 0 0 4px rgba(4, 13, 191, 0.1)',
    },
    '&.Mui-error fieldset': {
      borderColor: '#dc2626',
    },
    '&.Mui-error.Mui-focused fieldset': {
      borderColor: '#dc2626',
      boxShadow: '0 0 0 4px rgba(220, 38, 38, 0.15)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#010326',
    [theme.breakpoints.down('sm')]: {
      padding: '10px 14px',
      fontSize: '13px',
    }
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '& fieldset': {
      border: '2px solid #e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#040DBF',
      boxShadow: '0 0 0 4px rgba(4, 13, 191, 0.1)',
    },
  },
  '& .MuiSelect-select': {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#010326',
    [theme.breakpoints.down('sm')]: {
      padding: '10px 14px',
      fontSize: '13px',
    }
  },
}));

const ErrorText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#dc2626',
  fontWeight: 500,
  [theme.breakpoints.down('sm')]: {
    fontSize: '11px',
  }
}));

const ImageUploadContainer = styled(Box)(({ theme }) => ({
  border: '2px dashed #e2e8f0',
  borderRadius: '12px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#040DBF',
    backgroundColor: 'rgba(4, 13, 191, 0.05)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '24px 16px',
  }
}));

const ImagePreview = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: '12px',
  objectFit: 'contain',
  marginBottom: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    maxHeight: '150px',
  }
}));

const AdditionalImagesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '12px',
  marginTop: '12px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  }
}));

const AdditionalImagePreview = styled(Box)({
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  aspectRatio: '1 / 1',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
});

const RemoveImageButton = styled(IconButton)({
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: '#dc2626',
  color: '#ffffff',
  padding: '4px',
  '&:hover': {
    backgroundColor: '#b91c1c',
  },
});

const CustomizationAreaCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(248, 250, 252, 0.6)',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#040DBF',
    boxShadow: '0 2px 8px rgba(4, 13, 191, 0.15)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px',
  }
}));

const AreaHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
});

const AreaNumber = styled(Typography)({
  backgroundColor: 'rgba(4, 13, 191, 0.1)',
  color: '#040DBF',
  padding: '4px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
});

const DimensionsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '12px',
  marginBottom: '12px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr 1fr',
  }
}));

const ProductOptionCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(248, 250, 252, 0.6)',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: '#040DBF',
    boxShadow: '0 2px 8px rgba(4, 13, 191, 0.15)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px',
  }
}));

const OptionValueItem = styled(Box)(({ theme }) => ({
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '12px',
  marginBottom: '12px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '12px',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  }
}));

const TagsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '8px',
});

const TagItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(4, 13, 191, 0.1)',
  color: '#040DBF',
  padding: '4px 8px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 600,
  border: '1px solid rgba(4, 13, 191, 0.2)',
});

const EmptyState = styled(Box)(({ theme }) => ({
  padding: '24px',
  textAlign: 'center',
  border: '2px dashed #e2e8f0',
  borderRadius: '12px',
  color: '#64748b',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  color: '#ffffff',
  borderRadius: '12px',
  padding: '14px 32px',
  fontWeight: 600,
  fontSize: '14px',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(4, 13, 191, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
    boxShadow: '0 6px 20px rgba(4, 13, 191, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    opacity: 0.6,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    width: '100%',
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ffffff',
  color: '#64748b',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  padding: '14px 32px',
  fontWeight: 600,
  fontSize: '14px',
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(4, 13, 191, 0.08)',
  '&:hover': {
    backgroundColor: '#f8fafc',
    color: '#334155',
    borderColor: '#cbd5e1',
    boxShadow: '0 4px 12px rgba(4, 13, 191, 0.12)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '12px 24px',
    width: '100%',
  }
}));

const Spinner = styled(Box)({
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTopColor: '#ffffff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginRight: '8px',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

// ================ COMPONENTE PRINCIPAL ================
const CreateProductModal = ({ 
  isOpen, 
  onClose, 
  onCreateProduct,
  editMode = false,
  productToEdit = null 
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ USAR HOOK DE CATEGORÍAS REAL
  const { categories, loading: loadingCategories, error: categoriesError } = useCategories();

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    productionTime: '3',
    categoryId: '',
    isActive: true,
    featured: false,
    searchTags: []
  });

  // Estados de imágenes
  const [mainImage, setMainImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalPreviews, setAdditionalPreviews] = useState([]);

  // Estados de áreas
  const [customizationAreas, setCustomizationAreas] = useState([]);
  const [showKonvaEditor, setShowKonvaEditor] = useState(false);
  const [currentImageForEditor, setCurrentImageForEditor] = useState(null);

  // Estados de opciones
  const [productOptions, setProductOptions] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Referencias
  const mainImageInputRef = useRef(null);
  const additionalImagesInputRef = useRef(null);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (isOpen) {
      if (editMode && productToEdit) {
        loadProductData(productToEdit);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editMode, productToEdit]);

  // ✅ MOSTRAR ERROR DE CATEGORÍAS
  useEffect(() => {
    if (categoriesError) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las categorías',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
      });
    }
  }, [categoriesError]);

  // ==================== FUNCIONES ====================
  const loadProductData = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      basePrice: product.basePrice?.toString() || '',
      productionTime: product.productionTime?.toString() || '3',
      categoryId: product.category?._id || product.categoryId || '',
      isActive: product.isActive !== false,
      featured: product.featured || false,
      searchTags: product.searchTags || []
    });

    if (product.images?.main) {
      setImagePreview(product.images.main);
      setCurrentImageForEditor(product.images.main);
    }

    setCustomizationAreas(product.customizationAreas || getDefaultAreas());
    setProductOptions(product.options || []);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      productionTime: '3',
      categoryId: '',
      isActive: true,
      featured: false,
      searchTags: []
    });
    setMainImage(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setAdditionalPreviews([]);
    setCustomizationAreas(getDefaultAreas());
    setProductOptions([]);
    setTagInput('');
    setErrors({});
    setActiveTab('basic');
  };

  const getDefaultAreas = () => [
    {
      name: 'Área Principal',
      displayName: 'Área Principal',
      position: { x: 50, y: 50, width: 200, height: 200, rotationDegree: 0 },
      accepts: { text: true, image: true },
      maxElements: 5,
      konvaConfig: {
        strokeColor: '#1F64BF',
        strokeWidth: 2,
        fillOpacity: 0.1,
        cornerRadius: 0,
        dash: [5, 5]
      }
    }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ==================== MANEJADORES DE IMÁGENES ====================
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, mainImage: validation.error }));
      return;
    }

    setMainImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setCurrentImageForEditor(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setErrors(prev => ({ ...prev, additionalImages: 'Máximo 5 imágenes' }));
      return;
    }

    setAdditionalImages(files);
    const previews = [];
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = e.target.result;
        if (previews.length === files.length) {
          setAdditionalPreviews([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file.size > maxSize) return { isValid: false, error: 'Máximo 5MB' };
    if (!allowedTypes.includes(file.type)) return { isValid: false, error: 'Solo JPG/PNG/WEBP' };
    return { isValid: true };
  };

  const removeMainImage = () => {
    setMainImage(null);
    setImagePreview(null);
    if (mainImageInputRef.current) mainImageInputRef.current.value = '';
  };

  const removeAdditionalImage = (index) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    setAdditionalPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ==================== MANEJADORES DE ÁREAS ====================
  const handleAreaChange = (index, field, value) => {
    setCustomizationAreas(prev => prev.map((area, i) => 
      i === index ? { ...area, [field]: value } : area
    ));
  };

  const addCustomizationArea = () => {
    setCustomizationAreas(prev => [
      ...prev,
      {
        name: `Área ${prev.length + 1}`,
        displayName: `Área ${prev.length + 1}`,
        position: { x: 50, y: 50, width: 150, height: 150, rotationDegree: 0 },
        accepts: { text: true, image: true },
        maxElements: 5,
        konvaConfig: {
          strokeColor: '#1F64BF',
          strokeWidth: 2,
          fillOpacity: 0.1,
          cornerRadius: 0,
          dash: [5, 5]
        }
      }
    ]);
  };

  const removeCustomizationArea = async (index) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar área?',
      text: 'No podrás revertir esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1F64BF',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    });

    if (isConfirmed) {
      setCustomizationAreas(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openKonvaEditor = () => {
    if (!imagePreview) {
      Swal.fire({
        title: 'Imagen requerida',
        text: 'Sube una imagen principal primero',
        icon: 'warning',
        confirmButtonColor: '#1F64BF',
      });
      return;
    }
    setShowKonvaEditor(true);
  };

  // ==================== MANEJADORES DE OPCIONES ====================
  const addProductOption = () => {
    setProductOptions(prev => [
      ...prev,
      {
        name: 'Nueva Opción',
        label: 'Nueva Opción',
        type: 'dropdown',
        required: false,
        values: [{ label: 'Opción 1', value: 'option1', additionalPrice: 0, inStock: true }]
      }
    ]);
  };

  const removeProductOption = async (index) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar opción?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1F64BF',
      cancelButtonColor: '#d33',
    });

    if (isConfirmed) {
      setProductOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (optionIndex, field, value) => {
    setProductOptions(prev => prev.map((option, i) => 
      i === optionIndex ? { ...option, [field]: value } : option
    ));
  };

  const handleOptionValueChange = (optionIndex, valueIndex, field, value) => {
    setProductOptions(prev => prev.map((option, i) => {
      if (i === optionIndex) {
        const newValues = [...option.values];
        newValues[valueIndex] = { ...newValues[valueIndex], [field]: value };
        return { ...option, values: newValues };
      }
      return option;
    }));
  };

  const addOptionValue = (optionIndex) => {
    setProductOptions(prev => prev.map((option, i) => 
      i === optionIndex ? {
        ...option,
        values: [
          ...option.values,
          {
            label: `Opción ${option.values.length + 1}`,
            value: `option${option.values.length + 1}`,
            additionalPrice: 0,
            inStock: true
          }
        ]
      } : option
    ));
  };

  const removeOptionValue = (optionIndex, valueIndex) => {
    setProductOptions(prev => prev.map((option, i) => 
      i === optionIndex ? {
        ...option,
        values: option.values.filter((_, j) => j !== valueIndex)
      } : option
    ));
  };

  // ==================== MANEJADORES DE TAGS ====================
  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.searchTags.includes(tag) && formData.searchTags.length < 10) {
      setFormData(prev => ({
        ...prev,
        searchTags: [...prev.searchTags, tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      searchTags: prev.searchTags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ==================== VALIDACIÓN Y ENVÍO ====================
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.basePrice || isNaN(formData.basePrice) || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Precio inválido';
    }
    if (!formData.categoryId) newErrors.categoryId = 'Selecciona categoría';
    if (!imagePreview && !editMode) newErrors.mainImage = 'Imagen principal requerida';
    if (customizationAreas.length === 0) newErrors.areas = 'Debe tener al menos un área';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      await Swal.fire({
        title: 'Error',
        text: 'Completa los campos requeridos',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        productionTime: parseInt(formData.productionTime),
        customizationAreas,
        options: productOptions,
        mainImage,
        additionalImages,
        searchTags: formData.searchTags
      };

      await onCreateProduct(productData, editMode ? 'edit' : 'create');
      
      await Swal.fire({
        title: '¡Éxito!',
        text: editMode ? 'Producto actualizado' : 'Producto creado',
        icon: 'success',
        confirmButtonColor: '#1F64BF',
      });

      resetForm();
      onClose();
    } catch (error) {
      await Swal.fire({
        title: 'Error',
        text: error.message || 'Error al procesar',
        icon: 'error',
        confirmButtonColor: '#1F64BF',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewProduct = () => {
    Swal.fire({
      title: 'Vista Previa',
      html: `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${formData.name}</p>
          <p><strong>Precio:</strong> ${formData.basePrice || '0'}</p>
          <p><strong>Categoría:</strong> ${categories.find(c => c._id === formData.categoryId)?.name || 'Ninguna'}</p>
        </div>
      `,
      imageUrl: imagePreview,
      imageWidth: 300,
      confirmButtonColor: '#1F64BF',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContainer onClick={e => e.stopPropagation()}>
          {/* Header */}
          <ModalHeader>
            <Box display="flex" alignItems="center" gap={1}>
              <PackageIcon size={20} weight="duotone" />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#010326' }}>
                {editMode ? 'Editar Producto' : 'Nuevo Producto'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <SecondaryButton
                startIcon={<VisibilityIcon size={16} weight="duotone" />}
                onClick={previewProduct}
              >
                Vista Previa
              </SecondaryButton>
              <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
                <CloseIcon size={20} />
              </IconButton>
            </Box>
          </ModalHeader>

          {/* Tabs */}
          <ModalTabs>
            <TabButton 
              className={activeTab === 'basic' ? 'active' : ''}
              onClick={() => setActiveTab('basic')}
            >
              Información
            </TabButton>
            <TabButton 
              className={activeTab === 'images' ? 'active' : ''}
              onClick={() => setActiveTab('images')}
            >
              Imágenes
            </TabButton>
            <TabButton 
              className={activeTab === 'areas' ? 'active' : ''}
              onClick={() => setActiveTab('areas')}
            >
              Áreas
            </TabButton>
            <TabButton 
              className={activeTab === 'options' ? 'active' : ''}
              onClick={() => setActiveTab('options')}
            >
              Opciones
            </TabButton>
          </ModalTabs>

          {/* Contenido */}
          <ModalContent>
            <form onSubmit={handleSubmit}>
              {/* TAB: INFORMACIÓN BÁSICA */}
              {activeTab === 'basic' && (
                <FormSection>
                  <SectionTitle>
                    <PackageIcon size={18} weight="duotone" />
                    Información General
                  </SectionTitle>
                  
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: '16px',
                    width: '100%'
                  }}>
                    <FormField>
                      <FormLabel>
                        <PackageIcon size={14} weight="duotone" />
                        Nombre del Producto *
                      </FormLabel>
                      <StyledTextField
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={!!errors.name}
                        placeholder="Nombre del producto"
                      />
                      {errors.name && (
                        <ErrorText>
                          <Warning size={12} weight="duotone" />
                          {errors.name}
                        </ErrorText>
                      )}
                    </FormField>
                    
                    <FormField>
                      <FormLabel>
                        <TagIcon size={14} weight="duotone" />
                        Precio Base (USD) *
                      </FormLabel>
                      <StyledTextField
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        error={!!errors.basePrice}
                        placeholder="0.00"
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                      {errors.basePrice && (
                        <ErrorText>
                          <Warning size={12} weight="duotone" />
                          {errors.basePrice}
                        </ErrorText>
                      )}
                    </FormField>
                    
                    <FormField>
                      <FormLabel>
                        <TagIcon size={14} weight="duotone" />
                        Categoría *
                      </FormLabel>
                      <FormControl fullWidth error={!!errors.categoryId}>
                        <StyledSelect
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          disabled={loadingCategories}
                        >
                          <MenuItem value="">
                            {loadingCategories ? 'Cargando...' : 'Seleccionar...'}
                          </MenuItem>
                          {categories.map(cat => (
                            <MenuItem key={cat._id} value={cat._id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </StyledSelect>
                        {errors.categoryId && (
                          <ErrorText>
                            <Warning size={12} weight="duotone" />
                            {errors.categoryId}
                          </ErrorText>
                        )}
                      </FormControl>
                    </FormField>
                    
                    <FormField>
                      <FormLabel>
                        <TagIcon size={14} weight="duotone" />
                        Tiempo de Producción (días)
                      </FormLabel>
                      <StyledTextField
                        name="productionTime"
                        value={formData.productionTime}
                        onChange={handleInputChange}
                        type="number"
                        inputProps={{ min: 1, max: 30 }}
                      />
                    </FormField>
                    
                    <FormField sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                      <FormLabel>
                        <TagIcon size={14} weight="duotone" />
                        Descripción
                      </FormLabel>
                      <StyledTextField
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        inputProps={{ maxLength: 1000 }}
                        placeholder="Describe el producto..."
                      />
                    </FormField>
                    
                    <FormField sx={{ gridColumn: { xs: '1 / -1', sm: '1 / -1' } }}>
                      <FormLabel>
                        <TagIcon size={14} weight="duotone" />
                        Etiquetas de búsqueda
                      </FormLabel>
                      <StyledTextField
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TagIcon size={16} weight="duotone" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={addTag}
                                disabled={!tagInput.trim() || formData.searchTags.length >= 10}
                                edge="end"
                                size="small"
                              >
                                <AddIcon size={16} weight="duotone" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        helperText={`Máximo 10 etiquetas (${formData.searchTags.length}/10)`}
                      />
                      {formData.searchTags.length > 0 && (
                        <TagsContainer>
                          {formData.searchTags.map((tag, index) => (
                            <TagItem key={index}>
                              {tag}
                              <IconButton
                                size="small"
                                onClick={() => removeTag(tag)}
                                sx={{ padding: '4px', ml: '4px' }}
                              >
                                <CloseIcon size={12} weight="duotone" />
                              </IconButton>
                            </TagItem>
                          ))}
                        </TagsContainer>
                      )}
                    </FormField>
                    
                    <Box sx={{ 
                      gridColumn: { xs: '1 / -1', sm: '1 / -1' },
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: '16px'
                    }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            color="primary"
                          />
                        }
                        label="Producto activo"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="featured"
                            checked={formData.featured}
                            onChange={handleInputChange}
                            color="primary"
                          />
                        }
                        label="Destacado"
                      />
                    </Box>
                  </Box>
                </FormSection>
              )}

              {/* TAB: IMÁGENES */}
              {activeTab === 'images' && (
                <Box>
                  <FormSection>
                    <SectionTitle>
                      <ImageIcon size={18} weight="duotone" />
                      Imagen Principal *
                    </SectionTitle>
                    
                    <Box>
                      {imagePreview ? (
                        <Box>
                          <ImagePreview src={imagePreview} alt="Preview" />
                          <Box display="flex" gap={2} mt={2} sx={{ 
                            flexDirection: { xs: 'column', sm: 'row' },
                            '& > *': { width: { xs: '100%', sm: 'auto' } }
                          }}>
                            <SecondaryButton
                              startIcon={<EditIcon size={16} weight="duotone" />}
                              onClick={() => mainImageInputRef.current?.click()}
                            >
                              Cambiar
                            </SecondaryButton>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon size={16} weight="duotone" />}
                              onClick={removeMainImage}
                              sx={{ borderRadius: '12px' }}
                            >
                              Eliminar
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <ImageUploadContainer onClick={() => mainImageInputRef.current?.click()}>
                          <input
                            ref={mainImageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageChange}
                            style={{ display: 'none' }}
                          />
                          <UploadIcon size={32} weight="duotone" />
                          <Typography variant="body1" mt={1} sx={{ color: '#010326' }}>
                            Arrastra o haz clic para subir
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            PNG, JPG, WEBP (max. 5MB)
                          </Typography>
                        </ImageUploadContainer>
                      )}
                      {errors.mainImage && (
                        <ErrorText>
                          <Warning size={12} weight="duotone" />
                          {errors.mainImage}
                        </ErrorText>
                      )}
                    </Box>
                  </FormSection>

                  <FormSection>
                    <SectionTitle>
                      <ImageIcon size={18} weight="duotone" />
                      Imágenes Adicionales
                    </SectionTitle>
                    
                    <Box>
                      <ImageUploadContainer onClick={() => additionalImagesInputRef.current?.click()}>
                        <input
                          ref={additionalImagesInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                          style={{ display: 'none' }}
                        />
                        <AddIcon size={32} weight="duotone" />
                        <Typography variant="body1" mt={1} sx={{ color: '#010326' }}>
                          Agregar imágenes (max. 5)
                        </Typography>
                      </ImageUploadContainer>
                      
                      {additionalPreviews.length > 0 && (
                        <AdditionalImagesGrid>
                          {additionalPreviews.map((preview, index) => (
                            <AdditionalImagePreview key={index}>
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <RemoveImageButton
                                size="small"
                                onClick={() => removeAdditionalImage(index)}
                              >
                                <CloseIcon size={14} weight="duotone" />
                              </RemoveImageButton>
                            </AdditionalImagePreview>
                          ))}
                        </AdditionalImagesGrid>
                      )}
                    </Box>
                  </FormSection>
                </Box>
              )}

              {/* TAB: ÁREAS DE PERSONALIZACIÓN */}
              {activeTab === 'areas' && (
                <Box>
                  <FormSection>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                      <SectionTitle>
                        <EditIcon size={18} weight="duotone" />
                        Áreas de Personalización
                      </SectionTitle>
                      <Box display="flex" gap={1} width={{ xs: '100%', sm: 'auto' }}>
                        <SecondaryButton
                          startIcon={<EditIcon size={16} weight="duotone" />}
                          onClick={openKonvaEditor}
                          disabled={!imagePreview}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          Editor Visual
                        </SecondaryButton>
                        <PrimaryButton
                          startIcon={<AddIcon size={16} weight="duotone" />}
                          onClick={addCustomizationArea}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          Nueva Área
                        </PrimaryButton>
                      </Box>
                    </Box>

                    {errors.areas && (
                      <ErrorText>
                        <Warning size={12} weight="duotone" />
                        {errors.areas}
                      </ErrorText>
                    )}

                    {customizationAreas.length === 0 ? (
                      <EmptyState>
                        <Typography>No hay áreas configuradas</Typography>
                      </EmptyState>
                    ) : (
                      customizationAreas.map((area, index) => (
                        <CustomizationAreaCard key={index}>
                          <AreaHeader>
                            <AreaNumber>Área {index + 1}</AreaNumber>
                            {customizationAreas.length > 1 && (
                              <IconButton
                                size="small"
                                onClick={() => removeCustomizationArea(index)}
                                color="error"
                                sx={{ padding: '4px' }}
                              >
                                <DeleteIcon size={16} weight="duotone" />
                              </IconButton>
                            )}
                          </AreaHeader>

                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: '12px'
                          }}>
                            <FormField>
                              <FormLabel>Nombre interno</FormLabel>
                              <StyledTextField
                                value={area.name}
                                onChange={(e) => handleAreaChange(index, 'name', e.target.value)}
                                fullWidth
                              />
                            </FormField>
                            <FormField>
                              <FormLabel>Nombre visible</FormLabel>
                              <StyledTextField
                                value={area.displayName}
                                onChange={(e) => handleAreaChange(index, 'displayName', e.target.value)}
                                fullWidth
                              />
                            </FormField>
                          </Box>

                          <FormLabel sx={{ mt: 2 }}>Dimensiones</FormLabel>
                          <DimensionsGrid>
                            <StyledTextField
                              label="Posición X"
                              value={area.position.x}
                              onChange={(e) => {
                                const newArea = { ...area };
                                newArea.position.x = parseInt(e.target.value) || 0;
                                handleAreaChange(index, 'position', newArea.position);
                              }}
                              type="number"
                            />
                            <StyledTextField
                              label="Posición Y"
                              value={area.position.y}
                              onChange={(e) => {
                                const newArea = { ...area };
                                newArea.position.y = parseInt(e.target.value) || 0;
                                handleAreaChange(index, 'position', newArea.position);
                              }}
                              type="number"
                            />
                            <StyledTextField
                              label="Ancho"
                              value={area.position.width}
                              onChange={(e) => {
                                const newArea = { ...area };
                                newArea.position.width = parseInt(e.target.value) || 0;
                                handleAreaChange(index, 'position', newArea.position);
                              }}
                              type="number"
                            />
                            <StyledTextField
                              label="Alto"
                              value={area.position.height}
                              onChange={(e) => {
                                const newArea = { ...area };
                                newArea.position.height = parseInt(e.target.value) || 0;
                                handleAreaChange(index, 'position', newArea.position);
                              }}
                              type="number"
                            />
                            <StyledTextField
                              label="Rotación"
                              value={area.position.rotationDegree || 0}
                              onChange={(e) => {
                                const newArea = { ...area };
                                newArea.position.rotationDegree = parseInt(e.target.value) || 0;
                                handleAreaChange(index, 'position', newArea.position);
                              }}
                              type="number"
                            />
                            <StyledTextField
                              label="Máx. elementos"
                              value={area.maxElements}
                              onChange={(e) => handleAreaChange(index, 'maxElements', parseInt(e.target.value) || 5)}
                              type="number"
                            />
                          </DimensionsGrid>

                          <FormLabel sx={{ mt: 1 }}>Acepta</FormLabel>
                          <FormGroup row sx={{ gap: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={area.accepts.text}
                                  onChange={(e) => {
                                    const newArea = { ...area };
                                    newArea.accepts.text = e.target.checked;
                                    handleAreaChange(index, 'accepts', newArea.accepts);
                                  }}
                                  color="primary"
                                />
                              }
                              label="Texto"
                            />
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={area.accepts.image}
                                  onChange={(e) => {
                                    const newArea = { ...area };
                                    newArea.accepts.image = e.target.checked;
                                    handleAreaChange(index, 'accepts', newArea.accepts);
                                  }}
                                  color="primary"
                                />
                              }
                              label="Imágenes"
                            />
                          </FormGroup>
                        </CustomizationAreaCard>
                      ))
                    )}
                  </FormSection>
                </Box>
              )}

              {/* TAB: OPCIONES */}
              {activeTab === 'options' && (
                <Box>
                  <FormSection>
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                      <SectionTitle>
                        <TagIcon size={18} weight="duotone" />
                        Opciones del Producto
                      </SectionTitle>
                      <PrimaryButton
                        startIcon={<AddIcon size={16} weight="duotone" />}
                        onClick={addProductOption}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        Nueva Opción
                      </PrimaryButton>
                    </Box>

                    {productOptions.length === 0 ? (
                      <EmptyState>
                        <Typography>No hay opciones configuradas</Typography>
                      </EmptyState>
                    ) : (
                      productOptions.map((option, optionIndex) => (
                        <ProductOptionCard key={optionIndex}>
                          <AreaHeader>
                            <AreaNumber>Opción {optionIndex + 1}</AreaNumber>
                            <IconButton
                              size="small"
                              onClick={() => removeProductOption(optionIndex)}
                              color="error"
                              sx={{ padding: '4px' }}
                            >
                              <DeleteIcon size={16} weight="duotone" />
                            </IconButton>
                          </AreaHeader>

                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: '12px'
                          }}>
                            <FormField>
                              <FormLabel>Nombre interno</FormLabel>
                              <StyledTextField
                                value={option.name}
                                onChange={(e) => handleOptionChange(optionIndex, 'name', e.target.value)}
                                fullWidth
                              />
                            </FormField>
                            <FormField>
                              <FormLabel>Nombre visible</FormLabel>
                              <StyledTextField
                                value={option.label}
                                onChange={(e) => handleOptionChange(optionIndex, 'label', e.target.value)}
                                fullWidth
                              />
                            </FormField>
                            <FormField>
                              <FormLabel>Tipo de opción</FormLabel>
                              <FormControl fullWidth>
                                <StyledSelect
                                  value={option.type}
                                  onChange={(e) => handleOptionChange(optionIndex, 'type', e.target.value)}
                                >
                                  <MenuItem value="dropdown">Lista desplegable</MenuItem>
                                  <MenuItem value="buttons">Botones</MenuItem>
                                  <MenuItem value="color-picker">Selector de color</MenuItem>
                                </StyledSelect>
                              </FormControl>
                            </FormField>
                            <FormField>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={option.required}
                                    onChange={(e) => handleOptionChange(optionIndex, 'required', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label="Requerido"
                                sx={{ mt: 2 }}
                              />
                            </FormField>
                          </Box>

                          <FormLabel sx={{ mt: 2 }}>Valores disponibles</FormLabel>
                          <Box>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<AddIcon size={16} weight="duotone" />}
                              onClick={() => addOptionValue(optionIndex)}
                              sx={{ color: '#040DBF', fontWeight: 600 }}
                            >
                              Agregar valor
                            </Button>
                          </Box>

                          {option.values.map((value, valueIndex) => (
                            <OptionValueItem key={valueIndex}>
                              <StyledTextField
                                label="Nombre"
                                value={value.label}
                                onChange={(e) => handleOptionValueChange(
                                  optionIndex, 
                                  valueIndex, 
                                  'label', 
                                  e.target.value
                                )}
                                fullWidth
                                size="small"
                              />
                              <StyledTextField
                                label="Valor"
                                value={value.value}
                                onChange={(e) => handleOptionValueChange(
                                  optionIndex, 
                                  valueIndex, 
                                  'value', 
                                  e.target.value
                                )}
                                fullWidth
                                size="small"
                              />
                              <StyledTextField
                                label="Precio adicional"
                                value={value.additionalPrice}
                                onChange={(e) => handleOptionValueChange(
                                  optionIndex, 
                                  valueIndex, 
                                  'additionalPrice', 
                                  e.target.value
                                )}
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={value.inStock}
                                    onChange={(e) => handleOptionValueChange(
                                      optionIndex, 
                                      valueIndex, 
                                      'inStock', 
                                      e.target.checked
                                    )}
                                    color="primary"
                                  />
                                }
                                label="En stock"
                              />
                              {option.values.length > 1 && (
                                <Box display="flex" justifyContent="flex-end">
                                  <IconButton
                                    size="small"
                                    onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                    color="error"
                                    sx={{ padding: '4px' }}
                                  >
                                    <DeleteIcon size={16} weight="duotone" />
                                  </IconButton>
                                </Box>
                              )}
                            </OptionValueItem>
                          ))}
                        </ProductOptionCard>
                      ))
                    )}
                  </FormSection>
                </Box>
              )}
            </form>
          </ModalContent>

          {/* Footer */}
          <ModalFooter>
            <SecondaryButton
              onClick={onClose}
              disabled={isSubmitting}
              startIcon={<CloseIcon size={16} weight="duotone" />}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={!isSubmitting && <SaveIcon size={16} weight="duotone" />}
            >
              {isSubmitting ? (
                <>
                  <Spinner />
                  {editMode ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                editMode ? 'Actualizar Producto' : 'Crear Producto'
              )}
            </PrimaryButton>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>

      {/* Editor de áreas de personalización */}
      {showKonvaEditor && (
        <KonvaAreaEditor 
          isOpen={showKonvaEditor}
          productImage={currentImageForEditor}
          initialAreas={customizationAreas}
          onSaveAreas={(updatedAreas) => {
            setCustomizationAreas(updatedAreas);
            setShowKonvaEditor(false);
          }}
          onClose={() => setShowKonvaEditor(false)}
        />
      )}
    </>
  );
};

export default CreateProductModal;