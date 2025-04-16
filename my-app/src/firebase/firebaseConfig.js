import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

// Dán thông tin cấu hình từ Firebase Console của bạn vào đây
const firebaseConfig = {
  apiKey: "AIzaSyBHFqp8FmnDyDg5kBeiyzTWIRdyjb0Fv3g",
  authDomain: "my-app-d648a.firebaseapp.com",
  projectId: "my-app-d648a",
  storageBucket: "my-app-d648a.firebasestorage.app",
  messagingSenderId: "638998791298",
  appId: "1:638998791298:web:c1321a174a8d6e1789e09b",
  measurementId: "G-87TEBST3Y6"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo dịch vụ xác thực
const auth = getAuth(app);

// Các provider OAuth
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user:email');

export { auth, googleProvider, githubProvider };
