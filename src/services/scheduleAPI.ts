import axios from 'axios';
import { Base_URL } from '../config';

export const getAllSchedules = async () => {
  try {
    const response = await axios.get(`${Base_URL}/schedule/all`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const addSchedule = async (scheduleData: any) => {
  try {
    const response = await axios.post(`${Base_URL}/schedule/add`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
};

export const updateSchedule = async (scheduleId: string, scheduleData: any) => {
  try {
    const response = await axios.put(`${Base_URL}/schedule/update`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export const deleteSchedule = async (scheduleId: string) => {
  try {
    const response = await axios.delete(`${Base_URL}/schedule/delete/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting schedule:', error);
    throw error;
  }
};
