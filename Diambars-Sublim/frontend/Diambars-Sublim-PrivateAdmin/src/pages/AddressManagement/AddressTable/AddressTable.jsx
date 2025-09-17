import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Button,
  Chip,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  styled,
  alpha,
  useTheme
} from '@mui/material';
import {
  PencilSimple as EditIcon,
  Trash as DeleteIcon,
  Star as StarIcon,
  StarFill as StarFillIcon,
  DotsThreeVertical as MoreIcon,
  MapPin as LocationIcon,
  Phone as PhoneIcon,
  User as UserIcon,
  House as HomeIcon,
  Navigation as DepartmentIcon,
  Check as CheckIcon,
  X as XIcon,
  ArrowUp as SortUpIcon,
  ArrowDown as SortDownIcon
} from '@phosphor-icons/react';

// ================ ESTILOS STYLED COMPONENTS ================
const AddressTableContainer = styled(Paper)(({ theme }) => ({
  background: 'white',
  borderRadius: '16px',
  border: `1px solid ${alpha('#1F64BF', 0.08)}`,
  boxShadow: '0 2px 16px rgba(1, 3, 38, 0.06)',
  overflow: 'hidden',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    borderRadius: '12px',
  }
}));

const AddressTableHeader = styled(Box)(({ theme }) => ({
  padding: '24px 32px',
  borderBottom: `1px solid ${alpha('#1F64BF', 0.08)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: alpha('#1F64BF', 0.02),
  [theme.breakpoints.down('lg')]: {
    padding: '20px 24px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '16px 20px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const AddressTableTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
  }
}));

const AddressBatchActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('md')]: {
    gap: '8px',
    flexWrap: 'wrap',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'center',
  }
}));

const AddressBatchButton = styled(Button)(({ theme, variant: buttonVariant }) => {
  const variants = {
    activate: {
      color: '#10B981',
      backgroundColor: alpha('#10B981', 0.1),
      '&:hover': { backgroundColor: alpha('#10B981', 0.15) }
    },
    deactivate: {
      color: '#F59E0B',
      backgroundColor: alpha('#F59E0B', 0.1),
      '&:hover': { backgroundColor: alpha('#F59E0B', 0.15) }
    },
    delete: {
      color: '#EF4444',
      backgroundColor: alpha('#EF4444', 0.1),
      '&:hover': { backgroundColor: alpha('#EF4444', 0.15) }
    }
  };

  return {
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'none',
    fontFamily: "'Mona Sans'",
    minWidth: 'auto',
    ...(variants[buttonVariant] || {}),
    [theme.breakpoints.down('sm')]: {
      padding: '6px 10px',
      fontSize: '0.75rem',
    }
  };
});

const AddressStyledTable = styled(Table)({
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${alpha('#1F64BF', 0.05)}`,
    fontFamily: "'Mona Sans'",
  }
});

const AddressTableHeaderCell = styled(TableCell)(({ theme, sortable }) => ({
  backgroundColor: alpha('#1F64BF', 0.03),
  color: '#010326',
  fontWeight: 600,
  fontSize: '0.85rem',
  padding: '16px 12px',
  whiteSpace: 'nowrap',
  fontFamily: "'Mona Sans'",
  cursor: sortable ? 'pointer' : 'default',
  userSelect: 'none',
  transition: 'all 0.2s ease',
  '&:hover': sortable ? {
    backgroundColor: alpha('#1F64BF', 0.06),
  } : {},
  [theme.breakpoints.down('lg')]: {
    padding: '12px 8px',
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('md')]: {
    padding: '10px 6px',
    fontSize: '0.75rem',
  }
}));

const AddressTableDataCell = styled(TableCell)(({ theme }) => ({
  padding: '16px 12px',
  fontSize: '0.9rem',
  color: '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('lg')]: {
    padding: '12px 8px',
    fontSize: '0.85rem',
  },
  [theme.breakpoints.down('md')]: {
    padding: '10px 6px',
    fontSize: '0.8rem',
  }
}));

