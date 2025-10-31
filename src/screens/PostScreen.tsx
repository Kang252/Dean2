// src/screens/PostScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Thông tin Cloudinary của bạn
const CLOUDINARY_CLOUD_NAME = 'dkdv4awgi';
const CLOUDINARY_UPLOAD_PRESET = 'lost_and_found_preset';

type Status = 'lost' | 'found';

const PostScreen = () => {
  const navigation = useNavigation();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<Status>('lost');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState('student'); // State lưu vai trò

  // Lấy vai trò của người dùng khi màn hình được tải
  useEffect(() => {
    const getUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    
    // Lắng nghe sự kiện focus để cập nhật vai trò (ví dụ: nếu admin vừa đổi vai trò)
    const unsubscribe = navigation.addListener('focus', () => {
      getUserRole();
    });
    return unsubscribe;
  }, [navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
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
      console.error('Lỗi Cloudinary:', data);
      throw new Error('Không thể tải ảnh lên Cloudinary');
    }
  };

  const handlePostItem = async () => {
    // Nếu là student, phải nhập location. Nếu là security, location được gán tự động
    if (!itemName || !description || !category || (userRole === 'student' && !location)) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường.");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để đăng tin.");
      return;
    }

    setUploading(true);
    let imageUrl = '';
    try {
      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }
      
      const isSecurityPost = userRole === 'security';

      await addDoc(collection(db, "items"), {
        userId: user.uid, 
        itemName, 
        description, 
        location: isSecurityPost ? 'Phòng Bảo vệ' : location, // Tự động gán vị trí
        category, 
        status,
        createdAt: serverTimestamp(),
        imageUrl: imageUrl,
        isPostedBySecurity: isSecurityPost, // Thêm trường mới
      });
      
      setUploading(false);
      Alert.alert("Thành công", "Bạn đã đăng tin thành công!");
      setItemName(''); setDescription(''); setLocation(''); setCategory(''); setImageUri(null);
      navigation.navigate('HomeStack' as never);
    } catch (e) {
      setUploading(false);
      console.error("Lỗi: ", e);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng tin.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Đăng tin mới</Text>
        
        <Text style={styles.label}>Bạn bị mất hay nhặt được đồ?</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity 
            style={[styles.statusButton, status === 'lost' && styles.statusButtonActive]}
            onPress={() => setStatus('lost')}
          >
            <Text style={[styles.statusText, status === 'lost' && styles.statusTextActive]}>Tôi làm mất</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statusButton, status === 'found' && styles.statusButtonActive]}
            onPress={() => setStatus('found')}
          >
            <Text style={[styles.statusText, status === 'found' && styles.statusTextActive]}>Tôi nhặt được</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Tên đồ vật</Text>
        <TextInput style={styles.input} placeholder="Ví dụ: Thẻ sinh viên Nguyễn Văn A" value={itemName} onChangeText={setItemName} />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Mô tả chi tiết về đồ vật..." multiline value={description} onChangeText={setDescription} />

        {/* Ẩn ô vị trí nếu là bảo vệ */}
        {userRole === 'student' && (
          <>
            <Text style={styles.label}>Khu vực</Text>
            <TextInput style={styles.input} placeholder="Ví dụ: Rơi ở thư viện trung tâm" value={location} onChangeText={setLocation} />
          </>
        )}

        <Text style={styles.label}>Danh mục</Text>
        <TextInput style={styles.input} placeholder="Ví dụ: Thẻ sinh viên, Chìa khóa,..." value={category} onChangeText={setCategory} />
        
        <Text style={styles.label}>Hình ảnh minh họa</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="#555" />
              <Text style={styles.imagePickerText}>Chọn ảnh</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handlePostItem} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Đăng tin</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 8, marginLeft: 20 },
  input: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16, marginHorizontal: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#8A4FFF', padding: 20, borderRadius: 10, alignItems: 'center', margin: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginBottom: 20 },
  statusButton: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginHorizontal: 5 },
  statusButtonActive: { backgroundColor: '#8A4FFF', borderColor: '#8A4FFF' },
  statusText: { fontSize: 14, color: '#555' },
  statusTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  imagePicker: {
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  imagePickerText: {
    marginTop: 10,
    color: '#555',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  }
});

export default PostScreen;