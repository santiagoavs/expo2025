// components/Layers/LayersPanel.jsx
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Eye,
  EyeSlash,
  Lock,
  LockOpen,
  TextT,
  Image,
  Rectangle,
  Circle,
  Triangle
} from '@phosphor-icons/react';

const LayersPanelContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(31, 100, 191, 0.3)',
  boxShadow: '0 8px 32px rgba(1, 3, 38, 0.15)',
  padding: theme.spacing(2)
}));

const LayerItem = styled(ListItem)(({ theme, selected }) => ({
  border: selected ? `2px solid #1F64BF` : `1px solid #e0e0e0`,
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  backgroundColor: selected ? 'rgba(31, 100, 191, 0.1)' : 'white',
  '&:hover': {
    backgroundColor: 'rgba(31, 100, 191, 0.05)'
  }
}));

// Componente SortableItem
const SortableItem = ({ element, isSelected, onSelectElement, onToggleVisibility, onToggleLock, getElementIcon, getElementName }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <LayerItem
      ref={setNodeRef}
      style={style}
      selected={isSelected}
      onClick={() => onSelectElement(element.id)}
      {...attributes}
      {...listeners}
    >
      <ListItemIcon>
        {getElementIcon(element.type)}
      </ListItemIcon>
      
      <ListItemText
        primary={getElementName(element)}
        secondary={
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip
              label={element.type}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: '20px' }}
            />
            <Typography variant="caption" color="text.secondary">
              ({Math.round(element.x)}, {Math.round(element.y)})
            </Typography>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Tooltip title={element.visible !== false ? 'Ocultar' : 'Mostrar'}>
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(element.id);
            }}
            size="small"
          >
            {element.visible !== false ? <Eye size={16} /> : <EyeSlash size={16} />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title={element.draggable !== false ? 'Bloquear' : 'Desbloquear'}>
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(element.id);
            }}
            size="small"
          >
            {element.draggable !== false ? <LockOpen size={16} /> : <Lock size={16} />}
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </LayerItem>
  );
};

export const LayersPanel = ({
  elements,
  selectedIds,
  onSelectElement,
  onSelectMultiple,
  onReorderElements,
  onToggleVisibility,
  onToggleLock
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getElementIcon = (type) => {
    switch (type) {
      case 'text':
        return <TextT size={20} />;
      case 'image':
        return <Image size={20} />;
      case 'rect':
        return <Rectangle size={20} />;
      case 'circle':
        return <Circle size={20} />;
      case 'line':
        return <Triangle size={20} />;
      default:
        return <Rectangle size={20} />;
    }
  };

  const getElementName = (element) => {
    switch (element.type) {
      case 'text':
        return element.text?.substring(0, 20) || 'Texto sin contenido';
      case 'image':
        return element.originalName || 'Imagen';
      default:
        return `${element.type.charAt(0).toUpperCase()}${element.type.slice(1)}`;
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = elements.findIndex((item) => item.id === active.id);
      const newIndex = elements.findIndex((item) => item.id === over.id);

      onReorderElements(arrayMove(elements, oldIndex, newIndex));
    }
  };

  return (
    <LayersPanelContainer>
      <Typography variant="h6" color="primary" gutterBottom>
        Capas ({elements.length})
      </Typography>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
          <List>
            {elements.map((element) => {
              const isSelected = selectedIds.includes(element.id);
              
              return (
                <SortableItem
                  key={element.id}
                  element={element}
                  isSelected={isSelected}
                  onSelectElement={onSelectElement}
                  onToggleVisibility={onToggleVisibility}
                  onToggleLock={onToggleLock}
                  getElementIcon={getElementIcon}
                  getElementName={getElementName}
                />
              );
            })}
          </List>
        </SortableContext>
      </DndContext>

      {elements.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <Typography variant="body2">
            No hay elementos en el diseño
          </Typography>
        </Box>
      )}
    </LayersPanelContainer>
  );
};