const AddressTableRow = styled(TableRow)(({ theme, selected }) => ({
  backgroundColor: selected ? alpha('#1F64BF', 0.05) : 'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected ? alpha('#1F64BF', 0.08) : alpha('#1F64BF', 0.03),
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(31, 100, 191, 0.1)',
  }
}));

const AddressStatusChip = styled(Chip)(({ status }) => {
  const statusConfig = {
    active: {
      backgroundColor: alpha('#10B981', 0.1),
      color: '#10B981',
      border: `1px solid ${alpha('#10B981', 0.2)}`
    },
    inactive: {
      backgroundColor: alpha('#EF4444', 0.1),
      color: '#EF4444',
      border: `1px solid ${alpha('#EF4444', 0.2)}`
    }
  };

  return {
    fontSize: '0.7rem',
    fontWeight: 600,
    height: '24px',
    fontFamily: "'Mona Sans'",
    ...(statusConfig[status] || statusConfig.active)
  };
});

const AddressDefaultBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 6px',
  borderRadius: '6px',
  backgroundColor: alpha('#F59E0B', 0.1),
  color: '#F59E0B',
  fontSize: '0.7rem',
  fontWeight: 600,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
    padding: '2px 4px',
  }
}));

const AddressUserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  [theme.breakpoints.down('md')]: {
    gap: '1px',
  }
}));

const AddressUserName = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#010326',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const AddressUserEmail = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#032CA6',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '0.7rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
  }
}));

const AddressLocationInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxWidth: '200px',
  [theme.breakpoints.down('lg')]: {
    maxWidth: '150px',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '120px',
  }
}));

const AddressMainAddress = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#010326',
  fontFamily: "'Mona Sans'",
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
    WebkitLineClamp: 1,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
  }
}));

const AddressLocationDetails = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#032CA6',
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '0.7rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
  }
}));

const AddressActionButton = styled(IconButton)(({ theme, variant: actionVariant }) => {
  const variants = {
    edit: {
      color: '#1F64BF',
      backgroundColor: alpha('#1F64BF', 0.1),
      '&:hover': { backgroundColor: alpha('#1F64BF', 0.15) }
    },
    delete: {
      color: '#EF4444',
      backgroundColor: alpha('#EF4444', 0.1),
      '&:hover': { backgroundColor: alpha('#EF4444', 0.15) }
    },
    default: {
      color: '#F59E0B',
      backgroundColor: alpha('#F59E0B', 0.1),
      '&:hover': { backgroundColor: alpha('#F59E0B', 0.15) }
    }
  };

  return {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    ...(variants[actionVariant] || variants.edit),
    [theme.breakpoints.down('md')]: {
      width: '28px',
      height: '28px',
    }
  };
});

