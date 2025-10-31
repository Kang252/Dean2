// src/data/types.ts
import { Timestamp } from 'firebase/firestore';

export interface Item {
  id: string; // ID của document từ Firestore
  userId: string;
  itemName: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string;
  status: 'lost' | 'found';
  createdAt: Timestamp;
  isPostedBySecurity?: boolean;
  isResolved?: boolean; // <-- THÊM TRƯỜNG NÀY
}