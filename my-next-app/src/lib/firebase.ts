// Firebase 初期化用モジュール
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRgk8sK6n7Ctqf1uqx_32tqvql5C4okNE",
  authDomain: "slide-memo.firebaseapp.com",
  projectId: "slide-memo",
  storageBucket: "slide-memo.firebasestorage.app",
  messagingSenderId: "140055942105",
  appId: "1:140055942105:web:cc1f33b077527b2ea7ffc8",
  measurementId: "G-Q3VVGY6FHV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
