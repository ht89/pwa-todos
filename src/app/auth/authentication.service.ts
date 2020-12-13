import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LocalStorageEnum } from '@app/@shared';
import firebase from 'firebase/app';

import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  userState: any;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.subscribeToAuthState();
  }

  loginWithGoogle(): Promise<void> {
    return this.login(new firebase.auth.GoogleAuthProvider());
  }

  async logout(): Promise<void> {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem(LocalStorageEnum.User);
      this.router.navigate(['login']);
    });
  }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  get isAuthenticated(): boolean {
    const user = JSON.parse(localStorage.getItem(LocalStorageEnum.User));
    return user?.emailVerified;
  }

  private async login(provider: any): Promise<void> {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.setUserData(result.user);
      })
      .catch((err) => window.alert(err));
  }

  private setUserData(user: User): Promise<void> {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);

    const userState: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };

    return userRef.set(userState, { merge: true });
  }

  private subscribeToAuthState() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userState = user;
        localStorage.setItem(LocalStorageEnum.User, JSON.stringify(this.userState));

        this.ngZone.run(() => {
          this.router.navigate(['/']);
        });
      } else {
        localStorage.setItem(LocalStorageEnum.User, null);
      }

      // JSON.parse(localStorage.getItem(LocalStorageEnum.User));
    });
  }
}
