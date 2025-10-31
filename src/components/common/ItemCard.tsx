// src/components/common/ItemCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Item } from '../../data/types';

interface ItemCardProps {
  item: Item;
  navigation: any;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 20;

const ItemCard: React.FC<ItemCardProps> = ({ item, navigation }) => {
  const isLost = item.status === 'lost';
  const isResolved = item.isResolved || false; // Lấy trạng thái đã giải quyết

  const handlePress = () => {
    navigation.navigate('ItemDetail', { item: item });
  };

  return (
    <TouchableOpacity 
      style={[styles.cardContainer, isResolved && styles.resolvedCard]} // Áp style mờ
      onPress={handlePress}
    >
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      <View style={styles.infoContainer}>
        <Text style={styles.itemName} numberOfLines={2}>{item.itemName}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: isLost ? '#FF6B6B' : '#4CAF50' }
          ]}
        >
          <Text style={styles.statusText}>{isLost ? 'Đang tìm' : 'Đã nhặt được'}</Text>
        </View>
      </View>
      {/* Thêm nhãn "Đã giải quyết" */}
      {isResolved && (
        <View style={styles.resolvedOverlay}>
          <Text style={styles.resolvedText}>Đã giải quyết</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  resolvedCard: {
    opacity: 0.6, // Làm mờ card
  },
  image: {
    width: '100%',
    height: 120,
  },
  infoContainer: {
    padding: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  location: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resolvedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolvedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 5,
    borderRadius: 5,
  },
});

export default ItemCard;