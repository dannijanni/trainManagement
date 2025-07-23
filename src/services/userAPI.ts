// src/services/userService.ts
import axios from 'axios';
import { Base_URL } from '../config';
import { User } from '../types';

// Helper function to map role to roleId
export const getRoleId = (role?: string): number => {
  switch (role) {
    case 'admin':
      return 1;
    case 'manager':
      return 2;
    case 'staff':
      return 3;
    default:
      return 4; // Default to customer role
  }
};

// Helper function to map roleId to role
export const getRoleFromId = (roleId: number): 'admin' | 'manager' | 'staff' | 'customer' => {
  switch (roleId) {
    case 1: return 'admin';
    case 2: return 'manager';
    case 3: return 'staff';
    default: return 'customer';
  }
};

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${Base_URL}/user/getAllUsers`);
    return response.data.$values.map((user: any) => ({
      id: user.userId,
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: getRoleFromId(user.roleId),
      department: user.department || '',
      employeeId: user.employeeId || '',
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || null,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await axios.post(`${Base_URL}/user/createUser`, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      roleId: getRoleId(userData.role),
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      department: userData.department || '',
      employeeId: userData.employeeId || '',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  try {
    await axios.put(`${Base_URL}/user/updateUser?id=${userId}`, {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      roleId: getRoleId(userData.role),
      isActive: userData.isActive,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      department: userData.department || undefined,
      employeeId: userData.employeeId || undefined,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${Base_URL}/user/deleteUser?id=${userId}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
