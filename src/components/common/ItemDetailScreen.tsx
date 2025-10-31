// src/screens/ItemDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { Ionicons } from '@expo/vector-icons';

type ItemDetailScreenRouteProp = RouteProp<HomeStackParamList, 'ItemDetail'>;

const ItemDetailScreen = () => {
  const route = useRoute<ItemDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { item } = route.params;
  const isLost = item.status === 'lost';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: isLost ? '#FF6B6B' : '#4CAF50' }
            ]}
          >
            <Text style={styles.statusText}>{isLost ? 'Đang tìm' : 'Đã nhặt được'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="gray" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={20} color="gray" />
            <Text style={styles.infoText}>{item.category}</Text>
          </View>
          <Text style={styles.descriptionHeader}>Mô tả chi tiết</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.contactButton}>
        <Text style={styles.contactButtonText}>Liên hệ người đăng</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { 
      position: 'absolute', 
      top: 10, 
      left: 10, 
      zIndex: 1, 
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: 20,
      padding: 5,
    },
    backButton: { },
    image: {
      width: '100%',
      height: 350,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    content: { padding: 20 },
    itemName: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
    statusBadge: { alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15, marginBottom: 20 },
    statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    infoText: { fontSize: 16, color: '#555', marginLeft: 10 },
    descriptionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    descriptionText: { fontSize: 16, color: '#555', lineHeight: 24 },
    contactButton: {
      backgroundColor: '#8A4FFF',
      margin: 20,
      padding: 18,
      borderRadius: 15,
      alignItems: 'center',
      elevation: 5,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

export default ItemDetailScreen;