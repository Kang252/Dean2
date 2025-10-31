// src/navigation/AppNavigator.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';

// Import các màn hình và stack
import HomeStackNavigator from './HomeStackNavigator';
import MyPostsStackNavigator from './MyPostsStackNavigator';
import ChatStackNavigator from './ChatStackNavigator'; // <-- THÊM IMPORT NÀY
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PostScreen from '../screens/PostScreen';
import AccountScreen from '../screens/AccountScreen';

// --- Cụm AuthNavigator không đổi ---
const AuthStack = createNativeStackNavigator();
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
  </AuthStack.Navigator>
);

// --- Cụm MainAppNavigator được cập nhật ---
const Tab = createBottomTabNavigator();
const MainAppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'HomeStack') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Post') {
          iconName = focused ? 'add-circle' : 'add-circle-outline';
        } else if (route.name === 'Messages') { // <-- THÊM ĐIỀU KIỆN ICON
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'MyPosts') {
          iconName = focused ? 'list-circle' : 'list-circle-outline';
        } else if (route.name === 'Account') {
          iconName = focused ? 'person-circle' : 'person-circle-outline';
        }
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#8A4FFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen 
      name="HomeStack"
      component={HomeStackNavigator} 
      options={{ title: 'Trang chủ' }} 
    />
    <Tab.Screen name="Post" component={PostScreen} options={{ title: 'Đăng tin' }} />
    
    {/* --- THÊM TAB TIN NHẮN MỚI --- */}
    <Tab.Screen 
      name="Messages"
      component={ChatStackNavigator}
      options={{ title: 'Tin nhắn' }} 
    />

    <Tab.Screen 
      name="MyPosts" 
      component={MyPostsStackNavigator} 
      options={{ title: 'Tin của tôi' }} 
    />
    <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Tài khoản' }} />
  </Tab.Navigator>
);

// --- Bộ điều hướng gốc không đổi ---
const AppNavigator = () => { 
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {currentUser ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;