// src/navigation/MyPostsStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyPostsScreen from '../screens/MyPostsScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import { Item } from '../data/types';

export type MyPostsStackParamList = {
  MyPostsList: undefined;
  ItemDetail: { item: Item };
};

const Stack = createNativeStackNavigator<MyPostsStackParamList>();

const MyPostsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPostsList" component={MyPostsScreen} />
      {/* Tái sử dụng màn hình ItemDetailScreen */}
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} /> 
    </Stack.Navigator>
  );
};

export default MyPostsStackNavigator;