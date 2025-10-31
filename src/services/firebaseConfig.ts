// src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Dữ liệu cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyBpdqcvc72y2WpQ6zpOqgYo1OTw_LRKWHY",
  authDomain: "lostandfoundapp-f1385.firebaseapp.com",
  projectId: "lostandfoundapp-f1385",
  storageBucket: "lostandfoundapp-f1385.appspot.com",
  messagingSenderId: "419060454681",
  appId: "1:419060454681:ios:2b6cd92daf4ab16b85e188" // <-- Tìm giá trị này trong Firebase Console
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với Persistence (để lưu trạng thái đăng nhập)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Khởi tạo Firestore Database
export const db = getFirestore(app);