// src/screens/ChatListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, orderBy, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { ChatStackParamList } from '../navigation/ChatStackNavigator';

// Định nghĩa kiểu cho một phòng chat
interface ChatRoom {
  id: string;
  itemName: string;
  createdAt: any;
  // Thêm các trường khác nếu bạn muốn hiển thị (ví dụ: tin nhắn cuối)
}

type ChatListNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

const ChatListScreen = () => {
  const navigation = useNavigation<ChatListNavigationProp>();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  // Dùng useFocusEffect để query chạy lại mỗi khi tab này được focus
  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Truy vấn tất cả các phòng chat có 'participantIds' chứa ID của người dùng hiện tại
      const q = query(
        collection(db, "chats"),
        where("participantIds", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms: ChatRoom[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ChatRoom));
        setChatRooms(rooms);
        setLoading(false);
      });

      return () => {
        unsubscribe(); // Hủy lắng nghe khi rời màn hình
      };
    }, [])
  );

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity 
      style={styles.chatRoomItem} 
      onPress={() => navigation.navigate('Chat', { chatId: item.id, chatName: item.itemName })}
    >
      <Ionicons name="chatbubbles-outline" size={30} color="#8A4FFF" />
      <View style={styles.chatRoomInfo}>
        <Text style={styles.chatRoomName}>{item.itemName}</Text>
        <Text style={styles.chatRoomHint}>Nhấn để xem tin nhắn</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn của bạn</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      ) : chatRooms.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có cuộc trò chuyện nào.</Text>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
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
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  chatRoomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
  },
  chatRoomInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatRoomName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  chatRoomHint: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ChatListScreen;