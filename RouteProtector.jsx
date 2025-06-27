import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RouteProtector({ children }) {
  const token = localStorage.getItem('userToken');
  return token ? children : <Navigate to="/login" replace />;
}
