import axios from 'axios';
import { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/face`;

export interface FaceVerificationResult {
  verified: boolean;
  message: string;
  confidence?: number;
  data?: {
    verifiedAt: string;
    matchScore: number;
  };
}

export interface FaceVerificationStatus {
  isFaceVerified: boolean;
  faceVerifiedAt?: string;
}

/**
 * Verify face with BVN
 */
export const verifyFaceWithBVN = async (
  userId: string,
  bvn: string,
  faceImageUri: string,
  token: string
): Promise<FaceVerificationResult> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('bvn', bvn);
    
    // Add face image
    const filename = faceImageUri.split('/').pop() || 'face.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('faceImage', {
      uri: faceImageUri,
      name: filename,
      type,
    } as any);

    const response = await axios.post(`${API_URL}/verify-bvn`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 60000, // 60 seconds
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Face verification with BVN error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 
      'Failed to verify face with BVN. Please try again.'
    );
  }
};

/**
 * Verify face with NIN
 */
export const verifyFaceWithNIN = async (
  userId: string,
  nin: string,
  faceImageUri: string,
  token: string
): Promise<FaceVerificationResult> => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('nin', nin);
    
    const filename = faceImageUri.split('/').pop() || 'face.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('faceImage', {
      uri: faceImageUri,
      name: filename,
      type,
    } as any);

    const response = await axios.post(`${API_URL}/verify-nin`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
      timeout: 60000,
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Face verification with NIN error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 
      'Failed to verify face with NIN. Please try again.'
    );
  }
};

/**
 * Get face verification status
 */
export const getFaceVerificationStatus = async (
  userId: string,
  token: string
): Promise<FaceVerificationStatus> => {
  try {
    const response = await axios.get(`${API_URL}/status/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Get face verification status error:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 
      'Failed to get face verification status'
    );
  }
};
