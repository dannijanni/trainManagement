// src/services/apiService.ts
import axios from 'axios';
import { Base_URL } from '../config';

export const getAllRoutes = async () => {
  try {
    const response = await axios.get(`${Base_URL}/route/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};

export const addRoute = async (routeData: any) => {
  try {
    const response = await axios.post(`${Base_URL}/route/add`, routeData);
    return response.data;
  } catch (error) {
    console.error('Error adding route:', error);
    throw error;
  }
};

export const updateRoute = async (routeId: string, routeData: any) => {
  try {
    const response = await axios.put(`${Base_URL}/route/update/`, routeData);
    return response.data;
  } catch (error) {
    console.error('Error updating route:', error);
    throw error;
  }
};

export const deleteRoute = async (routeId: string) => {
  try {
    const response = await axios.delete(`${Base_URL}/route/${routeId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting route:', error);
    throw error;
  }
};
