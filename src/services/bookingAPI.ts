// src/services/apiService.ts
import axios from 'axios';
import { Base_URL } from '../config';


const apiClient = axios.create({
  baseURL: Base_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createBooking = async (payload: any) => {
  try {
    const { data } = await axios.post(`${Base_URL}/booking/create`, payload);
    return data;          // Booking object returned by backend
  } catch (err: any) {
    // Optional: transform / log error
    throw err?.response?.data || err;
  }
};

export const getBooking = async (bookingId: string) => {
  try {
    const response = await apiClient.get(`/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};
// Add other API calls as needed
