// src/screens/MyPostsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

import { db, auth } from '../services/firebaseConfig';
import { Item } from '../data/types';
import ItemCard from '../components/common/ItemCard';
import { MyPostsStackParamList } from '../navigation/MyPostsStackNavigator'; // Sẽ tạo ở bước 2

type MyPostsNavigationProp = NativeStackNavigationProp<MyPostsStackParamList, 'MyPostsList'>;

const MyPostsScreen = () => {
  const navigation = useNavigation<MyPostsNavigationProp>();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Tạo query để lấy tin đăng CỦA người dùng hiện tại
    const q = query(
      collection(db, "items"), 
      where("userId", "==", user.uid), // <-- ĐÂY LÀ BỘ LỌC QUAN TRỌNG
      orderBy("createdAt", "desc")
    );

    // 2. Lắng nghe thay đổi
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems: Item[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({
          id: doc.id,
          ...doc.data()
        } as Item);
      });
      setMyItems(fetchedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin đăng của tôi</Text>
      </View>
      
      {myItems.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa đăng tin nào.</Text>
      ) : (
        <FlatList
          data={myItems}
          renderItem={({ item }) => <ItemCard item={item} navigation={navigation as any} />} // Tạm thời dùng 'as any'
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  list: {
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
  },
});

export default MyPostsScreen;