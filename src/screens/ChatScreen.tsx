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

// Chúng ta vẫn cần import KeyboardProvider, nhưng bọc ở App.tsx
// (Hãy chắc chắn bạn đã bọc AppNavigator bằng KeyboardProvider trong App.tsx)
import { KeyboardProvider } from 'react-native-keyboard-controller';

type ChatScreenRouteProp = RouteProp<ChatStackParamList, 'Chat'>;

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ChatScreenRouteProp>();
  const { chatId, chatName } = route.params;

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // --- SỬA LỖI: Thêm state để kiểm soát input ---
  const [inputText, setInputText] = useState("");

  const giftedChatUser = useMemo(() => {
    if (currentUser) {
      return { _id: currentUser.uid };
    }
    return { _id: '' }; 
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
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
  }, [chatId, currentUser]);

  // Tách hàm onSend ra
  const handleSend = useCallback(async (messages: IMessage[] = []) => {
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

  // --- SỬA LỖI: Tạo hàm wrapper cho onSend ---
  // Hàm này sẽ được gọi bởi GiftedChat
  const onSendWrapper = (messages: IMessage[]) => {
    handleSend(messages); // Gửi tin nhắn lên Firebase
    setInputText(""); // Xóa văn bản trong state của chúng ta
  };


  if (authLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    navigation.goBack();
    return null;
  }

  // Lưu ý: Đảm bảo App.tsx đã được bọc bằng KeyboardProvider
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
          user={giftedChatUser}
          placeholder="Nhập tin nhắn..."
          
          // --- SỬA LỖI: Thêm 2 props dưới đây ---
          text={inputText} // 1. Cung cấp text từ state
          onInputTextChanged={text => setInputText(text)} // 2. Cập nhật state khi gõ

          // --- SỬA LỖI: Gọi hàm wrapper ---
          onSend={onSendWrapper} 
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