import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  isLoggedIn(): boolean {
    return !!auth.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user);
    });
    return unsubscribe;
  }

  async signUp(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  signOutUser(): Promise<void> {
    return signOut(auth);
  }
}
