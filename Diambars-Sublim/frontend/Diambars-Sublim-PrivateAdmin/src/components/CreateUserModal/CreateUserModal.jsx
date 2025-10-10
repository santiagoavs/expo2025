import React, { useState } from 'react';
import { 
User, 
EnvelopeSimple, 
Phone, 
Lock, 
Shield,
Crown,
Eye,
EyeSlash,
Check,
X,
Warning
} from '@phosphor-icons/react';
import {
Box,
Button,
TextField,
Typography,
IconButton,
InputAdornment,
FormControl,
Select,
MenuItem,
Card,
CardContent,
Chip,
Grid,
Container,
styled,
useTheme,
alpha,
Paper,
Modal,
Backdrop,
CircularProgress
} from '@mui/material';

// Estilos globales para las animaciones
const GlobalStyles = () => (
<style>
{`
@keyframes flowMove {
  0% {
    opacity: 0.2;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
}

@keyframes shineMove {
  0% {
    left: -100%;
  }
  20% {
    left: -100%;
  }
  80% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}

@keyframes flowMoveSubtle {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.01);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

@keyframes flowMoveSubtle {
  0% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.01);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

@keyframes shineMoveSubtle {
  0% {
    left: -100%;
  }
  25% {
    left: -100%;
  }
  75% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}
`}
</style>
);

// ================ ESTILOS MODERNOS RESPONSIVE - CREATE USER MODAL ================

const ModernModalBackdrop = styled(Backdrop)({
background: 'rgba(1, 3, 38, 0.2)',
backdropFilter: 'blur(8px)',
WebkitBackdropFilter: 'blur(8px)',
});

const ModernModalContainer = styled(Box)(({ theme }) => ({
position: 'fixed',
top: 0,
left: 0,
right: 0,
bottom: 0,
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
padding: '20px',
zIndex: 1300,
[theme.breakpoints.down('sm')]: {
padding: '16px',
alignItems: 'flex-start',
paddingTop: '20px',
}
}));

const ModernModalCard = styled(Paper)(({ theme }) => ({
background: 'white',
borderRadius: '20px',
border: `1px solid ${alpha('#1F64BF', 0.08)}`,
boxShadow: '0 4px 20px rgba(1, 3, 38, 0.08)',
maxWidth: '900px',
width: '100%',
maxHeight: '90vh',
overflow: 'hidden',
position: 'relative',
fontFamily: "'Mona Sans'",
[theme.breakpoints.down('lg')]: {
maxWidth: '800px',
},
[theme.breakpoints.down('md')]: {
maxWidth: '700px',
maxHeight: '85vh',
},
[theme.breakpoints.down('sm')]: {
maxWidth: '100%',
maxHeight: '95vh',
borderRadius: '16px',
}
}));

// HEADER CON GLASSMORPHISM ANIMADO
const ModernModalHeader = styled(Box)(({ theme }) => ({
background: 'rgba(255, 255, 255, 0.05)',
backdropFilter: 'blur(25px)',
WebkitBackdropFilter: 'blur(25px)',
color: '#010326',
padding: '32px',
position: 'relative',
borderBottom: `2px solid rgba(31, 100, 191, 0.3)`,
borderRadius: '20px 20px 0 0',
border: '1px solid rgba(255, 255, 255, 0.3)',
boxShadow: `
inset 0 1px 0 rgba(255, 255, 255, 0.5),
inset 0 -1px 0 rgba(255, 255, 255, 0.1)
`,
overflow: 'hidden',

// Efecto de borde superior brillante
'&::before': {
content: '""',
position: 'absolute',
top: 0,
left: 0,
right: 0,
height: '1px',
background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
zIndex: 1,
},

// Efecto de borde lateral izquierdo
'&::after': {
content: '""',
position: 'absolute',
top: 0,
left: 0,
width: '1px',
height: '100%',
background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))',
zIndex: 1,
},

[theme.breakpoints.down('md')]: {
padding: '28px',
},
[theme.breakpoints.down('sm')]: {
padding: '24px',
borderRadius: '16px 16px 0 0',
}
}));

