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

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // LOGIN
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  // REGISTER + SAVE PROFILE TO FIRESTORE
  const register = async (email, password, displayName) => {
    // 1) Create the user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // 2) Update the displayName in Firebase Auth
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // 3) Create profile document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName: displayName || "",
      createdAt: new Date(),
    });

    return cred;
  };

  // PASSWORD RESET
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // GOOGLE LOGIN
  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  // LOGOUT
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
      {!loading && children}
    </AuthCtx.Provider>
  );
}
