// src/screens/ChatScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, TouchableOpacity, Text, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform 
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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!chatId) return;

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
  }, [chatId]);

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

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }

  return (
    // Sử dụng View bọc ngoài
    <View style={styles.container}>
      {/* 1. Header được bọc trong SafeAreaView riêng */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <View style={{ width: 40 }} /> 
        </View>
      </SafeAreaView>
      
      {/* 2. KeyboardAvoidingView bọc GiftedChat */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: currentUser.uid,
          }}
          placeholder="Nhập tin nhắn..."
        />
      </KeyboardAvoidingView>
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