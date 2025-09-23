// components/PaymentMethodModals/PaymentActionButtons.jsx - Botones de acción rápida para métodos de pago
import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Plus,
  Gear,
  ChartBar,
  CreditCard,
  CurrencyDollar,
  Bank
} from '@phosphor-icons/react';

const PaymentActionButtons = ({ 
  onOpenConfigModal, 
  onOpenStatsModal,
  configs = []
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const actionButtons = [
    {
      id: 'config',
      label: 'Configurar Métodos',
      icon: Gear,
      color: '#1F64BF',
      onClick: () => onOpenConfigModal(),
      description: 'Gestionar métodos de pago del sistema'
    },
    {
      id: 'stats',
      label: 'Estadísticas',
      icon: ChartBar,
      color: '#10B981',
      onClick: () => onOpenStatsModal(),
      description: 'Ver estadísticas de pagos'
    }
  ];

  if (isMobile) {
    return (
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {actionButtons.map((button) => {
          const IconComponent = button.icon;
          return (
            <Tooltip key={button.id} title={button.description} placement="top">
              <Button
                onClick={button.onClick}
                variant="contained"
                startIcon={<IconComponent size={20} weight="bold" />}
              sx={{
                background: `linear-gradient(135deg, ${button.color} 0%, ${alpha(button.color, 0.8)} 100%)`,
                color: 'white',
                borderRadius: 2.5,
                py: 1.5,
                px: 3,
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                fontFamily: "'Mona Sans'",
                boxShadow: `0 4px 16px ${alpha(button.color, 0.24)}`,
                minHeight: 48,
                flex: isSmallMobile ? 1 : 'none',
                minWidth: isSmallMobile ? 'auto' : 160,
                position: 'relative',
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(button.color, 0.8)} 0%, ${button.color} 100%)`,
                  boxShadow: `0 6px 24px ${alpha(button.color, 0.32)}`,
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              {button.label}
              {button.count !== undefined && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    minWidth: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#EF4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: "'Mona Sans'"
                  }}
                >
                  {button.count}
                </Box>
              )}
            </Button>
          </Tooltip>
          );
        })}
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={3}
      sx={{
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {actionButtons.map((button) => {
        const IconComponent = button.icon;
        return (
          <Tooltip key={button.id} title={button.description} placement="top">
            <Button
              onClick={button.onClick}
              variant="contained"
              startIcon={<IconComponent size={20} weight="bold" />}
            sx={{
              background: `linear-gradient(135deg, ${button.color} 0%, ${alpha(button.color, 0.8)} 100%)`,
              color: 'white',
              borderRadius: 2.5,
              py: 2,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              fontFamily: "'Mona Sans'",
              boxShadow: `0 4px 16px ${alpha(button.color, 0.24)}`,
              minHeight: 56,
              minWidth: 180,
              position: 'relative',
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(button.color, 0.8)} 0%, ${button.color} 100%)`,
                boxShadow: `0 6px 24px ${alpha(button.color, 0.32)}`,
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            {button.label}
            {button.count !== undefined && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  minWidth: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#EF4444',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: "'Mona Sans'"
                }}
              >
                {button.count}
              </Box>
            )}
          </Button>
        </Tooltip>
        );
      })}
    </Stack>
  );
};

export default PaymentActionButtons;
