// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Thêm updateProfile
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const SignUpScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState(''); // Thêm state cho Tên
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (email === '' || password === '' || fullName === '') { // Thêm kiểm tra fullName
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập một địa chỉ email đúng định dạng.');
      return;
    }

    try {
      // 1. Tạo tài khoản trên Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Cập nhật hồ sơ Auth (lưu tên hiển thị và ảnh mặc định)
      await updateProfile(user, {
        displayName: fullName,
        photoURL: "" // Sẽ cập nhật sau
      });

      // 3. TẠO TÀI LIỆU TRÊN FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'student',
        displayName: fullName, // Thêm tên
        avatarUrl: "" // Thêm ảnh đại diện
      });

      Alert.alert('Thành công', 'Tài khoản đã được tạo thành công!');
      navigation.navigate('Login');
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Lỗi', 'Email này đã được sử dụng.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      } else {
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản mới</Text>
      
      {/* THÊM Ô HỌ VÀ TÊN */}
      <TextInput
        style={styles.input}
        placeholder="Nhập họ và tên của bạn"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

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
      
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
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
  }
});

export default SignUpScreen;