const ModernModalTitle = styled(Typography)(({ theme }) => ({
fontSize: '1.75rem',
fontWeight: 700,
margin: 0,
marginBottom: '8px',
fontFamily: "'Mona Sans'",
position: 'relative',
zIndex: 3,
display: 'flex',
alignItems: 'center',
gap: '12px',
color: '#010326',
[theme.breakpoints.down('md')]: {
fontSize: '1.5rem',
},
[theme.breakpoints.down('sm')]: {
fontSize: '1.3rem',
}
}));

const ModernModalSubtitle = styled(Typography)(({ theme }) => ({
fontSize: '1rem',
opacity: 0.7,
margin: 0,
fontFamily: "'Mona Sans'",
position: 'relative',
zIndex: 3,
color: '#032CA6',
[theme.breakpoints.down('sm')]: {
fontSize: '0.9rem',
}
}));

const ModernModalCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: '24px',
  top: '24px',
  width: '40px',
  height: '40px',
  background: 'linear-gradient(135deg,rgb(239, 242, 255) 0%,rgb(239, 242, 255) 100%)',
  color: 'white',
  borderRadius: '12px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 1px 4px rgba(31, 100, 191, 0.1)',
  zIndex: 10,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.6s ease',
    zIndex: 1,
  },
  '& > *': {
    position: 'relative',
    zIndex: 2,
  },
  '&:hover': {
    background: 'linear-gradient(135deg,rgb(180, 179, 247) 0%,rgb(188, 179, 247) 100%)',
    transform: 'translateY(-1px) scale(1.05)',
    boxShadow: '0 2px 8px rgba(31, 100, 191, 0.2)',
    '&::before': {
      left: '100%',
    },
  },
  '&:active': {
    transform: 'scale(0.95) translateY(-1px)',
  },
  [theme.breakpoints.down('md')]: {
    right: '20px',
    top: '20px',
    width: '36px',
    height: '36px',
  },
  [theme.breakpoints.down('sm')]: {
    right: '16px',
    top: '16px',
    width: '32px',
    height: '32px',
  }
}));

const ModernModalContent = styled(Box)(({ theme }) => ({
padding: 0,
maxHeight: 'calc(90vh - 180px)',
overflowY: 'auto',
position: 'relative',
background: 'transparent',
boxShadow: 'none',
border: 'none',

'&::-webkit-scrollbar': {
width: '6px',
},
'&::-webkit-scrollbar-track': {
background: alpha('#1F64BF', 0.05),
borderRadius: '3px',
},
'&::-webkit-scrollbar-thumb': {
background: alpha('#1F64BF', 0.2),
borderRadius: '3px',
'&:hover': {
background: alpha('#1F64BF', 0.3),
}
},
[theme.breakpoints.down('md')]: {
maxHeight: 'calc(85vh - 160px)',
},
[theme.breakpoints.down('sm')]: {
maxHeight: 'calc(95vh - 140px)',
}
}));

const CreateUserForm = styled(Box)({
fontFamily: "'Mona Sans'",
});

const CreateUserSection = styled(Box)(({ theme }) => ({
padding: '24px',
background: 'rgba(255, 255, 255, 0.1)',
backdropFilter: 'blur(15px)',
WebkitBackdropFilter: 'blur(15px)',
borderRadius: 0,
border: 'none',
borderBottom: '1px solid rgba(31, 100, 191, 0.1)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
position: 'relative',
overflow: 'hidden',
'& > *': {
position: 'relative',
zIndex: 1,
},
[theme.breakpoints.down('sm')]: {
padding: '20px',
}
}));

const CreateUserSectionTitle = styled(Typography)(({ theme }) => ({
display: 'flex',
alignItems: 'center',
gap: '10px',
fontSize: '1.1rem',
fontWeight: 600,
color: '#010326',
margin: 0,
marginBottom: '20px',
paddingBottom: '12px',
borderBottom: '1px solid rgba(31, 100, 191, 0.15)',
fontFamily: "'Mona Sans'",
position: 'relative',

// Efecto de gradiente en el borde inferior
'&::after': {
content: '""',
position: 'absolute',
bottom: '-1px',
left: 0,
width: '60px',
height: '2px',
background: 'linear-gradient(90deg, #1F64BF, #032CA6)',
borderRadius: '2px',
boxShadow: '0 0 4px rgba(31, 100, 191, 0.3)',
},

[theme.breakpoints.down('sm')]: {
fontSize: '1rem',
}
}));

