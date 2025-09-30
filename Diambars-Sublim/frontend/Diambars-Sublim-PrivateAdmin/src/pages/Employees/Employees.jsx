// src/pages/Employees/Employees.jsx
import React, { useState, useEffect } from 'react';
import { 
  UserList, 
  Plus, 
  MagnifyingGlass,
  FunnelSimple,
  UserPlus,
  Shield,
  User,
  Export,
  Buildings,
  CheckCircle,
  Users,
  UserMinus,
  Trash
} from '@phosphor-icons/react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  IconButton,
  CircularProgress,
  Chip,
  Paper,
  styled,
  useTheme,
  alpha,
  Avatar,
  InputLabel,
  FormControl,
  OutlinedInput
} from '@mui/material';
import EmployeeCard from '../../components/EmployeeCard/EmployeeCard';
import EmployeeModal from '../../components/EmployeeModal/EmployeeModal';
import EmployeeFilters from '../../components/EmployeeFilters/EmployeeFilters';
import useEmployees from '../../hooks/useEmployees';
import Swal from 'sweetalert2';

// ================ ESTILOS MODERNOS RESPONSIVE - EMPLOYEES ================
const EmployeesPageContainer = styled(Box)({
  minHeight: '100vh',
  fontFamily: "'Mona Sans'",
  background: 'white',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

const EmployeesContentWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  paddingTop: '120px',
  paddingBottom: '40px',
  paddingLeft: '32px',
  paddingRight: '32px',
  minHeight: 'calc(100vh - 120px)',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('xl')]: {
    maxWidth: '1200px',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '1000px',
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: '110px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    paddingTop: '100px',
    paddingLeft: '16px',
    paddingRight: '16px',
  }
}));

const EmployeesModernCard = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#040DBF', 0.1)}`,
  boxShadow: '0 4px 15px rgba(4, 13, 191, 0.08)',
  transition: 'all 0.3s ease',
  fontFamily: "'Mona Sans'",
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(4, 13, 191, 0.15)',
    borderColor: alpha('#040DBF', 0.2),
  }
}));

const EmployeesHeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '24px',
  padding: '20px 0',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '20px',
  }
}));

const EmployeesTitleSection = styled(Box)({
  flex: 1,
});

const EmployeesMainTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '28px',
  fontWeight: '700',
  color: '#010326',
  margin: '0 0 8px 0',
  background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  [theme.breakpoints.down('md')]: {
    fontSize: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '22px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  }
}));

const EmployeesSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#64748b',
  margin: 0,
  fontWeight: '500',
  [theme.breakpoints.down('md')]: {
    fontSize: '14px',
  }
}));

const EmployeesActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '8px',
  }
}));

const EmployeesBtn = styled(Button)(({ variant }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'primary' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
    color: '#ffffff',
    boxShadow: '0 4px 15px rgba(4, 13, 191, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #1F64BF, #040DBF)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(4, 13, 191, 0.4)',
    }
  } : {
    background: '#ffffff',
    color: '#040DBF',
    border: '2px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(4, 13, 191, 0.1)',
    '&:hover': {
      background: alpha('#040DBF', 0.05),
      borderColor: '#040DBF',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(4, 13, 191, 0.15)',
    }
  })
}));

const EmployeesStatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '8px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '12px',
  }
}));

const EmployeesStatCard = styled(EmployeesModernCard)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '24px',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
  [theme.breakpoints.down('md')]: {
    padding: '20px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const EmployeesStatIcon = styled(Box)(({ variant, theme }) => ({
  width: '52px',
  height: '52px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  ...(variant === 'total' ? {
    background: 'linear-gradient(135deg, #040DBF, #1F64BF)',
  } : variant === 'active' ? {
    background: 'linear-gradient(135deg, #10b981, #059669)',
  } : variant === 'admin' ? {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
  } : {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  }),
  [theme.breakpoints.down('sm')]: {
    width: '44px',
    height: '44px',
  }
}));

const EmployeesStatContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

const EmployeesStatNumber = styled(Typography)(({ theme }) => ({
  fontSize: '28px',
  fontWeight: '700',
  color: '#010326',
  lineHeight: 1,
  [theme.breakpoints.down('md')]: {
    fontSize: '24px',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '20px',
  }
}));

const EmployeesStatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '600',
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
  }
}));

const EmployeesControls = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

const EmployeesSearch = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  maxWidth: '500px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  }
}));

const EmployeesSearchIcon = styled(Box)({
  position: 'absolute',
  left: '16px',
  color: '#64748b',
  transition: 'color 0.3s ease',
  zIndex: 2,
});

const EmployeesSearchInput = styled(TextField)(({ theme }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    paddingLeft: '48px',
    borderRadius: '16px',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#040DBF',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#040DBF',
      boxShadow: '0 0 0 4px rgba(4, 13, 191, 0.1)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '14px 16px',
    color: '#010326',
  }
}));

const EmployeesResults = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 4px',
});

const EmployeesResultsText = styled(Typography)({
  fontSize: '14px',
  color: '#64748b',
  fontWeight: '500',
});

const EmployeesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '24px',
  marginTop: '8px',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
  }
}));

const EmployeesEmpty = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
  textAlign: 'center',
  color: '#64748b',
  [theme.breakpoints.down('sm')]: {
    padding: '60px 20px',
  }
}));

const EmployeesEmptyTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: '600',
  margin: '16px 0 8px 0',
  color: '#334155',
});

const EmployeesEmptyText = styled(Typography)({
  fontSize: '14px',
  margin: 0,
});

const EmployeesLoading = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '16px',
  color: '#64748b',
  fontWeight: '500',
});

const EmployeesError = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  gap: '16px',
  color: '#64748b',
  textAlign: 'center',
});

const EmployeesErrorTitle = styled(Typography)({
  fontSize: '20px',
  fontWeight: '600',
  color: '#dc2626',
  margin: 0,
});

const EmployeesErrorText = styled(Typography)({
  fontSize: '14px',
  margin: 0,
});

const Employees = () => {
  const {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    inactivateEmployee,
    hardDeleteEmployee,
    getEmployeeStats,
    searchEmployees,
    getEmployeesByStatus,
    fetchEmployees
  } = useEmployees();

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });

  // Filtrar empleados por búsqueda y filtros
  useEffect(() => {
    console.log('Filtrando empleados, total:', employees.length);
    let filtered = employees;

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      filtered = searchEmployees(searchQuery);
    }

    // Aplicar filtros
    filtered = filtered.filter(employee => {
      const matchesRole = filters.role === 'all' || employee.role === filters.role;
      const matchesStatus = filters.status === 'all' || employee.status === filters.status;

      // Filtro por fecha (si se implementa)
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const employeeDate = new Date(employee.createdAt || employee.hireDate);
        const daysDiff = (now - employeeDate) / (1000 * 60 * 60 * 24);

        switch (filters.dateRange) {
          case 'week':
            matchesDate = daysDiff <= 7;
            break;
          case 'month':
            matchesDate = daysDiff <= 30;
            break;
          case 'year':
            matchesDate = daysDiff <= 365;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesRole && matchesStatus && matchesDate;
    });

    console.log('Empleados filtrados:', filtered.length);
    setFilteredEmployees(filtered);
  }, [employees, searchQuery, filters, searchEmployees]);

  // Handlers para el modal
  const handleCreateEmployee = () => {
    setModalMode('create');
    setSelectedEmployeeId(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employeeId, employeeData) => {
    setModalMode('edit');
    setSelectedEmployeeId(employeeId);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      const employee = employees.find(e => e.id === employeeId);
      const result = await Swal.fire({
        title: '¿Eliminar empleado?',
        text: `¿Estás seguro de que quieres eliminar a ${employee?.name}? Esta acción no se puede deshacer`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await hardDeleteEmployee(employeeId);
        
        Swal.fire({
          icon: 'success',
          title: 'Empleado eliminado',
          text: 'El empleado ha sido eliminado exitosamente',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          showConfirmButton: false
        });
      }

    } catch (error) {
      console.error('Error deleting employee:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo eliminar el empleado',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      const isActive = newStatus === 'active';
      await inactivateEmployee(employeeId);

      const statusText = {
        active: 'activado',
        inactive: 'desactivado'
      };

      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: `El empleado ha sido ${statusText[newStatus]}`,
        confirmButtonColor: '#3b82f6',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el estado',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleModalSuccess = async () => {
    // Forzar recarga de datos para asegurar actualización en tiempo real
    console.log('Modal success - recargando datos...');
    
    try {
      await fetchEmployees();
      console.log('Datos recargados exitosamente');
    } catch (error) {
      console.error('Error al recargar datos:', error);
    }
    
    Swal.fire({
      icon: 'success',
      title: modalMode === 'create' ? 'Empleado creado' : 'Empleado actualizado',
      text: modalMode === 'create' 
        ? 'El empleado ha sido creado exitosamente' 
        : 'Los cambios se han guardado exitosamente',
      confirmButtonColor: '#3b82f6',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleExportEmployees = () => {
    try {
      // Preparar datos para exportar
      const exportData = filteredEmployees.map(employee => ({
        Nombre: employee.name,
        Email: employee.email,
        Teléfono: employee.phone || 'N/A',
        Departamento: employee.department || 'N/A',
        Posición: employee.position || 'N/A',
        Estado: employee.status === 'active' ? 'Activo' : 'Inactivo',
        'Fecha de Contratación': new Date(employee.hireDate || employee.createdAt).toLocaleDateString('es-ES'),
        Salario: employee.salary ? `$${employee.salary}` : 'N/A'
      }));

      // Crear CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header]}"`).join(',')
        )
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `empleados_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Exportación exitosa',
        text: 'Los empleados han sido exportados correctamente',
        confirmButtonColor: '#040DBF',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error exporting employees:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar la lista de empleados',
        confirmButtonColor: '#040DBF'
      });
    }
  };

  const stats = getEmployeeStats();

  // Mostrar error si hay problemas con la API
  if (error && !loading) {
    return (
      <EmployeesPageContainer>
        <EmployeesContentWrapper>
          <EmployeesError>
            <EmployeesErrorTitle>Error al cargar empleados</EmployeesErrorTitle>
            <EmployeesErrorText>{error}</EmployeesErrorText>
            <EmployeesBtn 
              variant="primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
            </EmployeesBtn>
          </EmployeesError>
        </EmployeesContentWrapper>
      </EmployeesPageContainer>
    );
  }

  if (loading) {
    return (
      <EmployeesPageContainer>
        <EmployeesContentWrapper>
          <EmployeesLoading>
            <CircularProgress size={40} sx={{ color: '#040DBF' }} />
          <span>Cargando empleados...</span>
          </EmployeesLoading>
        </EmployeesContentWrapper>
      </EmployeesPageContainer>
    );
  }

  return (
    <EmployeesPageContainer>
      <EmployeesContentWrapper>
        
        {/* Header */}
        <EmployeesHeaderSection>
          <EmployeesTitleSection>
            <EmployeesMainTitle>
              <UserList size={32} weight="duotone" />
              Gestión de Empleados
            </EmployeesMainTitle>
            <EmployeesSubtitle>
              Administra empleados, departamentos y posiciones de la empresa
            </EmployeesSubtitle>
          </EmployeesTitleSection>

          <EmployeesActions>
            <EmployeesBtn 
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelSimple size={16} weight="duotone" />
              Filtros
            </EmployeesBtn>

            <EmployeesBtn 
              variant="secondary"
              onClick={handleExportEmployees}
              disabled={filteredEmployees.length === 0}
            >
              <Export size={16} weight="duotone" />
              Exportar
            </EmployeesBtn>

            <EmployeesBtn 
              variant="primary"
              onClick={handleCreateEmployee}
            >
              <UserPlus size={16} weight="duotone" />
              Nuevo Empleado
            </EmployeesBtn>
          </EmployeesActions>
        </EmployeesHeaderSection>

        {/* Stats Cards */}
        <EmployeesStatsGrid>
          <EmployeesStatCard>
            <EmployeesStatIcon variant="total">
              <UserList size={24} weight="duotone" />
            </EmployeesStatIcon>
            <EmployeesStatContent>
              <EmployeesStatNumber>{stats.total}</EmployeesStatNumber>
              <EmployeesStatLabel>Total Empleados</EmployeesStatLabel>
            </EmployeesStatContent>
          </EmployeesStatCard>

          <EmployeesStatCard>
            <EmployeesStatIcon variant="active">
              <CheckCircle size={24} weight="duotone" />
            </EmployeesStatIcon>
            <EmployeesStatContent>
              <EmployeesStatNumber>{stats.active}</EmployeesStatNumber>
              <EmployeesStatLabel>Activos</EmployeesStatLabel>
            </EmployeesStatContent>
          </EmployeesStatCard>

          <EmployeesStatCard>
            <EmployeesStatIcon variant="departments">
              <Buildings size={24} weight="duotone" />
            </EmployeesStatIcon>
            <EmployeesStatContent>
              <EmployeesStatNumber>{stats.departments || 0}</EmployeesStatNumber>
              <EmployeesStatLabel>Departamentos</EmployeesStatLabel>
            </EmployeesStatContent>
          </EmployeesStatCard>

          <EmployeesStatCard>
            <EmployeesStatIcon variant="managers">
              <Shield size={24} weight="duotone" />
            </EmployeesStatIcon>
            <EmployeesStatContent>
              <EmployeesStatNumber>{stats.managers || 0}</EmployeesStatNumber>
              <EmployeesStatLabel>Supervisores</EmployeesStatLabel>
            </EmployeesStatContent>
          </EmployeesStatCard>
        </EmployeesStatsGrid>

        {/* Search and Filters */}
        <EmployeesControls>
          <EmployeesSearch>
            <EmployeesSearchIcon>
              <MagnifyingGlass size={18} weight="duotone" />
            </EmployeesSearchIcon>
            <EmployeesSearchInput
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </EmployeesSearch>

          {showFilters && (
            <EmployeeFilters 
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </EmployeesControls>

        {/* Results Info */}
        <EmployeesResults>
          <EmployeesResultsText>
            {filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? 's' : ''} encontrado{filteredEmployees.length !== 1 ? 's' : ''}
          </EmployeesResultsText>
        </EmployeesResults>

        {/* Employees Grid */}
        {filteredEmployees.length === 0 ? (
          <EmployeesEmpty>
            <UserList size={64} weight="duotone" />
            <EmployeesEmptyTitle>No se encontraron empleados</EmployeesEmptyTitle>
            <EmployeesEmptyText>
              {searchQuery || filters.role !== 'all' || filters.status !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay empleados registrados en el sistema'
              }
            </EmployeesEmptyText>
          </EmployeesEmpty>
        ) : (
          <EmployeesGrid>
            {filteredEmployees.map(employee => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                onStatusChange={handleStatusChange}
              />
            ))}
          </EmployeesGrid>
        )}

        {/* Employee Modal */}
        <EmployeeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          employeeId={selectedEmployeeId}
          onSuccess={handleModalSuccess}
        />

      </EmployeesContentWrapper>
    </EmployeesPageContainer>
  );
};

export default Employees;