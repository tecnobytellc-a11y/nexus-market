// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// AQUÍ DEBES PEGAR LA CONFIGURACIÓN DE TU FIREBASE (La misma que tienes en tu App.jsx)
const firebaseConfig = {
  apiKey: "AIzaSyBgqPltYbC8ZSzLszFA1y6FegfHJn91Ozg",
  authDomain: "tecnobyte-52ae0.firebaseapp.com",
  databaseURL: "https://tecnobyte-52ae0-default-rtdb.firebaseio.com",
  projectId: "tecnobyte-52ae0",
  storageBucket: "tecnobyte-52ae0.firebasestorage.app",
  messagingSenderId: "727089895868",
  appId: "1:727089895868:web:0412acf7c812a1f07b73b9",
  measurementId: "G-XC1PJ1PB6W"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Este bloque es el que hace sonar el celular cuando la app está cerrada
messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Cambia esto por el nombre del logo de tu página si tienes uno en la carpeta public
    badge: '/vite.svg',
    vibrate: [200, 100, 200, 100, 200, 100, 200] // Patrón de vibración agresivo
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