const CreateUserField = styled(Box)({
display: 'flex',
flexDirection: 'column',
gap: '8px',
marginBottom: '20px',
});

const CreateUserLabel = styled(Typography)(({ theme }) => ({
display: 'flex',
alignItems: 'center',
gap: '8px',
fontSize: '0.875rem',
fontWeight: 500,
color: '#032CA6',
marginBottom: '4px',
fontFamily: "'Mona Sans'",
[theme.breakpoints.down('sm')]: {
fontSize: '0.8rem',
}
}));

const CreateUserInput = styled(TextField)(({ theme, error }) => ({
width: '100%',
fontFamily: "'Mona Sans'",
'& .MuiOutlinedInput-root': {
borderRadius: '12px',
backgroundColor: 'rgba(255, 255, 255, 0.4)',
backdropFilter: 'blur(10px)',
WebkitBackdropFilter: 'blur(10px)',
border: '1px solid rgba(255, 255, 255, 0.3)',
transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(1, 3, 38, 0.03)',
'& fieldset': {
border: 'none',
},
'&:hover': {
backgroundColor: 'rgba(255, 255, 255, 0.6)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 4px rgba(1, 3, 38, 0.05)',
transform: 'translateY(-1px)',
border: '1px solid rgba(31, 100, 191, 0.2)',
},
'&.Mui-focused': {
backgroundColor: 'rgba(255, 255, 255, 0.7)',
boxShadow: error ? 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(239, 68, 68, 0.08)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(31, 100, 191, 0.08)',
transform: 'translateY(-1px)',
border: error ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(31, 100, 191, 0.3)',
},
'& input': {
color: '#010326',
fontSize: '0.9rem',
fontWeight: 500,
fontFamily: "'Mona Sans'",
padding: '16px 20px',
'&::placeholder': {
  color: '#64748b',
  opacity: 0.7,
}
}
}
}));

const CreateUserSelect = styled(Select)(({ theme, error }) => ({
width: '100%',
fontFamily: "'Mona Sans'",
borderRadius: '12px',
backgroundColor: 'rgba(255, 255, 255, 0.4)',
backdropFilter: 'blur(10px)',
WebkitBackdropFilter: 'blur(10px)',
border: '1px solid rgba(255, 255, 255, 0.3)',
transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(1, 3, 38, 0.03)',
'& fieldset': {
border: 'none',
},
'&:hover': {
backgroundColor: 'rgba(255, 255, 255, 0.6)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 4px rgba(1, 3, 38, 0.05)',
transform: 'translateY(-1px)',
border: '1px solid rgba(31, 100, 191, 0.2)',
},
'&.Mui-focused': {
backgroundColor: 'rgba(255, 255, 255, 0.7)',
boxShadow: error ? 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(239, 68, 68, 0.08)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(31, 100, 191, 0.08)',
transform: 'translateY(-1px)',
border: error ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(31, 100, 191, 0.3)',
},
'& .MuiSelect-select': {
color: '#010326',
fontSize: '0.9rem',
fontWeight: 500,
fontFamily: "'Mona Sans'",
padding: '16px 20px',
}
}));

const CreateUserError = styled(Typography)(({ theme }) => ({
fontSize: '0.75rem',
color: '#EF4444',
fontWeight: 500,
marginTop: '4px',
display: 'flex',
alignItems: 'center',
gap: '4px',
fontFamily: "'Mona Sans'",
}));

