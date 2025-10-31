// src/navigation/ChatStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatListScreen from '../screens/ChatListScreen'; // Sẽ tạo ở bước 2
import ChatScreen from '../screens/ChatScreen';

// Định nghĩa các màn hình mà stack này sẽ quản lý
export type ChatStackParamList = {
  ChatList: undefined; // Màn hình danh sách chat
  Chat: { chatId: string, chatName: string }; // Màn hình chat chi tiết
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

const ChatStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default ChatStackNavigator;