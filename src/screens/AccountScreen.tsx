// src/screens/AccountScreen.tsx
import React, { useState, useEffect } from 'react';
// THÊM ScrollView VÀO DÒNG DƯỚI ĐÂY
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Thông tin Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dkdv4awgi';
const CLOUDINARY_UPLOAD_PRESET = 'lost_and_found_preset';

const AccountScreen = () => {
  const user = auth.currentUser;
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || '');
  const [loading, setLoading] = useState(false);

  // Lấy thông tin đầy đủ từ Firestore
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || user.email);
          setAvatarUrl(data.avatarUrl || user.photoURL);
        } else {
          setDisplayName(user.displayName || user.email || '');
          setAvatarUrl(user.photoURL || '');
        }
      });
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const fileName = uri.split('/').pop() || 'image.jpg';
    const fileType = fileName.endsWith('png') ? 'image/png' : 'image/jpeg';
    // @ts-ignore
    formData.append('file', { uri, name: fileName, type: fileType });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Không thể tải ảnh lên Cloudinary');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    let newAvatarUrl = avatarUrl;

    try {
      if (imageUri) {
        newAvatarUrl = await uploadImageToCloudinary(imageUri);
      }

      await updateProfile(user, {
        displayName: displayName,
        photoURL: newAvatarUrl
      });

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
        displayName: displayName,
        avatarUrl: newAvatarUrl,
        email: user.email, 
        uid: user.uid,
      }, { merge: true }); 

      setLoading(false);
      setAvatarUrl(newAvatarUrl);
      setImageUri(null);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ của bạn.");
    } catch (error) {
      setLoading(false);
      console.error("Lỗi cập nhật hồ sơ: ", error);
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi khi đăng xuất: ", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản của tôi</Text>
      </View>
      
      <ScrollView style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={{ uri: imageUri || avatarUrl || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.label}>Tên hiển thị</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user?.email || ''}
          editable={false}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
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
  profileSection: {
    padding: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#8A4FFF',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#8A4FFF',
    padding: 8,
    borderRadius: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#8A4FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20, 
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountScreen;