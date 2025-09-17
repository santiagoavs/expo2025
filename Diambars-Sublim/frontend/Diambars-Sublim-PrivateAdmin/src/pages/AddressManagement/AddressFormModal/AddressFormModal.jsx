import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  styled,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  X as CloseIcon,
  User as UserIcon,
  MapPin as LocationIcon,
  Phone as PhoneIcon,
  House as HomeIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  ArrowLeft as BackIcon,
  ArrowRight as NextIcon,
  FloppyDisk as SaveIcon,
  MagnifyingGlass as SearchIcon,
  Navigation as CoordinatesIcon
} from '@phosphor-icons/react';

import useAddressValidation from '../../../hooks/useAddressValidation';
import useGeolocation from '../../../hooks/useGeolocation';
import AddressMapPicker from '../AddressMap/AddressMapPicker';

// ================ ESTILOS STYLED COMPONENTS ================
const AddressModalDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '900px',
    width: '95%',
    maxHeight: '90vh',
    background: 'white',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
    fontFamily: "'Mona Sans'",
    [theme.breakpoints.down('md')]: {
      maxWidth: '95%',
      maxHeight: '95vh',
      margin: '16px',
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      maxHeight: '100vh',
      margin: 0,
      borderRadius: 0,
    }
  }
}));

const AddressModalHeader = styled(DialogTitle)(({ theme }) => ({
  padding: '32px 32px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: 'none',
  [theme.breakpoints.down('lg')]: {
    padding: '24px 24px 0',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px 20px 0',
  }
}));

const AddressModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#010326',
  fontFamily: "'Mona Sans'",
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.3rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  }
}));

const AddressModalContent = styled(DialogContent)(({ theme }) => ({
  padding: '32px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha('#1F64BF', 0.05),
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha('#1F64BF', 0.2),
    borderRadius: '10px',
    '&:hover': {
      background: alpha('#1F64BF', 0.3),
    },
  },
  [theme.breakpoints.down('lg')]: {
    padding: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '20px',
  }
}));

const AddressModalActions = styled(DialogActions)(({ theme }) => ({
  padding: '24px 32px 32px',
  gap: '12px',
  borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
  [theme.breakpoints.down('lg')]: {
    padding: '20px 24px 24px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px 20px 20px',
    flexDirection: 'column',
    gap: '8px',
  }
}));

const AddressStepperContainer = styled(Box)(({ theme }) => ({
  marginBottom: '32px',
  [theme.breakpoints.down('md')]: {
    marginBottom: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '20px',
  }
}));

const AddressCustomStepper = styled(Stepper)(({ theme }) => ({
  '& .MuiStepLabel-root': {
    fontFamily: "'Mona Sans'",
  },
  '& .MuiStepIcon-root': {
    color: alpha('#1F64BF', 0.2),
    '&.Mui-active': {
      color: '#1F64BF',
    },
    '&.Mui-completed': {
      color: '#10B981',
    },
  },
  '& .MuiStepLabel-label': {
    fontSize: '0.9rem',
    fontWeight: 500,
    '&.Mui-active': {
      fontWeight: 600,
      color: '#1F64BF',
    },
    '&.Mui-completed': {
      color: '#10B981',
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiStepLabel-label': {
      fontSize: '0.8rem',
    },
  }
}));

const AddressFormSection = styled(Paper)(({ theme }) => ({
  padding: '24px',
  marginBottom: '24px',
  borderRadius: '12px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  background: 'white',
  [theme.breakpoints.down('md')]: {
    padding: '20px',
    marginBottom: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
    marginBottom: '16px',
  }
}));

const AddressSectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#010326',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
    marginBottom: '12px',
  }
}));

const AddressFormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
  }
}));

const AddressStyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: "'Mona Sans'",
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: alpha('#1F64BF', 0.2),
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: alpha('#1F64BF', 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1F64BF',
      borderWidth: '2px',
      boxShadow: `0 0 0 4px ${alpha('#1F64BF', 0.1)}`,
    },
    '&.Mui-error fieldset': {
      borderColor: '#EF4444',
      borderWidth: '2px',
    },
    '&.Mui-error.Mui-focused fieldset': {
      boxShadow: `0 0 0 4px ${alpha('#EF4444', 0.1)}`,
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Mona Sans'",
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1F64BF',
    },
    '&.Mui-error': {
      color: '#EF4444',
    },
  },
  '& .MuiInputBase-input': {
    fontFamily: "'Mona Sans'",
    fontSize: '0.9rem',
  },
  '& .MuiFormHelperText-root': {
    fontFamily: "'Mona Sans'",
    fontSize: '0.75rem',
    marginTop: '6px',
  },
}));

const AddressStyledSelect = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontFamily: "'Mona Sans'",
    '& fieldset': {
      borderColor: alpha('#1F64BF', 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha('#1F64BF', 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1F64BF',
      borderWidth: '2px',
      boxShadow: `0 0 0 4px ${alpha('#1F64BF', 0.1)}`,
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Mona Sans'",
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1F64BF',
    },
  },
}));

const AddressValidationStatus = styled(Box)(({ theme, status }) => {
  const statusConfig = {
    validating: {
      backgroundColor: alpha('#F59E0B', 0.1),
      color: '#F59E0B',
      borderColor: alpha('#F59E0B', 0.2)
    },
    valid: {
      backgroundColor: alpha('#10B981', 0.1),
      color: '#10B981',
      borderColor: alpha('#10B981', 0.2)
    },
    invalid: {
      backgroundColor: alpha('#EF4444', 0.1),
      color: '#EF4444',
      borderColor: alpha('#EF4444', 0.2)
    }
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: 500,
    fontFamily: "'Mona Sans'",
    marginTop: '8px',
    ...(statusConfig[status] || statusConfig.validating)
  };
});

const AddressCoordinatesDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  backgroundColor: alpha('#1F64BF', 0.05),
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  marginTop: '12px',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  }
}));

const AddressMapContainer = styled(Box)(({ theme }) => ({
  height: '300px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: `1px solid ${alpha('#1F64BF', 0.1)}`,
  marginTop: '16px',
  [theme.breakpoints.down('md')]: {
    height: '250px',
  },
  [theme.breakpoints.down('sm')]: {
    height: '200px',
  }
}));

const AddressPrimaryButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  boxShadow: '0 4px 16px rgba(31, 100, 191, 0.24)',
  '&:hover': {
    background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 100%)',
    boxShadow: '0 6px 20px rgba(31, 100, 191, 0.32)',
  },
  '&:disabled': {
    background: alpha('#1F64BF', 0.3),
    boxShadow: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: '14px 24px',
  }
}));

const AddressSecondaryButton = styled(Button)(({ theme }) => ({
  color: '#032CA6',
  backgroundColor: 'white',
  border: `1px solid ${alpha('#1F64BF', 0.2)}`,
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    backgroundColor: alpha('#1F64BF', 0.05),
    borderColor: '#1F64BF',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: '14px 24px',
  }
}));

const AddressErrorAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '12px',
  marginBottom: '16px',
  fontFamily: "'Mona Sans'",
  '& .MuiAlert-message': {
    fontSize: '0.85rem',
  }
}));

// ================ DATOS DE FORMULARIO ================
const STEPS = [
  { id: 'user', label: 'Usuario', icon: UserIcon },
  { id: 'address', label: 'Dirección', icon: LocationIcon },
  { id: 'location', label: 'Ubicación', icon: CoordinatesIcon },
  { id: 'review', label: 'Revisar', icon: CheckIcon }
];

