const firebaseConfig = {
  apiKey: 'AIzaSyBo92Qd1Z5iDgZE68v1wVp1MggYJ1bxhwI',
  authDomain: 'pwa-todos-9fd3e.firebaseapp.com',
  databaseURL: 'https://pwa-todos-9fd3e.firebaseio.com',
  projectId: 'pwa-todos-9fd3e',
  storageBucket: 'pwa-todos-9fd3e.appspot.com',
  messagingSenderId: '1073017757917',
  appId: '1:1073017757917:web:74bc18df42036fe43d7b34',
  measurementId: 'G-Z0ZSPD8JY0',
};

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    localStorage.setItem('User', JSON.stringify(user));
  } else {
    localStorage.setItem('User', null);
  }
});