const CreateUserRoleCard = styled(Paper)(({ selected, theme }) => ({
cursor: 'pointer',
transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
border: selected ? `2px solid #1F64BF` : `1px solid rgba(255, 255, 255, 0.3)`,
background: selected ? 'rgba(31, 100, 191, 0.1)' : 'rgba(255, 255, 255, 0.4)',
backdropFilter: 'blur(10px)',
WebkitBackdropFilter: 'blur(10px)',
borderRadius: '12px',
position: 'relative',
overflow: 'hidden',
boxShadow: selected ? 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 2px 12px rgba(31, 100, 191, 0.1)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 4px rgba(1, 3, 38, 0.02)',
height: '100%',
display: 'flex',
flexDirection: 'column',
'&::before': {
content: '""',
position: 'absolute',
top: 0,
left: '-100%',
width: '100%',
height: '100%',
background: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.08), transparent)',
transition: 'left 0.5s ease',
zIndex: 1,
},
'&:hover': {
borderColor: '#1F64BF',
background: selected ? 'rgba(31, 100, 191, 0.15)' : 'rgba(255, 255, 255, 0.6)',
transform: 'translateY(-2px)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 16px rgba(31, 100, 191, 0.15)',
'&::before': {
left: '100%',
}
}
}));

const CreateUserRoleContent = styled(CardContent)(({ theme }) => ({
padding: '20px',
position: 'relative',
zIndex: 2,
flex: 1,
display: 'flex',
flexDirection: 'column',
[theme.breakpoints.down('sm')]: {
padding: '16px',
}
}));

const CreateUserRoleHeader = styled(Box)({
display: 'flex',
alignItems: 'center',
gap: '10px',
marginBottom: '8px',
});

const CreateUserRoleTitle = styled(Typography)(({ theme }) => ({
fontSize: '1rem',
fontWeight: 600,
color: '#010326',
margin: 0,
fontFamily: "'Mona Sans'",
[theme.breakpoints.down('sm')]: {
fontSize: '0.9rem',
}
}));

const CreateUserRoleDescription = styled(Typography)(({ theme }) => ({
fontSize: '0.8rem',
color: '#64748b',
marginBottom: '12px',
lineHeight: 1.4,
fontFamily: "'Mona Sans'",
[theme.breakpoints.down('sm')]: {
fontSize: '0.75rem',
}
}));

const CreateUserPermissions = styled(Box)(({ theme }) => ({
display: 'flex',
flexWrap: 'wrap',
gap: '6px',
[theme.breakpoints.down('sm')]: {
gap: '4px',
}
}));

const CreateUserPermissionTag = styled(Chip)(({ theme }) => ({
fontSize: '0.7rem',
height: '24px',
background: 'rgba(31, 100, 191, 0.15)',
backdropFilter: 'blur(8px)',
WebkitBackdropFilter: 'blur(8px)',
color: '#1F64BF',
border: `1px solid rgba(255, 255, 255, 0.4)`,
fontFamily: "'Mona Sans'",
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
'& .MuiChip-label': {
padding: '0 8px',
fontSize: '0.7rem',
fontWeight: 500,
},
[theme.breakpoints.down('sm')]: {
fontSize: '0.65rem',
height: '20px',
'& .MuiChip-label': {
padding: '0 6px',
fontSize: '0.65rem',
}
}
}));

// FOOTER CON GLASSMORPHISM ANIMADO
const CreateUserActions = styled(Box)(({ theme }) => ({
display: 'flex',
gap: '12px',
justifyContent: 'flex-end',
padding: '20px 32px',
background: 'rgba(255, 255, 255, 0.05)',
position: 'relative',
borderTop: '2px solid rgba(31, 100, 191, 0.3)',
borderRadius: '0 0 20px 20px',
border: '1px solid rgba(255, 255, 255, 0.3)',
boxShadow: `
inset 0 1px 0 rgba(255, 255, 255, 0.5),
inset 0 -1px 0 rgba(255, 255, 255, 0.1)
`,
overflow: 'hidden',

'&::before': {
content: '""',
position: 'absolute',
top: 0,
left: 0,
right: 0,
height: '1px',
background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
zIndex: 1,
},

'&::after': {
content: '""',
position: 'absolute',
top: 0,
right: 0,
width: '1px',
height: '100%',
background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))',
zIndex: 1,
},

'& > *': {
position: 'relative',
zIndex: 3,
},

[theme.breakpoints.down('md')]: {
padding: '20px 28px',
borderRadius: '0 0 16px 16px',
},
[theme.breakpoints.down('sm')]: {
flexDirection: 'column',
padding: '20px 24px',
gap: '10px',
borderRadius: '0 0 16px 16px',
}
}));

