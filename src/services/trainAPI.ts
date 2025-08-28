// src/services/apiService.ts
import axios from 'axios';
import { Base_URL } from '../config';

export const getAllTrains = async () => {
  try {
    const response = await axios.get(`${Base_URL}/train/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trains:', error);
    throw error;
  }
};

export const addTrain = async (trainData: any) => {
  try {
    const response = await axios.post(`${Base_URL}/train/add`, trainData);
    return response.data;
  } catch (error) {
    console.error('Error adding train:', error);
    throw error;
  }
};

export const updateTrain = async (trainData: any) => {
  try {
    const response = await axios.put(`${Base_URL}/train/update/`, trainData);
    return response.data;
  } catch (error) {
    console.error('Error updating train:', error);
    throw error;
  }
};

export const deleteTrain = async (trainId: string) => {
  try {
    const response = await axios.delete(`${Base_URL}/train/delete`, {
      params: { id: trainId }   // 👈 send as query parameter
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting train:', error);
    throw error;
  }
};


export const getAllRoutes = async () => {
  try {
    const response = await axios.get(`${Base_URL}/route/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};
