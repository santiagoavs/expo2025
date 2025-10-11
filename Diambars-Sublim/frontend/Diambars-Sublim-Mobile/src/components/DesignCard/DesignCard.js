import React from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Card, Chip, Button, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DesignCard = ({ design, onView, onEdit, onClone, onQuote, loading }) => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const { width } = useWindowDimensions();

  const getStatusColor = (status) => {
    const statusColors = {
      draft: '#6B7280',
      pending: '#F59E0B',
      quoted: '#3B82F6',
      approved: '#10B981',
      rejected: '#EF4444',
      completed: '#059669',
      cancelled: '#6B7280',
      archived: '#6B7280'
    };
    return statusColors[status] || '#6B7280';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      draft: 'pencil',
      pending: 'clock',
      quoted: 'currency-usd',
      approved: 'check-circle',
      rejected: 'close-circle',
      completed: 'check-all',
      cancelled: 'cancel',
      archived: 'archive'
    };
    return statusIcons[status] || 'help-circle';
  };

  const styles = {
    card: {
      marginVertical: 4,
      borderRadius: 12,
      width: (width - 48) / 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    designImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    placeholderImage: {
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardContent: {
      marginBottom: 12,
    },
    designName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#010326',
      marginBottom: 8,
    },
    designInfo: {
      gap: 6,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    infoText: {
      fontSize: 12,
      color: '#6B7280',
      flex: 1,
    },
    priceText: {
      fontSize: 12,
      color: '#10B981',
      fontWeight: '600',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusChip: {
      backgroundColor: 'transparent',
      height: 32,
    },
    dateText: {
      fontSize: 10,
      color: '#9CA3AF',
    },
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header con imagen y acciones */}
        <View style={styles.cardHeader}>
          {design.previewImage ? (
            <Image 
              source={{ uri: design.previewImage }} 
              style={styles.designImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.designImage, styles.placeholderImage]}>
              <Icon name="palette" size={32} color="#6B7280" />
            </View>
          )}
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Icon name="dots-vertical" size={20} color="#6B7280" />
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={() => { setMenuVisible(false); onView(design.id); }} 
              title="Ver" 
              leadingIcon="eye"
            />
            {design.canEdit && (
              <Menu.Item 
                onPress={() => { setMenuVisible(false); onEdit(design.id); }} 
                title="Editar"
                leadingIcon="pencil"
              />
            )}
            <Menu.Item 
              onPress={() => { setMenuVisible(false); onClone(design.id); }} 
              title="Clonar"
              leadingIcon="content-copy"
            />
            {design.canQuote && (
              <Menu.Item 
                onPress={() => { setMenuVisible(false); onQuote(design.id); }} 
                title="Cotizar"
                leadingIcon="currency-usd"
              />
            )}
          </Menu>
        </View>

        {/* Información del diseño */}
        <View style={styles.cardContent}>
          <Text style={styles.designName} numberOfLines={2}>
            {design.name}
          </Text>
          
          <View style={styles.designInfo}>
            <View style={styles.infoRow}>
              <Icon name="account" size={14} color="#6B7280" />
              <Text style={styles.infoText} numberOfLines={1}>
                {design.clientName}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Icon name="package-variant" size={14} color="#6B7280" />
              <Text style={styles.infoText} numberOfLines={1}>
                {design.productName}
              </Text>
            </View>
            
            {design.price && (
              <View style={styles.infoRow}>
                <Icon name="currency-usd" size={14} color="#6B7280" />
                <Text style={styles.priceText}>
                  {design.formattedPrice}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer con estado y fecha */}
        <View style={styles.cardFooter}>
          <Chip 
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(design.status) }]}
            textStyle={{ 
              color: getStatusColor(design.status),
              fontSize: 12,
              marginVertical: 0,
            }}
            icon={() => (
              <Icon 
                name={getStatusIcon(design.status)} 
                size={14} 
                color={getStatusColor(design.status)} 
              />
            )}
          >
            {design.status}
          </Chip>
          
          <Text style={styles.dateText}>
            {design.daysAgo}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default DesignCard;