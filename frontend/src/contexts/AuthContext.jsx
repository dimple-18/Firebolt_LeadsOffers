import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u || null);
        setLoading(false);
      }),
    []
  );

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // 🔥 UPDATED: register also creates Firestore user document
  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Set Firebase Auth displayName
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create/overwrite Firestore profile document
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName: displayName || "",
      createdAt: new Date(),
    });

    return cred;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        register,
        resetPassword,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
