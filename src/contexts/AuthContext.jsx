import React, { createContext, useContext, useState, useEffect } from 'react';
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin email - only this email will have admin access
  const ADMIN_EMAIL = 'rushikeshrpawar72@gmail.com';
  const ADMIN_PASSWORD = 'rushi9763';

  // Simple local authentication (for demo purposes)
  async function signup(email, password, userData) {
    // Simulate user creation
    const user = {
      uid: Date.now().toString(),
      email: email,
      ...userData
    };

    // Store in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
      ...user,
      password: password,
      role: email === ADMIN_EMAIL ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('users', JSON.stringify(users));

    return { user };
  }

  async function login(email, password) {
    // Check admin credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        uid: 'admin-uid',
        email: ADMIN_EMAIL
      };
      setCurrentUser(adminUser);
      setUserRole('admin');
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      localStorage.setItem('userRole', 'admin');
      return { user: adminUser };
    }

    // Check regular users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      setCurrentUser(user);
      setUserRole(user.role);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      return { user };
    }

    throw new Error('Invalid email or password');
  }

  function logout() {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    return Promise.resolve();
  }

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('userRole');

    if (savedUser && savedRole) {
      setCurrentUser(JSON.parse(savedUser));
      setUserRole(savedRole);
    }

    setLoading(false);
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    ADMIN_EMAIL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