const CreateUserBtn = styled(Button)(({ variant, theme }) => ({
display: 'flex',
alignItems: 'center',
gap: '12px',
padding: '12px 24px',
borderRadius: '12px',
fontSize: '0.875rem',
fontWeight: 600,
textTransform: 'none',
fontFamily: "'Mona Sans'",
transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
position: 'relative',
overflow: 'hidden',
minWidth: '120px',

// Efecto de brillo animado
'&::before': {
content: '""',
position: 'absolute',
top: 0,
left: '-100%',
width: '100%',
height: '100%',
background: variant === 'primary' 
? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)'
: 'linear-gradient(90deg, transparent, rgba(31, 100, 191, 0.15), transparent)',
transition: 'left 0.5s ease',
zIndex: 1,
},

'& > *': {
position: 'relative',
zIndex: 2,
},

...(variant === 'primary' ? {
background: 'linear-gradient(135deg, #1F64BF 0%, #032CA6 50%, #040DBF 100%)',
color: '#ffffff',
boxShadow: '0 2px 8px rgba(31, 100, 191, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
border: '1px solid rgba(255, 255, 255, 0.25)',
'&:hover': {
background: 'linear-gradient(135deg, #032CA6 0%, #1F64BF 50%, #032CA6 100%)',
boxShadow: '0 3px 12px rgba(31, 100, 191, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
transform: 'translateY(-2px)',
'&::before': {
  left: '100%',
}
},
'&:active': {
transform: 'translateY(0) scale(1)',
boxShadow: '0 1px 4px rgba(31, 100, 191, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
}
} : {
background: 'rgba(255, 255, 255, 0.15)',
backdropFilter: 'blur(15px)',
WebkitBackdropFilter: 'blur(15px)',
color: '#64748b',
border: '1px solid rgba(255, 255, 255, 0.4)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 4px rgba(1, 3, 38, 0.03)',
'&:hover': {
background: 'rgba(31, 100, 191, 0.12)',
color: '#032CA6',
borderColor: 'rgba(31, 100, 191, 0.3)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 8px rgba(31, 100, 191, 0.1)',
transform: 'translateY(-2px)',
'&::before': {
  left: '100%',
}
},
'&:active': {
transform: 'translateY(0) scale(1)',
boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(1, 3, 38, 0.03)',
}
}),

'&:disabled': {
opacity: 0.5,
transform: 'none',
cursor: 'not-allowed',
'&::before': {
display: 'none',
}
},

[theme.breakpoints.down('sm')]: {
minWidth: 'auto',
justifyContent: 'center',
width: '100%',
}
}));

const CreateUserPasswordStrength = styled(Box)({
marginTop: '8px',
});

const CreateUserPasswordStrengthBar = styled(Box)(({ strength }) => ({
height: '3px',
borderRadius: '2px',
background: strength === 'weak' ? '#EF4444' : strength === 'medium' ? '#F59E0B' : '#10B981',
width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
transition: 'all 0.3s ease',
}));

const CreateUserPasswordStrengthText = styled(Typography)(({ strength, theme }) => ({
fontSize: '0.75rem',
fontWeight: 500,
marginTop: '4px',
color: strength === 'weak' ? '#EF4444' : strength === 'medium' ? '#F59E0B' : '#10B981',
fontFamily: "'Mona Sans'",
}));

// Componente del Header con efectos animados
const AnimatedModalHeader = ({ children, ...props }) => {
return (
<ModernModalHeader {...props}>
{/* Efecto de glow animado */}
<div style={{
  position: 'absolute',
  top: '-3px',
  left: '-3px',
  right: '-3px',
  bottom: '-3px',
  background: 'linear-gradient(135deg, rgba(31, 100, 191, 0.3), rgba(3, 44, 166, 0.2), rgba(4, 13, 191, 0.3), rgba(1, 3, 38, 0.2))',
  borderRadius: '23px',
  opacity: 0.3,
  zIndex: -1,
  animation: 'flowMove 3s ease-in-out infinite alternate',
  filter: 'blur(6px)',
  pointerEvents: 'none'
}} />

{/* Efecto de brillo animado */}
<div style={{
  position: 'absolute',
  top: 0,
  left: '-100%',
  width: '50%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
  transform: 'skewX(-15deg)',
  animation: 'shineMove 4s ease-in-out infinite',
  zIndex: 1,
  pointerEvents: 'none'
}} />

{/* Contenido del header */}
{children}
</ModernModalHeader>
);
};

