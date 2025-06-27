import React from 'react';
import { Navigate } from 'react-router-dom';

export default function LoginProtector({ children }) {
  const token = localStorage.getItem('userToken');
  return token ? <Navigate to="/profile" replace /> : children;
}
