// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; // Thêm sendPasswordResetEmail
import { auth } from '../services/firebaseConfig';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Đăng nhập thành công, AppNavigator sẽ tự động xử lý chuyển màn hình
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Sai thông tin', 'Email hoặc mật khẩu không chính xác.');
      } else {
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
      console.error(error);
    }
  };

  // --- HÀM MỚI: XỬ LÝ QUÊN MẬT KHẨU ---
  const handleForgotPassword = () => {
    Alert.prompt(
      "Đặt lại mật khẩu",
      "Vui lòng nhập email của bạn để nhận link đặt lại mật khẩu.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Gửi",
          // SỬA LỖI TYPESCRIPT BẰNG CÁCH THÊM (emailInput?: string)
          onPress: async (emailInput?: string) => { 
            if (emailInput) {
              try {
                await sendPasswordResetEmail(auth, emailInput);
                Alert.alert("Đã gửi!", "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.");
              } catch (error: any) {
                if (error.code === 'auth/user-not-found') {
                  Alert.alert('Lỗi', 'Không tìm thấy tài khoản nào với email này.');
                } else {
                  Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
                }
              }
            }
          },
        },
      ],
      'plain-text', // Kiểu hộp thoại
      email // Gợi ý email đang nhập dở
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F7F8FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: '#8A4FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#8A4FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: '#8A4FFF',
    textAlign: 'right',
    fontWeight: '600',
    marginBottom: 15,
    marginRight: 5,
  }
});

export default LoginScreen;