const CreateUserModal = ({ open, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
name: '',
email: '',
phoneNumber: '',
password: '',
confirmPassword: '',
role: 'customer',
active: true
});

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [errors, setErrors] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

const roleOptions = [
  { 
    value: 'customer', 
    label: 'Cliente', 
    icon: <User size={16} weight="duotone" />, 
    description: 'Acceso básico para compras y gestión de pedidos',
    permissions: ['catalog', 'orders', 'profile']
  },
  { 
    value: 'premium', 
    label: 'Premium', 
    icon: <Crown size={16} weight="duotone" />, 
    description: 'Acceso premium con descuentos y soporte prioritario',
    permissions: ['catalog', 'orders', 'profile', 'discounts', 'priority_support']
  }
];

const handleInputChange = (field, value) => {
setFormData(prev => ({
...prev,
[field]: value
}));

if (errors[field]) {
setErrors(prev => ({
  ...prev,
  [field]: null
}));
}
};

const getPasswordStrength = (password) => {
if (password.length < 6) return 'weak';
if (password.length < 8) return 'medium';
return 'strong';
};

const validateForm = () => {
const newErrors = {};

if (!formData.name.trim()) {
newErrors.name = 'El nombre es obligatorio';
} else if (formData.name.length < 2) {
newErrors.name = 'El nombre debe tener al menos 2 caracteres';
} else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
newErrors.name = 'El nombre solo puede contener letras y espacios';
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
if (!formData.email.trim()) {
newErrors.email = 'El email es obligatorio';
} else if (!emailRegex.test(formData.email)) {
newErrors.email = 'Ingresa un email válido';
}

if (formData.phoneNumber && !/^[0-9]{8}$/.test(formData.phoneNumber)) {
newErrors.phoneNumber = 'El teléfono debe tener exactamente 8 dígitos';
}

if (!formData.password) {
newErrors.password = 'La contraseña es obligatoria';
} else if (formData.password.length < 6) {
newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
}

if (formData.password !== formData.confirmPassword) {
newErrors.confirmPassword = 'Las contraseñas no coinciden';
}

setErrors(newErrors);
return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
e.preventDefault();

if (!validateForm()) {
return;
}

setIsSubmitting(true);

try {
const { confirmPassword, ...submitData } = formData;
submitData.active = submitData.active === true || submitData.active === 'true';

await onSubmit(submitData);
} catch (error) {
console.error('Error creating user:', error);
} finally {
setIsSubmitting(false);
}
};

const getCurrentRolePermissions = () => {
const role = roleOptions.find(r => r.value === formData.role);
return role ? role.permissions : [];
};

if (!open) return null;

