import firebase from 'firebase/app';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/firestore';

// App
import { environment } from '@env/environment';

/************** Public Functions *********************/
export const initFirebase = () => {
  firebase.initializeApp(environment.firebase);

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      localStorage.setItem('User', JSON.stringify(user));
    } else {
      localStorage.setItem('User', null);
    }
  });
};

/**
 * @returns {Promise<void>}
 */
export const loginWithGoogle = () => login(new firebase.auth.GoogleAuthProvider());

export const loginWithFacebook = () => {};

/**
 * @returns {Promise<void>}
 */
export const logout = async () => {
  return firebase
    .auth()
    .signOut()
    .then(() => {
      localStorage.removeItem('User');
      window.location.href = '/login';
    })
    .catch((err) => window.alert(err));
};

/**
 * Checks is the user is authenticated.
 * @return True if the user is authenticated.
 */
export const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('User'));
  return user && user.emailVerified;
};

/**
 *
 * @param {*} collection
 * @return {Promise<any[]>}
 */
export const getDocuments = (collection) => firebase.firestore().collection(collection).get();

/**
 *
 * @param {*} collection
 * @returns {DocumentReference}
 */
export const createDocumentRef = (collection) => firebase.firestore().collection(collection).doc();

/**
 *
 * @param {*} collection
 * @param {string} id
 * @returns {DocumentReference}
 */
export const getDocumentRef = (collection, id) => firebase.firestore().collection(collection).doc(id);

/**
 *
 * @param {*} collection
 * @param {object} item
 * @returns {Promise<void>}
 */
export const setDocument = (collection, item) => firebase.firestore().collection(collection).doc(item.id).set(item);

/**
 *
 * @param {*} collection
 * @param {string} id
 * @returns {Promise<void>}
 */
export const deleteDocument = (collection, id) => firebase.firestore().collection(collection).doc(id).delete();

/************** Private Functions *********************/
/**
 *
 * @param {*} provider
 * @returns {Promise<void>}
 */
export const login = async (provider) => {
  return firebase
    .auth()
    .signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;
      await setUserData(user);
      return (window.location.href = '/');
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;

      window.alert(`${errorCode}: ${errorMessage}`);
    });
};

/**
 *
 * @param {User} user
 * @returns {Promise<void>}
 */
const setUserData = (user) => {
  var userRef = firebase.firestore().collection('users').doc(user.uid);

  const userState = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };

  return userRef.set(userState, { merge: true });
};
