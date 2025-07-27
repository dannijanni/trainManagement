import axios from 'axios';
import { Base_URL } from '../config';

const driverApi = axios.create({
  baseURL: Base_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const addDriver = async (driverData: any) => {
  try {
    const response = await driverApi.post('/driver/add', driverData);
    return response.data;
  } catch (error) {
    console.error('Error adding driver:', error);
    throw error;
  }
};

export const updateDriver = async (id: string, driverData: any) => {
  try {
    const response = await driverApi.put(`/driver/update`, driverData);
    return response.data;
  } catch (error) {
    console.error('Error updating driver:', error);
    throw error;
  }
};

export const deleteDriver = async (id: string) => {
  try {
    const response = await driverApi.delete(`/driver/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting driver:', error);
    throw error;
  }
};

export const getDrivers = async () => {
  try {
    const response = await driverApi.get('/driver/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

// Add more functions for other driver-related API calls as needed

export default driverApi;
