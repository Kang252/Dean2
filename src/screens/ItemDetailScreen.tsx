// src/screens/ItemDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Item } from '../data/types'; // Import kiểu Item

const ItemDetailScreen = () => {
  const route = useRoute<RouteProp<any, any>>(); 
  const navigation = useNavigation<any>();
  
  // --- SỬA LỖI TYPESCRIPT BẰNG CÁCH ÉP KIỂU ---
  const { item } = route.params as { item: Item }; 
  
  const isLost = item.status === 'lost';
  const currentUser = auth.currentUser;
  const isSecurityPost = item.isPostedBySecurity || false;

  // --- HÀM: ĐÁNH DẤU ĐÃ GIẢI QUYẾT ---
  const handleMarkAsResolved = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn đánh dấu tin này là đã giải quyết?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận", 
          onPress: async () => {
            try {
              const itemDocRef = doc(db, 'items', item.id);
              await updateDoc(itemDocRef, {
                isResolved: true
              });
              Alert.alert("Thành công", "Đã cập nhật trạng thái tin đăng.");
              navigation.goBack();
            } catch (error) {
              console.error("Lỗi khi cập nhật:", error);
              Alert.alert("Lỗi", "Không thể cập nhật tin đăng.");
            }
          } 
        }
      ]
    );
  };

  // --- HÀM: XÓA TIN ĐĂNG ---
  const handleDeletePost = async () => {
    Alert.alert(
      "Xác nhận Xóa",
      "Bạn có chắc chắn muốn xóa vĩnh viễn tin đăng này không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: 'destructive',
          onPress: async () => {
            try {
              const itemDocRef = doc(db, 'items', item.id);
              await deleteDoc(itemDocRef);
              Alert.alert("Thành công", "Đã xóa tin đăng.");
              navigation.goBack();
            } catch (error) {
              console.error("Lỗi khi xóa:", error);
              Alert.alert("Lỗi", "Không thể xóa tin đăng.");
            }
          } 
        }
      ]
    );
  };

  // --- HÀM: XỬ LÝ LIÊN HỆ ---
  const handleContactPress = async () => {
    if (!currentUser) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để sử dụng chức năng này.");
      return;
    }

    if (currentUser.uid === item.userId) {
      Alert.alert("Thông báo", "Bạn không thể tự liên hệ với chính mình.");
      return;
    }

    const participantIds = [currentUser.uid, item.userId].sort();
    const chatId = `${participantIds[0]}_${participantIds[1]}_${item.id}`;

    try {
      const chatDocRef = doc(db, 'chats', chatId);
      const docSnap = await getDoc(chatDocRef);

      if (!docSnap.exists()) {
        await setDoc(chatDocRef, {
          participantIds: participantIds,
          itemId: item.id,
          itemName: item.itemName,
          createdAt: serverTimestamp(),
        });
      }
      
      navigation.navigate('Messages', { 
        screen: 'Chat',
        params: { chatId: chatId, chatName: item.itemName } 
      });

    } catch (error) {
      console.error("Lỗi khi tạo/tìm phòng chat:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra.");
    }
  };

  // --- HÀM RENDER CÁC NÚT BẤM ---
  const renderContactButton = () => {
    // 1. Nếu đây là tin của chính mình
    if (currentUser?.uid === item.userId) {
      return (
        <View style={styles.manageContainer}>
          <TouchableOpacity 
            style={[styles.buttonBase, styles.resolveButton, item.isResolved ? styles.disabledButton : {}]} 
            onPress={handleMarkAsResolved}
            disabled={item.isResolved}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>{item.isResolved ? "Đã giải quyết" : "Đánh dấu đã tìm thấy"}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buttonBase, styles.deleteButton]} 
            onPress={handleDeletePost}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Xóa tin</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // 2. Nếu tin này do bảo vệ đăng
    if (isSecurityPost) {
      return (
        <View style={styles.securityInfoBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#00529B" />
          <Text style={styles.securityInfoText}>
            Món đồ này đang được giữ tại Phòng Bảo vệ. Vui lòng mang Thẻ sinh viên đến để xác nhận và nhận lại.
          </Text>
        </View>
      );
    }
    
    // 3. Nếu tin đã được giải quyết (do người khác đăng)
    if (item.isResolved) {
      return (
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>Tin đăng này đã được giải quyết.</Text>
        </View>
      );
    }

    // 4. Nếu tin do sinh viên khác đăng (và chưa giải quyết)
    return (
      <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
        <Text style={styles.contactButtonText}>Liên hệ người đăng</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
       <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400' }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: isLost ? '#FF6B6B' : '#4CAF50' }
            ]}
          >
            <Text style={styles.statusText}>{isLost ? 'Đang tìm' : 'Đã nhặt được'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="gray" />
            <Text style={styles.infoRowText}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={20} color="gray" />
            <Text style={styles.infoRowText}>{item.category}</Text>
          </View>
          <Text style={styles.descriptionHeader}>Mô tả chi tiết</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
        </View>
      </ScrollView>
      
      {renderContactButton()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { 
      position: 'absolute', 
      top: 10, 
      left: 10, 
      zIndex: 1, 
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: 20,
      padding: 5,
    },
    backButton: { },
    image: {
      width: '100%',
      height: 350,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    content: { padding: 20 },
    itemName: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
    statusBadge: { alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 15, marginBottom: 20 },
    statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    infoRowText: { fontSize: 16, color: '#555', marginLeft: 10 },
    descriptionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
    descriptionText: { fontSize: 16, color: '#555', lineHeight: 24 },
    contactButton: {
      backgroundColor: '#8A4FFF',
      margin: 20,
      padding: 18,
      borderRadius: 15,
      alignItems: 'center',
      elevation: 5,
    },
    contactButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    securityInfoBox: {
      backgroundColor: '#BDE5F8', margin: 20, padding: 20,
      borderRadius: 15, alignItems: 'center', flexDirection: 'row',
    },
    securityInfoText: {
      color: '#00529B', fontSize: 15, fontWeight: '600', marginLeft: 15, flex: 1,
    },
    infoBox: {
      backgroundColor: '#eee', margin: 20, padding: 18,
      borderRadius: 15, alignItems: 'center',
    },
    infoBoxText: {
      color: '#555', fontSize: 16, fontWeight: '600',
    },
    manageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    buttonBase: {
      flex: 1,
      flexDirection: 'row',
      padding: 18,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    resolveButton: {
      backgroundColor: '#4CAF50',
      marginRight: 10,
    },
    deleteButton: {
      backgroundColor: '#FF6B6B',
      marginLeft: 10,
    },
    disabledButton: {
      backgroundColor: '#aaa',
    }
});

export default ItemDetailScreen;