const AddressPaginationContainer = styled(Box)(({ theme }) => ({
  padding: '20px 32px',
  borderTop: `1px solid ${alpha('#1F64BF', 0.08)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: alpha('#1F64BF', 0.02),
  [theme.breakpoints.down('lg')]: {
    padding: '16px 24px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '16px 20px',
    flexDirection: 'column',
    gap: '12px',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  }
}));

const AddressPaginationInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: '#032CA6',
  fontWeight: 500,
  fontFamily: "'Mona Sans'",
  [theme.breakpoints.down('md')]: {
    fontSize: '0.8rem',
  }
}));

const AddressPaginationControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  [theme.breakpoints.down('md')]: {
    gap: '8px',
  }
}));

const AddressPaginationButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.85rem',
  fontWeight: 600,
  textTransform: 'none',
  fontFamily: "'Mona Sans'",
  color: '#1F64BF',
  border: `1px solid ${alpha('#1F64BF', 0.2)}`,
  '&:hover': {
    backgroundColor: alpha('#1F64BF', 0.05),
    borderColor: '#1F64BF',
  },
  '&:disabled': {
    color: alpha('#1F64BF', 0.4),
    borderColor: alpha('#1F64BF', 0.1),
  },
  [theme.breakpoints.down('md')]: {
    padding: '6px 12px',
    fontSize: '0.8rem',
  }
}));

const AddressLoadingRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: 'transparent',
  }
});

// ================ COMPONENTE PRINCIPAL ================
const AddressTable = ({
  addresses = [],
  loading = false,
  selectedAddresses = [],
  onEdit,
  onDelete,
  onSetDefault,
  onBatchAction,
  onSelectionChange,
  pagination = {},
  onPageChange,
  onSort
}) => {
  const theme = useTheme();
  
  // ==================== ESTADOS LOCALES ====================
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);

  // ==================== DATOS CALCULADOS ====================
  const isAllSelected = addresses.length > 0 && selectedAddresses.length === addresses.length;
  const isIndeterminate = selectedAddresses.length > 0 && selectedAddresses.length < addresses.length;

  const sortedAddresses = useMemo(() => {
    if (!addresses.length) return [];
    
    const sorted = [...addresses].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Manejar casos especiales
      if (sortField === 'userName') {
        aValue = a.userName?.toLowerCase() || '';
        bValue = b.userName?.toLowerCase() || '';
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [addresses, sortField, sortDirection]);

  // ==================== MANEJADORES ====================
  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(addresses.map(addr => addr.id));
    }
  };

  const handleSelectAddress = (addressId) => {
    const newSelected = selectedAddresses.includes(addressId)
      ? selectedAddresses.filter(id => id !== addressId)
      : [...selectedAddresses, addressId];
    
    onSelectionChange?.(newSelected);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    onSort?.({ field, direction: sortDirection === 'asc' ? 'desc' : 'asc' });
  };

  const handleMenuOpen = (event, address) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowForMenu(address);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowForMenu(null);
  };

  const handleMenuAction = (action) => {
    if (!selectedRowForMenu) return;
    
    switch (action) {
      case 'edit':
        onEdit?.(selectedRowForMenu);
        break;
      case 'delete':
        onDelete?.(selectedRowForMenu.id);
        break;
      case 'setDefault':
        onSetDefault?.(selectedRowForMenu.id);
        break;
    }
    
    handleMenuClose();
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortUpIcon size={14} /> : <SortDownIcon size={14} />;
  };

  // ==================== RENDER LOADING ====================
  const renderLoadingRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <AddressLoadingRow key={`loading-${index}`}>
        <AddressTableDataCell padding="checkbox">
          <Skeleton variant="rectangular" width={18} height={18} />
        </AddressTableDataCell>
        <AddressTableDataCell>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </AddressTableDataCell>
        <AddressTableDataCell>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
        </AddressTableDataCell>
        <AddressTableDataCell>
          <Skeleton variant="text" width="75%" />
        </AddressTableDataCell>
        <AddressTableDataCell>
          <Skeleton variant="rectangular" width={60} height={24} />
        </AddressTableDataCell>
        <AddressTableDataCell>
          <Skeleton variant="text" width="80%" />
        </AddressTableDataCell>
        <AddressTableDataCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </AddressTableDataCell>
      </AddressLoadingRow>
    ));
  };

  // ==================== RENDER PRINCIPAL ====================
  return (
    <AddressTableContainer>
      {/* Header con acciones en lote */}
      {selectedAddresses.length > 0 && (
        <AddressTableHeader>
          <AddressTableTitle>
            {selectedAddresses.length} dirección{selectedAddresses.length !== 1 ? 'es' : ''} seleccionada{selectedAddresses.length !== 1 ? 's' : ''}
          </AddressTableTitle>
          
          <AddressBatchActions>
            <AddressBatchButton
              variant="activate"
              size="small"
              onClick={() => onBatchAction?.('activate')}
            >
              <CheckIcon size={14} />
              Activar
            </AddressBatchButton>
            
            <AddressBatchButton
              variant="deactivate"
              size="small"
              onClick={() => onBatchAction?.('deactivate')}
            >
              <XIcon size={14} />
              Desactivar
            </AddressBatchButton>
            
            <AddressBatchButton
              variant="delete"
              size="small"
              onClick={() => onBatchAction?.('delete')}
            >
              <DeleteIcon size={14} />
              Eliminar
            </AddressBatchButton>
          </AddressBatchActions>
        </AddressTableHeader>
      )}

      {/* Tabla */}
      <TableContainer>
        <AddressStyledTable>
          <TableHead>
            <TableRow>
              <AddressTableHeaderCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  size="small"
                  sx={{ color: '#1F64BF' }}
                />
              </AddressTableHeaderCell>
              
              <AddressTableHeaderCell
                sortable
                onClick={() => handleSort('userName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UserIcon size={16} />
                  Usuario
                  {renderSortIcon('userName')}
                </Box>
              </AddressTableHeaderCell>
              
              <AddressTableHeaderCell
                sortable
                onClick={() => handleSort('address')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon size={16} />
                  Dirección
                  {renderSortIcon('address')}
                </Box>
              </AddressTableHeaderCell>
              
              <AddressTableHeaderCell
                sortable
                onClick={() => handleSort('department')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DepartmentIcon size={16} />
                  Ubicación
                  {renderSortIcon('department')}
                </Box>
              </AddressTableHeaderCell>
              
              <AddressTableHeaderCell>
                Estado
              </AddressTableHeaderCell>
              
              <AddressTableHeaderCell
                sortable
                onClick={() => handleSort('createdAt')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Fecha
                  {renderSortIcon('createdAt')}
                </Box>
              </AddressTableHeaderCell>
              
              <AddressTableHeaderCell align="center">
                Acciones
              </AddressTableHeaderCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              renderLoadingRows()
            ) : sortedAddresses.length > 0 ? (
              sortedAddresses.map((address) => (
                <AddressTableRow
                  key={address.id}
                  selected={selectedAddresses.includes(address.id)}
                >
                  <AddressTableDataCell padding="checkbox">
                    <Checkbox
                      checked={selectedAddresses.includes(address.id)}
                      onChange={() => handleSelectAddress(address.id)}
                      size="small"
                      sx={{ color: '#1F64BF' }}
                    />
                  </AddressTableDataCell>
                  
                  <AddressTableDataCell>
                    <AddressUserInfo>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddressUserName>{address.userName}</AddressUserName>
                        {address.isDefault && (
                          <AddressDefaultBadge>
                            <StarFillIcon size={10} />
                            Principal
                          </AddressDefaultBadge>
                        )}
                      </Box>
                      {address.userEmail && (
                        <AddressUserEmail>{address.userEmail}</AddressUserEmail>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <PhoneIcon size={12} color="#032CA6" />
                        <AddressUserEmail>{address.formattedPhone}</AddressUserEmail>
                      </Box>
                    </AddressUserInfo>
                  </AddressTableDataCell>
                  
                  <AddressTableDataCell>
                    <AddressLocationInfo>
                      <AddressMainAddress title={address.address}>
                        {address.address}
                      </AddressMainAddress>
                      <AddressLocationDetails>
                        {address.label}
                      </AddressLocationDetails>
                      {address.additionalDetails && (
                        <AddressLocationDetails>
                          📍 {address.additionalDetails}
                        </AddressLocationDetails>
                      )}
                    </AddressLocationInfo>
                  </AddressTableDataCell>
                  
                  <AddressTableDataCell>
                    <AddressLocationInfo>
                      <AddressMainAddress>
                        {address.municipality}
                      </AddressMainAddress>
                      <AddressLocationDetails>
                        {address.department}
                      </AddressLocationDetails>
                      {address.coordinates.length > 0 && (
                        <AddressLocationDetails>
                          🗺️ {address.formattedCoordinates}
                        </AddressLocationDetails>
                      )}
                    </AddressLocationInfo>
                  </AddressTableDataCell>
                  
                  <AddressTableDataCell>
                    <AddressStatusChip
                      status={address.isActive ? 'active' : 'inactive'}
                      label={address.statusText}
                      size="small"
                    />
                  </AddressTableDataCell>
                  
                  <AddressTableDataCell>
                    <Typography variant="body2" sx={{ 
                      fontSize: '0.8rem', 
                      color: '#032CA6',
                      fontFamily: "'Mona Sans'" 
                    }}>
                      {address.formattedDate}
                    </Typography>
                  </AddressTableDataCell>
                  
                  <AddressTableDataCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Editar dirección">
                        <AddressActionButton
                          variant="edit"
                          size="small"
                          onClick={() => onEdit?.(address)}
                        >
                          <EditIcon size={16} />
                        </AddressActionButton>
                      </Tooltip>
                      
                      {!address.isDefault && (
                        <Tooltip title="Establecer como principal">
                          <AddressActionButton
                            variant="default"
                            size="small"
                            onClick={() => onSetDefault?.(address.id)}
                          >
                            <StarIcon size={16} />
                          </AddressActionButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Más opciones">
                        <AddressActionButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, address)}
                        >
                          <MoreIcon size={16} />
                        </AddressActionButton>
                      </Tooltip>
                    </Box>
                  </AddressTableDataCell>
                </AddressTableRow>
              ))
            ) : (
              <TableRow>
                <AddressTableDataCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <LocationIcon size={48} color={alpha('#1F64BF', 0.5)} />
                    <Typography variant="body1" sx={{ 
                      color: '#032CA6', 
                      fontWeight: 500,
                      fontFamily: "'Mona Sans'" 
                    }}>
                      No se encontraron direcciones
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: alpha('#032CA6', 0.7),
                      fontFamily: "'Mona Sans'" 
                    }}>
                      Intenta ajustar los filtros de búsqueda
                    </Typography>
                  </Box>
                </AddressTableDataCell>
              </TableRow>
            )}
          </TableBody>
        </AddressStyledTable>
      </TableContainer>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <AddressPaginationContainer>
          <AddressPaginationInfo>
            Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de {pagination.totalItems} direcciones
          </AddressPaginationInfo>
          
          <AddressPaginationControls>
            <AddressPaginationButton
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
            >
              ← Anterior
            </AddressPaginationButton>
            
            <Typography sx={{ 
              fontSize: '0.85rem', 
              color: '#032CA6', 
              fontWeight: 600, 
              px: 2,
              fontFamily: "'Mona Sans'" 
            }}>
              {pagination.currentPage} de {pagination.totalPages}
            </Typography>
            
            <AddressPaginationButton
              disabled={!pagination.hasNext}
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
            >
              Siguiente →
            </AddressPaginationButton>
          </AddressPaginationControls>
        </AddressPaginationContainer>
      )}

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: `1px solid ${alpha('#1F64BF', 0.1)}`,
            minWidth: '180px'
          }
        }}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <EditIcon size={16} color="#1F64BF" />
          </ListItemIcon>
          <ListItemText 
            primary="Editar dirección" 
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontFamily: "'Mona Sans'"
            }}
          />
        </MenuItem>
        
        {selectedRowForMenu && !selectedRowForMenu.isDefault && (
          <MenuItem onClick={() => handleMenuAction('setDefault')}>
            <ListItemIcon>
              <StarIcon size={16} color="#F59E0B" />
            </ListItemIcon>
            <ListItemText 
              primary="Establecer como principal" 
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontFamily: "'Mona Sans'"
              }}
            />
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={() => handleMenuAction('delete')}
          sx={{ color: '#EF4444' }}
        >
          <ListItemIcon>
            <DeleteIcon size={16} color="#EF4444" />
          </ListItemIcon>
          <ListItemText 
            primary="Eliminar dirección" 
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontFamily: "'Mona Sans'",
              color: '#EF4444'
            }}
          />
        </MenuItem>
      </Menu>
    </AddressTableContainer>
  );
};

export default AddressTable;