const EL_SALVADOR_DEPARTMENTS = {
  'San Salvador': ['San Salvador', 'Aguilares', 'Apopa', 'Ayutuxtepeque', 'Cuscatancingo', 'Delgado', 'El Paisnal', 'Guazapa', 'Ilopango', 'Mejicanos', 'Nejapa', 'Panchimalco', 'Rosario de Mora', 'San Marcos', 'San Martín', 'Santiago Texacuangos', 'Santo Tomás', 'Soyapango', 'Tonacatepeque'],
  'La Libertad': ['Santa Tecla', 'Antiguo Cuscatlán', 'Chiltiupán', 'Ciudad Arce', 'Colón', 'Comasagua', 'Huizúcar', 'Jayaque', 'Jicalapa', 'La Libertad', 'Nuevo Cuscatlán', 'Quezaltepeque', 'Sacacoyo', 'San José Villanueva', 'San Juan Opico', 'San Matías', 'San Pablo Tacachico', 'Talnique', 'Tamanique', 'Teotepeque', 'Tepecoyo', 'Zaragoza'],
  'Santa Ana': ['Santa Ana', 'Candelaria de la Frontera', 'Chalchuapa', 'Coatepeque', 'El Congo', 'El Porvenir', 'Masahuat', 'Metapán', 'San Antonio Pajonal', 'San Sebastián Salitrillo', 'Santiago de la Frontera', 'Texistepeque'],
  'San Miguel': ['San Miguel', 'Carolina', 'Chapeltique', 'Chinameca', 'Chirilagua', 'Ciudad Barrios', 'Comacarán', 'El Tránsito', 'Lolotique', 'Moncagua', 'Nueva Guadalupe', 'Nuevo Edén de San Juan', 'Quelepa', 'San Antonio', 'San Gerardo', 'San Jorge', 'San Luis de la Reina', 'San Rafael Oriente', 'Sesori', 'Uluazapa'],
  'Sonsonate': ['Sonsonate', 'Acajutla', 'Armenia', 'Caluco', 'Cuisnahuat', 'Izalco', 'Juayúa', 'Nahuizalco', 'Nahulingo', 'Salcoatitán', 'San Antonio del Monte', 'San Julián', 'Santa Catarina Masahuat', 'Santa Isabel Ishuatán', 'Santo Domingo de Guzmán', 'Sonzacate'],
  'Ahuachapán': ['Ahuachapán', 'Apaneca', 'Atiquizaya', 'Concepción de Ataco', 'El Refugio', 'Guaymango', 'Jujutla', 'San Francisco Menéndez', 'San Lorenzo', 'San Pedro Puxtla', 'Tacuba', 'Turín'],
  'Usulután': ['Usulután', 'Alegría', 'Berlín', 'California', 'Concepción Batres', 'El Triunfo', 'Ereguayquín', 'Estanzuelas', 'Jiquilisco', 'Jucuapa', 'Jucuarán', 'Mercedes Umaña', 'Nueva Granada', 'Ozatlán', 'Puerto El Triunfo', 'San Agustín', 'San Buenaventura', 'San Dionisio', 'San Francisco Javier', 'Santa Elena', 'Santa María', 'Santiago de María', 'Tecapán'],
  'La Unión': ['La Unión', 'Anamorós', 'Bolívar', 'Concepción de Oriente', 'Conchagua', 'El Carmen', 'El Sauce', 'Intipucá', 'Lislique', 'Meanguera del Golfo', 'Nueva Esparta', 'Pasaquina', 'Polorós', 'San Alejo', 'San José', 'Santa Rosa de Lima', 'Yayantique', 'Yucuaiquín'],
  'La Paz': ['Zacatecoluca', 'Cuyultitán', 'El Rosario', 'Jerusalén', 'Mercedes La Ceiba', 'Olocuilta', 'Paraíso de Osorio', 'San Antonio Masahuat', 'San Emigdio', 'San Francisco Chinameca', 'San Juan Nonualco', 'San Juan Talpa', 'San Luis Talpa', 'San Miguel Tepezontes', 'San Pedro Masahuat', 'San Pedro Nonualco', 'San Rafael Obrajuelo', 'Santa María Ostuma', 'Santiago Nonualco', 'Tapalhuaca', 'Tepetitán'],
  'Chalatenango': ['Chalatenango', 'Agua Caliente', 'Arcatao', 'Azacualpa', 'Cancasque', 'Citalá', 'Comalapa', 'Concepción Quezaltepeque', 'Dulce Nombre de María', 'El Carrizal', 'El Paraíso', 'La Laguna', 'La Palma', 'La Reina', 'Las Vueltas', 'Nombre de Jesús', 'Nueva Concepción', 'Nueva Trinidad', 'Ojos de Agua', 'Potonico', 'San Antonio de la Cruz', 'San Antonio Los Ranchos', 'San Fernando', 'San Francisco Lempa', 'San Francisco Morazán', 'San Ignacio', 'San Isidro Labrador', 'San José Cancasque', 'San José Las Flores', 'San Luis del Carmen', 'San Miguel de Mercedes', 'San Rafael', 'Santa Rita', 'Tejutla'],
  'Cuscatlán': ['Cojutepeque', 'Candelaria', 'El Carmen', 'El Rosario', 'Monte San Juan', 'Oratorio de Concepción', 'San Bartolomé Perulapía', 'San Cristóbal', 'San José Guayabal', 'San Pedro Perulapán', 'San Rafael Cedros', 'San Ramón', 'Santa Cruz Analquito', 'Santa Cruz Michapa', 'Suchitoto', 'Tenancingo'],
  'Morazán': ['San Francisco Gotera', 'Arambala', 'Cacaopera', 'Chilanga', 'Corinto', 'Delicias de Concepción', 'El Divisadero', 'El Rosario', 'Gualococti', 'Guatajiagua', 'Joateca', 'Jocoaitique', 'Jocoro', 'Lolotiquillo', 'Meanguera', 'Osicala', 'Perquín', 'San Carlos', 'San Fernando', 'San Isidro', 'San Simón', 'Sensembra', 'Sociedad', 'Torola', 'Yamabal', 'Yoloaiquín'],
  'San Vicente': ['San Vicente', 'Apastepeque', 'Guadalupe', 'San Cayetano Istepeque', 'San Esteban Catarina', 'San Ildefonso', 'San Lorenzo', 'San Sebastián', 'Santa Clara', 'Santo Domingo', 'Tecoluca', 'Tepetitán', 'Verapaz'],
  'Cabañas': ['Sensuntepeque', 'Cinquera', 'Dolores', 'Guacotecti', 'Ilobasco', 'Jutiapa', 'San Isidro', 'Tejutepeque', 'Victoria']
};

