// src/screens/ChatScreen.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  View, TouchableOpacity, Text, StyleSheet, 
  ActivityIndicator, Platform 
} from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { ChatStackParamList } from '../navigation/ChatStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

type ChatScreenRouteProp = RouteProp<ChatStackParamList, 'Chat'>;

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId, chatName } = route.params;

  const [messages, setMessages] = useState<IMessage[]>([]);
  
  // --- SỬA LỖI: Thay đổi cách quản lý state người dùng ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // 1. Khởi tạo là null
  const [authLoading, setAuthLoading] = useState(true); // 2. Thêm state loading

  const giftedChatUser = useMemo(() => {
    // Nếu currentUser (từ state) tồn tại, tạo đối tượng user
    if (currentUser) {
      return { _id: currentUser.uid };
    }
    // Nếu không, trả về một đối tượng rỗng (sẽ không được dùng vì ta có check loading)
    return { _id: '' }; 
  }, [currentUser]);

  useEffect(() => {
    // 3. Listener này là nguồn chân lý duy nhất
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Đặt user (dù là null hay có giá trị)
      setAuthLoading(false); // Báo là đã kiểm tra auth xong
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    // Chỉ chạy khi đã kiểm tra auth VÀ có user
    if (!chatId || !currentUser) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          user: data.user as User,
        };
      });
      setMessages(allMessages);
    });

    return () => unsubscribeSnapshot();
  }, [chatId, currentUser]); // Thêm currentUser vào dependency

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    if (!currentUser) return;
    
    const messageToSend = messages[0];
    const { text } = messageToSend;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text,
      createdAt: serverTimestamp(),
      user: {
        _id: currentUser.uid,
        name: currentUser.displayName || currentUser.email,
        avatar: currentUser.photoURL || undefined,
      },
    });

  }, [chatId, currentUser]);

  // --- SỬA LỖI: 4. Check authLoading trước ---
  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  // Nếu đã hết loading VÀ vẫn không có user, quay lại
  if (!currentUser) {
    navigation.goBack();
    return null;
  }

  // --- Chỉ render phần dưới đây khi authLoading=false VÀ currentUser có giá trị ---
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <View style={{ width: 40 }} /> 
        </View>
      </SafeAreaView>
      
      <View style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={giftedChatUser} // <-- Đối tượng này giờ đã ổn định
          placeholder="Nhập tin nhắn..."
          // Không cần disableComposer nữa, vì chúng ta đã check currentUser ở trên
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 50, // Chiều cao cố định
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ChatScreen;