// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Item } from '../data/types';
import ItemCard from '../components/common/ItemCard';
import { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { db } from '../services/firebaseConfig';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeList'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [items, setItems] = useState<Item[]>([]); // Danh sách gốc từ Firestore
  const [loading, setLoading] = useState(true);

  // --- THÊM STATE MỚI ---
  const [searchQuery, setSearchQuery] = useState(''); // Lưu nội dung tìm kiếm
  const [filteredItems, setFilteredItems] = useState<Item[]>([]); // Lưu danh sách đã lọc

  // Lấy dữ liệu từ Firestore (logic này không đổi)
  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems: Item[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({
          id: doc.id,
          ...doc.data()
        } as Item);
      });
      setItems(fetchedItems); // Cập nhật danh sách gốc
      setFilteredItems(fetchedItems); // Cập nhật danh sách lọc (ban đầu)
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- THÊM LOGIC LỌC TÌM KIẾM ---
  useEffect(() => {
    if (searchQuery === '') {
      // Nếu không tìm kiếm gì, hiển thị tất cả
      setFilteredItems(items);
    } else {
      // Nếu có tìm kiếm, lọc danh sách
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter((item) => {
        return (
          item.itemName.toLowerCase().includes(lowercasedQuery) ||
          item.description.toLowerCase().includes(lowercasedQuery) ||
          item.location.toLowerCase().includes(lowercasedQuery) ||
          item.category.toLowerCase().includes(lowercasedQuery)
        );
      });
      setFilteredItems(filtered);
    }
  }, [searchQuery, items]); // Chạy lại khi nội dung tìm kiếm hoặc danh sách gốc thay đổi

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chào mừng trở lại!</Text>
        <Text style={styles.headerSubtitle}>Tìm mọi thứ bạn cần</Text>
      </View>

      {/* CẬP NHẬT THANH TÌM KIẾM */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput 
          placeholder="Tìm kiếm đồ vật, mô tả, vị trí..." 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery} // Cập nhật state khi gõ
        />
      </View>

      {/* CẬP NHẬT FLATLIST */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems} // Hiển thị danh sách đã lọc
          renderItem={({ item }) => <ItemCard item={item} navigation={navigation} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'gray',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    margin: 20,
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
  },
  list: {
    paddingHorizontal: 10,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: 'gray',
  },
});

export default HomeScreen;