// ================ COMPONENTE PRINCIPAL ================
const AddressFormModal = ({
  isOpen = false,
  onClose,
  onSave,
  editMode = false,
  addressToEdit = null,
  users = [],
  loadingUsers = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ==================== HOOKS ====================
  const {
    validateCompleteAddress,
    validateField,
    validating,
    hasFieldError,
    getFieldError,
    getValidDepartments,
    getValidMunicipalities,
    getDeliveryFee
  } = useAddressValidation();

  const {
    geocodeAddress,
    reverseGeocode,
    loading: geocoding,
    getElSalvadorCenter
  } = useGeolocation();

  // ==================== ESTADOS LOCALES ====================
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    label: '',
    recipient: '',
    phoneNumber: '',
    department: '',
    municipality: '',
    address: '',
    additionalDetails: '',
    coordinates: [],
    isDefault: false
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [coordinatesFromMap, setCoordinatesFromMap] = useState(null);

  // ==================== DATOS CALCULADOS ====================
  const selectedUser = useMemo(() => {
    return users.find(user => user.id === formData.userId) || null;
  }, [users, formData.userId]);

  const availableMunicipalities = useMemo(() => {
    return EL_SALVADOR_DEPARTMENTS[formData.department] || [];
  }, [formData.department]);

  const isStepComplete = useCallback((stepIndex) => {
    switch (stepIndex) {
      case 0: // Usuario
        return formData.userId && !hasFieldError('userId');
      case 1: // Dirección
        return formData.recipient && formData.phoneNumber && formData.address && 
               !hasFieldError('recipient') && !hasFieldError('phoneNumber') && !hasFieldError('address');
      case 2: // Ubicación
        return formData.department && formData.municipality && 
               !hasFieldError('department') && !hasFieldError('municipality');
      case 3: // Revisar
        return Object.keys(validationErrors).length === 0;
      default:
        return false;
    }
  }, [formData, hasFieldError, validationErrors]);

  const canProceedToNext = isStepComplete(activeStep);

  // ==================== EFECTOS ====================
  useEffect(() => {
    if (editMode && addressToEdit && isOpen) {
      setFormData({
        userId: addressToEdit.userId || '',
        label: addressToEdit.label || '',
        recipient: addressToEdit.recipient || '',
        phoneNumber: addressToEdit.phoneNumber || '',
        department: addressToEdit.department || '',
        municipality: addressToEdit.municipality || '',
        address: addressToEdit.address || '',
        additionalDetails: addressToEdit.additionalDetails || '',
        coordinates: addressToEdit.coordinates || [],
        isDefault: addressToEdit.isDefault || false
      });
      
      if (addressToEdit.coordinates && addressToEdit.coordinates.length > 0) {
        setCoordinatesFromMap({
          lat: addressToEdit.coordinates[1],
          lng: addressToEdit.coordinates[0]
        });
      }
    } else if (!editMode && isOpen) {
      resetForm();
    }
  }, [editMode, addressToEdit, isOpen]);

  useEffect(() => {
    if (formData.department) {
      const fee = getDeliveryFee(formData.department);
      setEstimatedFee(fee);
    }
  }, [formData.department, getDeliveryFee]);

  // Auto-geocoding cuando se completa la dirección
  useEffect(() => {
    const autoGeocode = async () => {
      if (formData.address && formData.department && formData.municipality && 
          formData.address.length > 10 && !coordinatesFromMap) {
        
        try {
          const result = await geocodeAddress(formData.address, formData.department, formData.municipality);
          if (result && result.coordinates) {
            setCoordinatesFromMap({
              lat: result.latitude,
              lng: result.longitude
            });
            setFormData(prev => ({
              ...prev,
              coordinates: result.coordinates
            }));
          }
        } catch (error) {
          console.log('Auto-geocoding failed:', error);
        }
      }
    };

    const timeoutId = setTimeout(autoGeocode, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData.address, formData.department, formData.municipality, geocodeAddress, coordinatesFromMap]);

  // ==================== FUNCIONES ====================
  const resetForm = () => {
    setFormData({
      userId: '',
      label: '',
      recipient: '',
      phoneNumber: '',
      department: '',
      municipality: '',
      address: '',
      additionalDetails: '',
      coordinates: [],
      isDefault: false
    });
    setValidationErrors({});
    setActiveStep(0);
    setCoordinatesFromMap(null);
    setEstimatedFee(0);
  };

  const handleInputChange = async (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar municipio si cambia departamento
    if (field === 'department') {
      setFormData(prev => ({
        ...prev,
        municipality: ''
      }));
    }

    // Validación en tiempo real
    try {
      const validationResult = await validateField(field, value, {
        department: field === 'department' ? value : formData.department
      });
      
      if (validationResult.isValid) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: null
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          [field]: validationResult.error
        }));
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleCoordinatesFromMap = (coordinates) => {
    setCoordinatesFromMap(coordinates);
    setFormData(prev => ({
      ...prev,
      coordinates: [coordinates.lng, coordinates.lat]
    }));
  };

  const handleNext = () => {
    if (canProceedToNext && activeStep < STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Validación final completa
      const validation = await validateCompleteAddress(formData);
      
      if (!validation.isValid) {
        setValidationErrors(validation.validationResults || {});
        setLoading(false);
        return;
      }

      // Preparar datos para envío
      const addressData = {
        ...validation.formattedData,
        estimatedDeliveryFee: estimatedFee
      };

      await onSave(addressData, editMode ? 'edit' : 'create');
      
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
      setValidationErrors({
        general: error.message || 'Error al guardar la dirección'
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER STEPS ====================
  const renderUserStep = () => (
    <AddressFormSection>
      <AddressSectionTitle>
        <UserIcon size={20} />
        Seleccionar Usuario
      </AddressSectionTitle>
      
      <AddressFormGrid>
        <AddressStyledSelect fullWidth error={!!validationErrors.userId}>
          <InputLabel>Usuario *</InputLabel>
          <Select
            value={formData.userId}
            label="Usuario *"
            onChange={(e) => handleInputChange('userId', e.target.value)}
            disabled={loadingUsers}
          >
            {loadingUsers ? (
              <MenuItem disabled>Cargando usuarios...</MenuItem>
            ) : (
              users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                      {user.name}
                    </Typography>
                    {user.email && (
                      <Typography variant="caption" sx={{ color: '#032CA6', fontFamily: "'Mona Sans'" }}>
                        {user.email}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
          {validationErrors.userId && (
            <Typography variant="caption" color="error" sx={{ mt: 1, fontFamily: "'Mona Sans'" }}>
              {validationErrors.userId}
            </Typography>
          )}
        </AddressStyledSelect>

        {selectedUser && (
          <Box sx={{ 
            p: 2, 
            borderRadius: '12px', 
            backgroundColor: alpha('#1F64BF', 0.05),
            border: `1px solid ${alpha('#1F64BF', 0.1)}`
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: "'Mona Sans'" }}>
              Usuario Seleccionado
            </Typography>
            <Typography sx={{ fontFamily: "'Mona Sans'" }}>
              <strong>Nombre:</strong> {selectedUser.name}
            </Typography>
            {selectedUser.email && (
              <Typography sx={{ fontFamily: "'Mona Sans'" }}>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
            )}
            {selectedUser.phone && (
              <Typography sx={{ fontFamily: "'Mona Sans'" }}>
                <strong>Teléfono:</strong> {selectedUser.phone}
              </Typography>
            )}
          </Box>
        )}
      </AddressFormGrid>
    </AddressFormSection>
  );

  const renderAddressStep = () => (
    <AddressFormSection>
      <AddressSectionTitle>
        <LocationIcon size={20} />
        Información de Dirección
      </AddressSectionTitle>
      
      <AddressFormGrid>
        <AddressStyledTextField
          fullWidth
          label="Etiqueta de dirección"
          value={formData.label}
          onChange={(e) => handleInputChange('label', e.target.value)}
          placeholder="Casa, Oficina, etc."
          error={!!validationErrors.label}
          helperText={validationErrors.label}
        />

        <AddressStyledTextField
          fullWidth
          label="Nombre del destinatario *"
          value={formData.recipient}
          onChange={(e) => handleInputChange('recipient', e.target.value)}
          error={!!validationErrors.recipient}
          helperText={validationErrors.recipient}
          InputProps={{
            startAdornment: <UserIcon size={16} style={{ marginRight: '8px', color: '#032CA6' }} />
          }}
        />

        <AddressStyledTextField
          fullWidth
          label="Número de teléfono *"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          placeholder="7123-4567"
          error={!!validationErrors.phoneNumber}
          helperText={validationErrors.phoneNumber || "Formato: 8 dígitos comenzando con 2, 6 o 7"}
          InputProps={{
            startAdornment: <PhoneIcon size={16} style={{ marginRight: '8px', color: '#032CA6' }} />
          }}
        />

        <AddressStyledTextField
          fullWidth
          label="Dirección completa *"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          multiline
          rows={3}
          placeholder="Calle, avenida, número de casa, referencias..."
          error={!!validationErrors.address}
          helperText={validationErrors.address}
          InputProps={{
            startAdornment: (
              <HomeIcon 
                size={16} 
                style={{ 
                  marginRight: '8px', 
                  color: '#032CA6', 
                  alignSelf: 'flex-start', 
                  marginTop: '12px' 
                }} 
              />
            )
          }}
        />

        <AddressStyledTextField
          fullWidth
          label="Detalles adicionales"
          value={formData.additionalDetails}
          onChange={(e) => handleInputChange('additionalDetails', e.target.value)}
          multiline
          rows={2}
          placeholder="Puntos de referencia, instrucciones especiales..."
          error={!!validationErrors.additionalDetails}
          helperText={validationErrors.additionalDetails}
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              color="primary"
            />
          }
          label="Establecer como dirección principal"
          sx={{ gridColumn: '1 / -1', fontFamily: "'Mona Sans'" }}
        />
      </AddressFormGrid>
    </AddressFormSection>
  );

  const renderLocationStep = () => (
    <AddressFormSection>
      <AddressSectionTitle>
        <CoordinatesIcon size={20} />
        Ubicación Geográfica
      </AddressSectionTitle>
      
      <AddressFormGrid>
        <AddressStyledSelect fullWidth error={!!validationErrors.department}>
          <InputLabel>Departamento *</InputLabel>
          <Select
            value={formData.department}
            label="Departamento *"
            onChange={(e) => handleInputChange('department', e.target.value)}
          >
            {Object.keys(EL_SALVADOR_DEPARTMENTS).map(dept => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </Select>
          {validationErrors.department && (
            <Typography variant="caption" color="error" sx={{ mt: 1, fontFamily: "'Mona Sans'" }}>
              {validationErrors.department}
            </Typography>
          )}
        </AddressStyledSelect>

        <AddressStyledSelect fullWidth error={!!validationErrors.municipality}>
          <InputLabel>Municipio *</InputLabel>
          <Select
            value={formData.municipality}
            label="Municipio *"
            onChange={(e) => handleInputChange('municipality', e.target.value)}
            disabled={!formData.department}
          >
            {availableMunicipalities.map(municipality => (
              <MenuItem key={municipality} value={municipality}>
                {municipality}
              </MenuItem>
            ))}
          </Select>
          {validationErrors.municipality && (
            <Typography variant="caption" color="error" sx={{ mt: 1, fontFamily: "'Mona Sans'" }}>
              {validationErrors.municipality}
            </Typography>
          )}
        </AddressStyledSelect>
      </AddressFormGrid>

      {formData.department && (
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={`Tarifa estimada de envío: ${estimatedFee.toFixed(2)}`}
            color="primary" 
            variant="outlined"
            sx={{ fontFamily: "'Mona Sans'" }}
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
            Coordenadas (Opcional)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowMap(!showMap)}
            startIcon={<SearchIcon size={16} />}
            sx={{ fontFamily: "'Mona Sans'" }}
          >
            {showMap ? 'Ocultar Mapa' : 'Seleccionar en Mapa'}
          </Button>
        </Box>

        {coordinatesFromMap && (
          <AddressCoordinatesDisplay>
            <CoordinatesIcon size={20} color="#1F64BF" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Mona Sans'" }}>
                Coordenadas seleccionadas:
              </Typography>
              <Typography variant="caption" sx={{ color: '#032CA6', fontFamily: "'Mona Sans'" }}>
                Lat: {coordinatesFromMap.lat.toFixed(6)}, Lng: {coordinatesFromMap.lng.toFixed(6)}
              </Typography>
            </Box>
            <Button
              size="small"
              color="error"
              onClick={() => {
                setCoordinatesFromMap(null);
                setFormData(prev => ({ ...prev, coordinates: [] }));
              }}
            >
              Limpiar
            </Button>
          </AddressCoordinatesDisplay>
        )}

        {showMap && (
          <AddressMapContainer>
            <AddressMapPicker
              center={coordinatesFromMap || { 
                lat: getElSalvadorCenter()[1], 
                lng: getElSalvadorCenter()[0] 
              }}
              onLocationSelect={handleCoordinatesFromMap}
              selectedLocation={coordinatesFromMap}
            />
          </AddressMapContainer>
        )}

        {geocoding && (
          <AddressValidationStatus status="validating">
            <CircularProgress size={16} />
            Obteniendo coordenadas automáticamente...
          </AddressValidationStatus>
        )}
      </Box>
    </AddressFormSection>
  );

  const renderReviewStep = () => (
    <AddressFormSection>
      <AddressSectionTitle>
        <CheckIcon size={20} />
        Revisar Información
      </AddressSectionTitle>

      {validationErrors.general && (
        <AddressErrorAlert severity="error">
          {validationErrors.general}
        </AddressErrorAlert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Usuario */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1F64BF', fontFamily: "'Mona Sans'" }}>
            Usuario
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            {selectedUser?.name || 'Usuario no seleccionado'}
          </Typography>
          {selectedUser?.email && (
            <Typography variant="body2" sx={{ color: '#032CA6', fontFamily: "'Mona Sans'" }}>
              {selectedUser.email}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Dirección */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1F64BF', fontFamily: "'Mona Sans'" }}>
            Dirección
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            <strong>Destinatario:</strong> {formData.recipient}
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            <strong>Teléfono:</strong> {formData.phoneNumber}
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            <strong>Dirección:</strong> {formData.address}
          </Typography>
          {formData.additionalDetails && (
            <Typography sx={{ fontFamily: "'Mona Sans'" }}>
              <strong>Detalles:</strong> {formData.additionalDetails}
            </Typography>
          )}
          {formData.label && (
            <Typography sx={{ fontFamily: "'Mona Sans'" }}>
              <strong>Etiqueta:</strong> {formData.label}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Ubicación */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1F64BF', fontFamily: "'Mona Sans'" }}>
            Ubicación
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            <strong>Departamento:</strong> {formData.department}
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            <strong>Municipio:</strong> {formData.municipality}
          </Typography>
          <Typography sx={{ fontFamily: "'Mona Sans'" }}>
            <strong>Tarifa de envío:</strong> ${estimatedFee.toFixed(2)}
          </Typography>
          {coordinatesFromMap && (
            <Typography sx={{ fontFamily: "'Mona Sans'" }}>
              <strong>Coordenadas:</strong> {coordinatesFromMap.lat.toFixed(6)}, {coordinatesFromMap.lng.toFixed(6)}
            </Typography>
          )}
          {formData.isDefault && (
            <Chip 
              label="Dirección Principal" 
              color="warning" 
              size="small" 
              sx={{ mt: 1, fontFamily: "'Mona Sans'" }}
            />
          )}
        </Box>
      </Box>
    </AddressFormSection>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderUserStep();
      case 1:
        return renderAddressStep();
      case 2:
        return renderLocationStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // ==================== RENDER PRINCIPAL ====================
  if (!isOpen) return null;

  return (
    <AddressModalDialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <AddressModalHeader>
        <AddressModalTitle>
          <LocationIcon size={24} />
          {editMode ? 'Editar Dirección' : 'Nueva Dirección'}
        </AddressModalTitle>
        
        <IconButton onClick={onClose} sx={{ color: '#032CA6' }}>
          <CloseIcon size={20} />
        </IconButton>
      </AddressModalHeader>

      <AddressModalContent>
        {/* Stepper */}
        <AddressStepperContainer>
          <AddressCustomStepper activeStep={activeStep} alternativeLabel={isMobile}>
            {STEPS.map((step, index) => (
              <Step key={step.id} completed={isStepComplete(index)}>
                <StepLabel
                  StepIconComponent={({ completed, active }) => (
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: completed 
                          ? '#10B981' 
                          : active 
                            ? '#1F64BF' 
                            : alpha('#1F64BF', 0.2),
                        color: completed || active ? 'white' : alpha('#1F64BF', 0.6),
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {completed ? (
                        <CheckIcon size={16} weight="bold" />
                      ) : (
                        <step.icon size={16} weight="bold" />
                      )}
                    </Box>
                  )}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </AddressCustomStepper>
        </AddressStepperContainer>

        {/* Contenido del paso */}
        {renderStepContent()}

        {/* Estado de validación */}
        {validating && (
          <AddressValidationStatus status="validating">
            <CircularProgress size={16} />
            Validando información...
          </AddressValidationStatus>
        )}
      </AddressModalContent>

      <AddressModalActions>
        {activeStep > 0 && (
          <AddressSecondaryButton
            onClick={handleBack}
            startIcon={<BackIcon size={16} />}
            disabled={loading}
          >
            Atrás
          </AddressSecondaryButton>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <AddressSecondaryButton
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </AddressSecondaryButton>
        
        {activeStep < STEPS.length - 1 ? (
          <AddressPrimaryButton
            onClick={handleNext}
            endIcon={<NextIcon size={16} />}
            disabled={!canProceedToNext || loading}
          >
            Siguiente
          </AddressPrimaryButton>
        ) : (
          <AddressPrimaryButton
            onClick={handleSubmit}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon size={16} />}
            disabled={loading || !canProceedToNext}
          >
            {loading 
              ? 'Guardando...' 
              : editMode 
                ? 'Actualizar Dirección' 
                : 'Crear Dirección'
            }
          </AddressPrimaryButton>
        )}
      </AddressModalActions>
    </AddressModalDialog>
  );
};

export default AddressFormModal;