return (
<Modal
open={open}
onClose={onCancel}
closeAfterTransition
BackdropComponent={ModernModalBackdrop}
>
<ModernModalContainer>
  <GlobalStyles />
  <ModernModalCard>
    {/* Efecto de glow animado para todo el modal */}
    <div style={{
      position: 'absolute',
      top: '-3px',
      left: '-3px',
      right: '-3px',
      bottom: '-3px',
      background: 'linear-gradient(135deg, rgba(31, 100, 191, 0.3), rgba(3, 44, 166, 0.2), rgba(4, 13, 191, 0.3), rgba(1, 3, 38, 0.2))',
      borderRadius: '23px',
      opacity: 0.3,
      zIndex: -1,
      animation: 'flowMove 3s ease-in-out infinite alternate',
      filter: 'blur(6px)',
    }} />
    
    {/* Efecto de brillo interior animado para todo el modal */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '50%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      transform: 'skewX(-15deg)',
      animation: 'shineMove 4s ease-in-out infinite',
      zIndex: 1,
      pointerEvents: 'none',
    }} />
    
    {/* HEADER MEJORADO CON GLASSMORPHISM ANIMADO */}
    <AnimatedModalHeader>
      <ModernModalCloseButton
        onClick={onCancel}
        aria-label="Cerrar modal"
      >
        <X size={18} weight="bold" color="#000000" />
      </ModernModalCloseButton>
      
      <ModernModalTitle>
        <User size={28} weight="duotone" />
        Crear Nuevo Usuario
      </ModernModalTitle>
      <ModernModalSubtitle>
        Configura la información y permisos del usuario
      </ModernModalSubtitle>
    </AnimatedModalHeader>

    <ModernModalContent>
      <CreateUserForm component="form" onSubmit={handleSubmit} noValidate>
        <Container maxWidth="lg" disableGutters>
          <Grid container>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <CreateUserSection>
                <CreateUserSectionTitle>
                  <User size={18} weight="duotone" />
                  Información Personal
                </CreateUserSectionTitle>

                <CreateUserField>
                  <CreateUserLabel>
                    <User size={14} weight="duotone" />
                    Nombre completo *
                  </CreateUserLabel>
                  <CreateUserInput
                    type="text"
                    error={!!errors.name}
                    placeholder="Ingresa el nombre completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <CreateUserError>
                      <Warning size={12} weight="duotone" />
                      {errors.name}
                    </CreateUserError>
                  )}
                </CreateUserField>

                <CreateUserField>
                  <CreateUserLabel>
                    <EnvelopeSimple size={14} weight="duotone" />
                    Correo electrónico *
                  </CreateUserLabel>
                  <CreateUserInput
                    type="email"
                    error={!!errors.email}
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <CreateUserError>
                      <Warning size={12} weight="duotone" />
                      {errors.email}
                    </CreateUserError>
                  )}
                </CreateUserField>

                <CreateUserField>
                  <CreateUserLabel>
                    <Phone size={14} weight="duotone" />
                    Teléfono (opcional)
                  </CreateUserLabel>
                  <CreateUserInput
                    type="tel"
                    error={!!errors.phoneNumber}
                    placeholder="12345678"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    inputProps={{ maxLength: 8 }}
                  />
                  {errors.phoneNumber && (
                    <CreateUserError>
                      <Warning size={12} weight="duotone" />
                      {errors.phoneNumber}
                    </CreateUserError>
                  )}
                </CreateUserField>
              </CreateUserSection>
            </Grid>

            {/* Credenciales */}
            <Grid item xs={12} md={6}>
              <CreateUserSection>
                <CreateUserSectionTitle>
                  <Lock size={18} weight="duotone" />
                  Credenciales de Acceso
                </CreateUserSectionTitle>

                <CreateUserField>
                  <CreateUserLabel>
                    <Lock size={14} weight="duotone" />
                    Contraseña *
                  </CreateUserLabel>
                  <CreateUserInput
                    type={showPassword ? "text" : "password"}
                    error={!!errors.password}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#64748b' }}
                          >
                            {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {formData.password && (
                    <CreateUserPasswordStrength>
                      <CreateUserPasswordStrengthBar strength={getPasswordStrength(formData.password)} />
                      <CreateUserPasswordStrengthText strength={getPasswordStrength(formData.password)}>
                        Seguridad: {getPasswordStrength(formData.password) === 'weak' ? 'Débil' : 
                                   getPasswordStrength(formData.password) === 'medium' ? 'Media' : 'Fuerte'}
                      </CreateUserPasswordStrengthText>
                    </CreateUserPasswordStrength>
                  )}
                  {errors.password && (
                    <CreateUserError>
                      <Warning size={12} weight="duotone" />
                      {errors.password}
                    </CreateUserError>
                  )}
                </CreateUserField>

                <CreateUserField>
                  <CreateUserLabel>
                    <Lock size={14} weight="duotone" />
                    Confirmar contraseña *
                  </CreateUserLabel>
                  <CreateUserInput
                    type={showConfirmPassword ? "text" : "password"}
                    error={!!errors.confirmPassword}
                    placeholder="Repite la contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{ color: '#64748b' }}
                          >
                            {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {errors.confirmPassword && (
                    <CreateUserError>
                      <Warning size={12} weight="duotone" />
                      {errors.confirmPassword}
                    </CreateUserError>
                  )}
                </CreateUserField>

                <CreateUserField>
                  <CreateUserLabel>
                    <Check size={14} weight="duotone" />
                    Estado inicial del usuario
                  </CreateUserLabel>
                  <FormControl fullWidth>
                    <CreateUserSelect
                      value={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.value === 'true')}
                    >
                      <MenuItem value={true}>Activo - El usuario puede acceder inmediatamente</MenuItem>
                      <MenuItem value={false}>Inactivo - El usuario no podrá acceder hasta ser activado</MenuItem>
                    </CreateUserSelect>
                  </FormControl>
                </CreateUserField>
              </CreateUserSection>
            </Grid>

            {/* Rol y Permisos */}
            <Grid item xs={12}>
              <CreateUserSection>
                <CreateUserSectionTitle>
                  <Shield size={18} weight="duotone" />
                  Rol y Permisos
                </CreateUserSectionTitle>

                <CreateUserField>
                  <CreateUserLabel>
                    <Shield size={14} weight="duotone" />
                    Selecciona el rol del usuario
                  </CreateUserLabel>
                  <Grid container spacing={2}>
                    {roleOptions.map(role => (
                      <Grid item xs={12} sm={6} md={4} key={role.value}>
                        <CreateUserRoleCard
                          selected={formData.role === role.value}
                          onClick={() => handleInputChange('role', role.value)}
                        >
                          <CreateUserRoleContent>
                            <CreateUserRoleHeader>
                              {role.icon}
                              <CreateUserRoleTitle>{role.label}</CreateUserRoleTitle>
                            </CreateUserRoleHeader>
                            <CreateUserRoleDescription>{role.description}</CreateUserRoleDescription>
                            <CreateUserPermissions>
                              {role.permissions.map((permission, index) => (
                                <CreateUserPermissionTag
                                  key={index}
                                  label={permission}
                                  size="small"
                                />
                              ))}
                            </CreateUserPermissions>
                          </CreateUserRoleContent>
                        </CreateUserRoleCard>
                      </Grid>
                    ))}
                  </Grid>
                </CreateUserField>

                {/* Permisos Preview */}
                {getCurrentRolePermissions().length > 0 && (
                  <Box sx={{ 
                    marginTop: '16px',
                    padding: '16px',
                    background: 'rgba(31, 100, 191, 0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(31, 100, 191, 0.2)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 4px rgba(31, 100, 191, 0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                      zIndex: 1,
                    }
                  }}>
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#032CA6', 
                      marginBottom: '8px',
                      fontFamily: "'Mona Sans'",
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Shield size={14} weight="duotone" />
                      Permisos que se asignarán:
                    </Typography>
                    <CreateUserPermissions>
                      {getCurrentRolePermissions().map((permission, index) => (
                        <CreateUserPermissionTag
                          key={index}
                          label={permission}
                          size="small"
                        />
                      ))}
                    </CreateUserPermissions>
                  </Box>
                )}
              </CreateUserSection>
            </Grid>
          </Grid>
        </Container>

        {/* Actions */}
        <CreateUserActions>
          {/* Efecto de glow animado */}
          <div style={{
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            background: 'linear-gradient(135deg, rgba(31, 100, 191, 0.3), rgba(3, 44, 166, 0.2), rgba(4, 13, 191, 0.3), rgba(1, 3, 38, 0.2))',
            borderRadius: '0 0 23px 23px',
            opacity: 0.3,
            zIndex: -1,
            animation: 'flowMove 3s ease-in-out infinite alternate',
            filter: 'blur(6px)',
          }} />
          
          {/* Efecto de brillo animado */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transform: 'skewX(-15deg)',
            animation: 'shineMove 4s ease-in-out infinite',
            zIndex: 1,
          }} />
          
          <CreateUserBtn
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X size={16} weight="duotone" />
            Cancelar
          </CreateUserBtn>
          
          <CreateUserBtn
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={16} color="inherit" />
                Creando Usuario...
              </>
            ) : (
              <>
                <Check size={16} weight="duotone" />
                Crear Usuario
              </>
            )}
          </CreateUserBtn>
        </CreateUserActions>
      </CreateUserForm>
    </ModernModalContent>
  </ModernModalCard>
</ModernModalContainer>
</Modal>
);
};

export default CreateUserModal;// src/components/CreateUserModal/CreateUserModal.jsx
