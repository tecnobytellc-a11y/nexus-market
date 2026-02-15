import React, { useState, useEffect, useRef, memo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  query, 
  orderBy, 
  where, 
  getDocs
} from 'firebase/firestore';
import { 
  User, ShoppingBag, LogOut, Plus, Edit, Trash2, 
  CheckCircle, AlertTriangle, Gamepad2, Camera, FileText, 
  Lock, Zap, Crosshair, Trophy, Diamond, X, Flame, 
  ScanFace, Upload, Eye, EyeOff, Globe, MapPin,
  CreditCard, Banknote, Receipt, Download, RefreshCw, MessageSquare, Send,
  ImageIcon, CheckSquare, Star, Search, ThumbsUp, ThumbsDown, Minus,
  Mail, Phone, Smartphone, UserCheck, Key, Shield, Headphones, Users,
  Facebook, Instagram, MessageCircle, Radar, Activity, PauseCircle, PlayCircle, 
  Gavel, Heart, Bell, Volume2, VolumeX, ShieldAlert, Award, Package, Ban, FileWarning,
  ShieldCheck
} from 'lucide-react';

import nexusLogo from './nexus-station-logo.png';

// ============================================================================
// 1. SISTEMAS GLOBALES (PROXY & SFX)
// ============================================================================
const proxyImg = (url) => `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
const proxyVid = (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`;

const playSound = (type, isMuted) => {
  if (isMuted) return;
  const sounds = {
    notif: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    send: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    error: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'
  };
  try { 
    const audio = new Audio(sounds[type]); 
    audio.volume = 0.4; 
    audio.play(); 
  } catch(e) {
    console.warn("Audio play failed", e);
  }
};

// ============================================================================
// 2. CONFIGURACIÓN FIREBASE
// ============================================================================
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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "tecnobyte-marketplace-v1"; 

// ============================================================================
// 3. UTILIDADES FINANCIERAS Y SISTEMA
// ============================================================================
const formatCurrency = (amount, currency = 'USD') => {
  if (currency === 'VES') {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getExchangeRate = async () => { 
  try { 
    const res = await fetch('https://criptoya.com/api/binance/usdt/ves/0.1'); 
    const data = await res.json(); 
    return data.ask || 0; 
  } catch (error) { 
    return 0; 
  } 
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); 
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image(); 
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas'); 
        const scaleSize = 800 / img.width;
        canvas.width = 800; 
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d'); 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      }; 
      img.onerror = reject;
    }; 
    reader.onerror = reject;
  });
};

const getIP = async () => { 
  try { 
    const res = await fetch('https://api.ipify.org?format=json'); 
    const data = await res.json(); 
    return data.ip; 
  } catch (e) { 
    return "IP_OCULTA"; 
  } 
};

// --- Calculador de Nivel Gamer (Gamificación) ---
const getRankInfo = (xp) => {
   if(xp < 500) return { rank: "BRONCE", color: "text-amber-700", bg: "bg-amber-900/30", border: "border-amber-700", glow: "drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]" };
   if(xp < 2000) return { rank: "PLATA", color: "text-gray-300", bg: "bg-gray-700/30", border: "border-gray-400", glow: "drop-shadow-[0_0_5px_rgba(156,163,175,0.5)]" };
   if(xp < 5000) return { rank: "ORO", color: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-500", glow: "drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" };
   if(xp < 10000) return { rank: "HEROICO", color: "text-red-500", bg: "bg-red-900/30", border: "border-red-600", glow: "drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" };
   return { rank: "GRAN MAESTRO", color: "text-cyan-400", bg: "bg-cyan-900/30", border: "border-cyan-400", glow: "drop-shadow-[0_0_20px_cyan]" };
};

// ============================================================================
// 4. ESTILOS CSS MASTER (MEMOIZADO & OPTIMIZADO)
// ============================================================================
const Styles = memo(() => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700;900&display=swap');
    
    :root { 
      --ff-yellow: #FFD700; 
      --ff-orange: #FF4500; 
      --ff-red: #8B0000; 
      --ff-dark: #050505; 
      --ff-panel: rgba(10, 10, 15, 0.85); 
      --ff-cyan: #00FFFF; 
    }
    
    body { 
      background-color: var(--ff-dark); 
      color: white; 
      font-family: 'Rajdhani', sans-serif; 
      overflow-x: hidden; 
      scroll-behavior: smooth; 
    }
    
    /* ANIMACIONES BÁSICAS */
    @keyframes slideInUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes floatChar { 0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 20px rgba(255,69,0,0.5)); } 50% { transform: translateY(-25px) scale(1.05); filter: drop-shadow(0 0 40px rgba(255,0,0,0.8)); } }
    @keyframes floatExtreme { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-15px) rotate(2deg); } 75% { transform: translateY(15px) rotate(-2deg); } }
    @keyframes lightningFlash { 0%, 95%, 98%, 100% { opacity: 0; } 96%, 99% { opacity: 0.8; } }
    @keyframes pingSlow { 75%, 100% { transform: scale(2); opacity: 0; } }
    
    .animate-enter { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    .animate-enter-delay-1 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
    .animate-enter-delay-2 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
    .animate-enter-delay-3 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; opacity: 0; }
    .animate-floatExtreme { animation: floatExtreme 6s ease-in-out infinite; }
    .animate-ping-slow { animation: pingSlow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
    
    /* TIPOGRAFÍAS Y SCROLLBAR */
    .font-gamer { font-family: 'Black Ops One', cursive; }
    .font-tech { font-family: 'Orbitron', sans-serif; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #FF4500, #8B0000); border-radius: 4px; border: 1px solid #FFD700; }
    
    /* LOGO ANIMADO */
    @keyframes logo-glitch-skew { 0% { transform: skew(0deg); } 20% { transform: skew(-3deg); } 40% { transform: skew(3deg); } 60% { transform: skew(-2deg); } 80% { transform: skew(2deg); } 100% { transform: skew(0deg); } }
    @keyframes logo-flash { 0%, 100% { opacity: 1; filter: brightness(1) drop-shadow(0 0 10px #FF4500); } 50% { opacity: 0.9; filter: brightness(1.8) drop-shadow(0 0 30px #FFD700); } }
    .logo-hyper-anim { animation: logo-glitch-skew 4s infinite linear alternate-reverse, logo-flash 3s infinite steps(10), floatChar 5s infinite ease-in-out; filter: drop-shadow(0 0 15px rgba(255, 69, 0, 0.8)); }
    
    /* METEOROS Y CENIZAS */
    @keyframes meteor-fall { 0% { transform: translateX(100vw) translateY(-20vh) scale(1); opacity: 1; } 100% { transform: translateX(-50vw) translateY(100vh) scale(0.3); opacity: 0; } }
    .meteor { position: absolute; width: 200px; height: 4px; background: linear-gradient(to left, #fff, #ff4500, transparent); transform: rotate(-45deg); box-shadow: 0 0 40px 8px #ff0000; border-radius: 50%; }
    
    .ember { position: absolute; width: 5px; height: 5px; background: #FFD700; box-shadow: 0 0 15px 2px #FF4500, 0 0 30px 5px #FF0000; border-radius: 50%; mix-blend-mode: screen; }
    @keyframes emberRise { 0% { transform: translateY(120vh) translateX(0) scale(0.8) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(-20vh) translateX(200px) scale(0.1) rotate(360deg); opacity: 0; } }
    
    /* COMPONENTES DE INTERFAZ (HUD) */
    .hud-panel { 
      background: var(--ff-panel); 
      border: 1px solid rgba(255, 69, 0, 0.6); 
      position: relative; 
      clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px); 
      backdrop-filter: blur(20px); 
      box-shadow: 0 0 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(255,69,0,0.1); 
      transition: all 0.4s; 
    }
    .hud-panel::before { 
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
      background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%); 
      background-size: 200% 200%; 
      animation: glass-shine 4s infinite linear; 
      pointer-events: none; z-index: 1; 
    }
    @keyframes glass-shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .hud-panel:hover { 
      border-color: var(--ff-yellow); 
      box-shadow: 0 0 60px rgba(255, 69, 0, 0.6), inset 0 0 30px rgba(255,215,0,0.2); 
      transform: scale(1.02) translateY(-5px); z-index: 20; 
    }
    
    /* INPUTS Y BOTONES */
    .input-wrapper { position: relative; transition: all 0.3s; margin-bottom: 0.5rem; }
    .input-wrapper svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #888; transition: all 0.4s; z-index: 10; }
    .input-wrapper:focus-within svg { color: var(--ff-yellow); filter: drop-shadow(0 0 8px var(--ff-yellow)); transform: translateY(-50%) scale(1.2); }
    
    .input-ff { 
      background: rgba(0, 0, 0, 0.85); border: 2px solid #444; border-radius: 8px; color: white; 
      font-family: 'Rajdhani', sans-serif; font-weight: 800; letter-spacing: 1px; padding-left: 3.5rem !important; 
      transition: all 0.4s; box-shadow: inset 0 0 10px rgba(0,0,0,0.8); 
    }
    .input-ff:focus { 
      border-color: var(--ff-yellow); outline: none; background: rgba(255, 69, 0, 0.15); 
      box-shadow: 0 0 25px rgba(255, 69, 0, 0.4), inset 0 0 15px rgba(255,215,0,0.2); transform: scale(1.02); 
    }
    
    .btn-ff { 
      background: linear-gradient(135deg, #FFD700 0%, #FF4500 50%, #8B0000 100%); color: white; 
      font-family: 'Black Ops One', cursive; text-transform: uppercase; border: 2px solid #FFD700; 
      clip-path: polygon(15% 0, 100% 0, 100% 65%, 85% 100%, 0 100%, 0 35%); transition: all 0.3s; 
      position: relative; overflow: hidden; cursor: pointer; text-shadow: 2px 2px 0 rgba(0,0,0,0.8); 
      box-shadow: 0 10px 20px rgba(0,0,0,0.5); z-index: 1; 
    }
    .btn-ff::after { 
      content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; 
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%); 
      transform: rotate(45deg); transition: all 0.3s; z-index: -1; left: -100%; 
    }
    .btn-ff:hover::after { left: 100%; transition: all 0.6s ease-in-out; }
    .btn-ff:hover { transform: scale(1.08) translateY(-3px); box-shadow: 0 15px 40px rgba(255, 69, 0, 0.8); filter: brightness(1.3); }
    .btn-ff:active { transform: scale(0.95); }
    
    /* EFECTOS ESPECIALES DE FUEGO Y CHAT */
    .fire-base { position: fixed; bottom: 0; left: 0; right: 0; height: 35vh; background: linear-gradient(to top, rgba(255,69,0,0.8), rgba(255,0,0,0.2), transparent); filter: blur(8px); pointer-events: none; z-index: -5;}
    .fire-flame { position: absolute; bottom: -100px; width: 100%; height: 120%; background: url('https://raw.githubusercontent.com/s1mpson/css-fire/master/img/fire.png') repeat-x; background-size: auto 100%; mix-blend-mode: color-dodge; opacity: 0.9; animation: fireFlicker 2s infinite alternate ease-in-out; }
    @keyframes fireFlicker { 0% { transform: scaleY(1) translateY(0); opacity: 0.9; } 50% { transform: scaleY(1.1) skewX(-3deg) translateY(-10px); opacity: 1; } 100% { transform: scaleY(0.9) skewX(3deg) translateY(5px); opacity: 0.8; } }
    
    .chat-bubble-me { background: linear-gradient(135deg, rgba(255,69,0,0.3), rgba(139,0,0,0.5)); border: 1px solid var(--ff-yellow); border-radius: 15px 15px 0 15px; margin-left: auto; box-shadow: 0 5px 15px rgba(255,69,0,0.2); }
    .chat-bubble-other { background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,0,255,0.3)); border: 1px solid var(--ff-cyan); border-radius: 15px 15px 15px 0; margin-right: auto; box-shadow: 0 5px 15px rgba(0,255,255,0.2); }
    .chat-bubble-support { background: linear-gradient(135deg, rgba(138,43,226,0.3), rgba(75,0,130,0.5)); border: 1px solid #9932CC; border-radius: 15px; margin: 0 auto; box-shadow: 0 5px 15px rgba(138,43,226,0.4); text-align: center;}
    
    /* CLICK TÁCTICO Y BARRAS DE PROGRESO */
    .click-spark { position: absolute; width: 10px; height: 10px; background: #FFD700; border-radius: 50%; pointer-events: none; animation: sparkOut 0.5s ease-out forwards; z-index: 9999; box-shadow: 0 0 10px #FF4500; }
    @keyframes sparkOut { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
    
    .xp-bar-container { background: #111; border: 2px solid #333; height: 15px; border-radius: 10px; overflow: hidden; position: relative; box-shadow: inset 0 0 10px black;}
    .xp-bar-fill { height: 100%; background: linear-gradient(90deg, #FF4500, #FFD700); transition: width 1s ease-in-out; box-shadow: 0 0 15px #FFD700; }
    
    .glass-dropdown { background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); border: 1px solid #FF4500; box-shadow: 0 10px 30px rgba(0,0,0,0.9); border-radius: 8px; }
  `}</style>
));

// --- COMPONENTE DE CHISPAS AL HACER CLIC ---
const ClickSparks = () => {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const spark = document.createElement('div'); 
      spark.className = 'click-spark';
      spark.style.left = `${e.clientX - 5}px`; 
      spark.style.top = `${e.clientY - 5}px`;
      document.body.appendChild(spark); 
      setTimeout(() => spark.remove(), 500);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []); 
  return null;
};

// ============================================================================
// 5. COMPONENTES VISUALES MEMOIZADOS (FONDOS, CLIMA, PERSONAJES)
// ============================================================================
const VideoBackground = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden bg-black mix-blend-screen">
    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 scale-105">
       <source src={proxyVid('https://assets.mixkit.co/videos/preview/mixkit-fire-flames-burning-in-the-dark-4286-large.mp4')} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-[#1a0000]"></div>
  </div>
));

const LightningStorm = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[2] bg-white opacity-0 mix-blend-overlay" style={{ animation: 'lightningFlash 15s infinite' }}></div>
));

const MeteorShower = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <div key={i} className="meteor" style={{ 
        top: Math.random() * 100 - 50 + '%', 
        left: Math.random() * 150 + '%', 
        animation: `meteor-fall ${Math.random() * 2 + 1.5}s linear infinite ${Math.random() * 5}s`, 
        background: Math.random() > 0.8 ? 'linear-gradient(to left, #00ffff, #0000ff, transparent)' : 'linear-gradient(to left, #fff, #ff4500, transparent)' 
      }}></div>
    ))}
  </div>
));

const AshRain = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[4] overflow-hidden">
    {[...Array(400)].map((_, i) => { 
      const size = Math.random() * 4 + 2; 
      return (
        <div key={i} className="ember" style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          left: Math.random() * 100 + '%', 
          bottom: '-20px', 
          animation: `emberRise ${Math.random() * 5 + 3}s ease-in infinite`, 
          animationDelay: Math.random() * 10 + 's', 
          opacity: Math.random() * 0.9 + 0.1 
        }}></div>
      ); 
    })}
  </div>
));

const CharacterDecor = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden max-w-[1920px] mx-auto opacity-70">
    <img 
      src={proxyImg('https://freelogopng.com/images/all_img/1664285810free-fire-character-png.png')} 
      onError={(e)=>e.target.style.display='none'} 
      className="absolute bottom-0 left-[-100px] md:left-0 h-[45vh] md:h-[80vh] object-contain drop-shadow-[0_0_40px_rgba(255,69,0,0.8)]" 
      style={{ animation: 'floatChar 6s ease-in-out infinite' }} 
      alt="char1"
    />
    <img 
      src={proxyImg('https://freelogopng.com/images/all_img/1664286161free-fire-characters-png.png')} 
      onError={(e)=>e.target.style.display='none'} 
      className="absolute bottom-0 right-[-100px] md:right-[-50px] h-[50vh] md:h-[85vh] object-contain drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]" 
      style={{ animation: 'floatChar 7s ease-in-out infinite reverse' }} 
      alt="char2"
    />
    <img 
      src={proxyImg('https://images.squarespace-cdn.com/content/v1/5bca53fc809d8e577c271e16/1614050201639-67B715UUSOMDOP0E1K0K/Alok.png?format=1000w')} 
      onError={(e)=>e.target.style.display='none'} 
      className="absolute bottom-0 left-1/4 h-[30vh] md:h-[50vh] object-contain opacity-40 drop-shadow-[0_0_30px_rgba(255,0,0,0.9)] mix-blend-screen" 
      style={{ animation: 'floatChar 8s ease-in-out infinite 2s' }} 
      alt="char3"
    />
  </div>
));

const FireEffect = memo(() => (
  <div className="fixed bottom-0 left-0 w-full h-screen pointer-events-none z-[6] overflow-hidden">
    <div className="fire-base"></div>
    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#ff2a00]/50 via-[#ff0000]/20 to-transparent blur-2xl animate-pulse"></div>
    <div className="fire-flame"></div>
  </div>
));


// ============================================================================
// 6. SISTEMA DE CHAT P2P SEGURO E INTERACTIVO
// ============================================================================
const ChatSystem = ({ orderId, currentUserRole, currentUserId, orderStatus, onUpdateStatus, orderData, isMuted }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = currentUserRole === 'VENDEDOR' 
    ? ["¡Hola! Estoy en línea.", "Verificando tu pago...", "¡Pago confirmado!", "Datos enviados, revisa."] 
    : currentUserRole === 'COMPRADOR' 
    ? ["¡Hola! Ya realicé el pago.", "¿Estás ahí?", "Revisando cuenta...", "Todo excelente, gracias."] 
    : ["Agente en línea, ¿en qué ayudo?", "Por favor, mantengan el respeto.", "Revisando el caso..."];

  // MANEJO SEGURO DE NOTIFICACIONES PUSH
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(e => console.warn("Notificaciones bloqueadas", e));
      }
    }
  }, []);

  // ESCUCHA DE ÓRDENES Y ALERTAS DE SONIDO
  useEffect(() => {
     if(!orderId) return;
     const q = query(
       collection(db, 'artifacts', appId, 'public', 'data', 'orders', orderId, 'messages'), 
       orderBy('createdAt', 'asc')
     );
     
     const unsubscribe = onSnapshot(q, (snapshot) => {
       setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
       
       if(snapshot.docs.length > 0 && snapshot.docs[snapshot.docs.length-1].data().senderId !== currentUserId) {
         playSound('notif', isMuted);
       }
     });
     return () => unsubscribe();
   }, [orderId, currentUserId, isMuted]);

  const sendMessage = async (text, type = 'text', imageUrl = null) => {
    if (!text && !imageUrl) return;
    try { 
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders', orderId, 'messages'), { 
        text, 
        type, 
        imageUrl, 
        senderId: currentUserId || 'GUEST', 
        role: currentUserRole, 
        createdAt: serverTimestamp() 
      }); 
      setNewMessage(''); 
      playSound('send', isMuted); 
    } catch (error) { 
      console.error(error);
      playSound('error', isMuted); 
    }
  };

  const handleReportPayment = async (e) => { 
    const file = e.target.files[0]; 
    if (!file) return; 
    setIsUploading(true); 
    try { 
      const img = await compressImage(file); 
      await sendMessage("He realizado el pago. Adjunto comprobante.", "image", img); 
      await onUpdateStatus('payment_reported'); 
      playSound('success', isMuted); 
    } finally { 
      setIsUploading(false); 
    } 
  };

  const handleConfirmPayment = async () => { 
    if(!confirm("¿CONFIRMA RECEPCIÓN DEL PAGO? Acción irreversible.")) return; 
    await sendMessage("Pago recibido. Transmitiendo credenciales seguras:", "system"); 
    await sendMessage(`CUENTA: ${orderData.item.title}\nUSUARIO: admin_user\nCLAVE: TempPass123!`, "credentials"); 
    await onUpdateStatus('payment_confirmed'); 
    playSound('success', isMuted); 
  };

  const handleFinalizeOrder = async () => { 
    if(!confirm("¿CONFIRMA ACCESO EXITOSO?")) return; 
    await sendMessage("Acceso verificado. Transacción finalizada.", "system"); 
    await onUpdateStatus('completed'); 
    playSound('success', isMuted); 
  };

  const requestSupport = async () => { 
    if(!confirm("¿Solicitar intervención de un Agente de Soporte de TecnoByte?")) return; 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { supportRequested: true }); 
    await sendMessage("SOPORTE SOLICITADO. Un agente de TecnoByte se unirá pronto a la sala.", "system"); 
  };

  const adminForceComplete = async () => { 
    if(!confirm("AGENTE: ¿Forzar cierre a favor del VENDEDOR?")) return; 
    await sendMessage("[RESOLUCIÓN DE SOPORTE] El agente ha determinado que la venta es válida. Orden finalizada.", "system"); 
    await onUpdateStatus('completed'); 
    playSound('success', isMuted); 
  };

  const adminForceCancel = async () => { 
    if(!confirm("AGENTE: ¿Cancelar orden a favor del COMPRADOR?")) return; 
    await sendMessage("[RESOLUCIÓN DE SOPORTE] El agente ha anulado la transacción. Orden cancelada.", "system"); 
    await onUpdateStatus('cancelled'); 
    playSound('error', isMuted); 
  };

  return (
    <>
      {focusMode && (
        <div className="fixed inset-0 bg-black/90 z-[105] pointer-events-none backdrop-blur-sm transition-all duration-500"></div>
      )}
      
      <div className={`flex flex-col h-[500px] bg-black/90 rounded-lg overflow-hidden relative shadow-[0_0_40px_rgba(255,69,0,0.6)] backdrop-blur-md transition-all duration-500 ${focusMode ? 'z-[110] scale-[1.02] border-4 border-orange-500' : 'border-2 border-orange-600/50'}`}>
        
        {/* ENCABEZADO CHAT */}
        <div className="bg-gradient-to-r from-gray-900 via-red-900/30 to-gray-900 p-4 border-b border-orange-600/50 flex flex-wrap justify-between items-center gap-2 relative z-10">
          <span className="text-cyan-400 font-bold flex items-center gap-2 font-tech uppercase tracking-widest">
            <MessageSquare size={18} className="animate-pulse"/> CANAL SEGURO P2P
          </span>
          <div className="flex items-center gap-3">
            <button onClick={()=>setFocusMode(!focusMode)} className="p-1.5 bg-gray-800 rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors" title="Modo Cine">
              {focusMode ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
            {orderData?.supportRequested && (
              <span className="text-purple-400 font-bold text-xs flex items-center gap-1 bg-purple-900/40 px-2 py-1 rounded border border-purple-500">
                <Headphones size={14} className="animate-pulse"/> SOPORTE ACTIVO
              </span>
            )}
            <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase shadow-[0_0_15px_currentColor] ${orderStatus === 'completed' ? 'bg-green-500 text-black' : orderStatus === 'cancelled' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
              ESTADO: {orderStatus === 'created' ? 'ESPERANDO PAGO' : orderStatus === 'payment_reported' ? 'CONFIRMANDO' : orderStatus === 'payment_confirmed' ? 'ENTREGANDO' : orderStatus === 'cancelled' ? 'CANCELADA' : 'FINALIZADO'}
            </span>
          </div>
        </div>

        {/* ALERTA DE SEGURIDAD AL COMPRADOR */}
        {currentUserRole === 'COMPRADOR' && orderStatus !== 'completed' && orderStatus !== 'cancelled' && (
          <div className="bg-blue-900/40 border-b border-blue-500 p-2 text-center flex items-center justify-center gap-2 text-blue-300 text-[10px] uppercase font-bold tracking-widest">
            <ShieldAlert size={14} className="animate-pulse text-blue-400"/> Tus fondos están protegidos en custodia por TecnoByte LLC.
          </div>
        )}

        {/* ÁREA DE MENSAJES */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10">
          {orderData?.supportAgent && (
            <div className="text-center sticky top-0 z-10">
              <span className="bg-purple-900/80 text-purple-300 text-xs px-4 py-1 rounded-full border border-purple-500 font-bold tracking-widest shadow-[0_0_10px_purple]">
                AGENTE {orderData.supportAgentName} EN LÍNEA
              </span>
            </div>
          )}
          
          {messages.map((msg) => { 
            const isMe = msg.role === currentUserRole; 
            const isSupport = msg.role === 'SOPORTE'; 
            
            return (
              <div key={msg.id} className={`flex flex-col max-w-[85%] animate-enter ${isSupport ? 'mx-auto' : isMe ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
                {msg.type === 'system' ? (
                  <div className="w-full text-center my-3">
                    <span className="text-[10px] bg-red-900/50 text-orange-300 px-4 py-1.5 rounded-full uppercase border border-orange-600 shadow-[0_0_10px_rgba(255,69,0,0.5)] font-bold">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div className={`p-4 text-sm font-bold tracking-wide relative ${isSupport ? 'chat-bubble-support text-white' : isMe ? 'chat-bubble-me text-white' : 'chat-bubble-other text-gray-100'}`}>
                    {isSupport && (
                      <div className="text-[10px] text-purple-300 font-black mb-1 flex items-center gap-1">
                        <Shield size={12}/> AGENTE TECNOBYTE
                      </div>
                    )}
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        onError={(e)=>e.target.style.display='none'} 
                        className="w-48 rounded mb-2 border-2 border-orange-500 cursor-pointer hover:scale-[2] transition-transform duration-500 z-50 relative origin-bottom-right" 
                        alt="Comprobante"
                      />
                    )}
                    {msg.text}
                  </div>
                )}
              </div>
            ); 
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* RESPUESTAS RÁPIDAS */}
        {orderStatus !== 'completed' && orderStatus !== 'cancelled' && (
          <div className="bg-black/50 p-2 flex gap-2 overflow-x-auto custom-scrollbar border-t border-gray-800 whitespace-nowrap z-10 relative">
            {quickReplies.map((qr, i) => (
              <button 
                key={i} 
                onClick={() => { sendMessage(qr); playSound('click', isMuted); }} 
                className="text-[10px] bg-gray-900 border border-gray-600 hover:border-orange-500 hover:text-orange-400 px-3 py-1 rounded-full uppercase font-bold tracking-wider transition-colors hover:shadow-[0_0_10px_rgba(255,69,0,0.4)]"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* PANEL DE ACCIONES INFERIOR */}
        <div className="bg-gray-950 border-t border-orange-600/50 p-3 z-10 relative">
           {currentUserRole === 'COMPRADOR' && orderStatus === 'created' && (
             <label className="btn-ff w-full py-4 flex items-center justify-center gap-3 cursor-pointer text-lg">
               {isUploading ? "SUBIENDO..." : <><ImageIcon size={22} className="animate-bounce"/> REPORTAR PAGO (FOTO)</>}
               <input type="file" hidden accept="image/*" onChange={handleReportPayment} disabled={isUploading}/>
             </label>
           )}
           
           {currentUserRole === 'VENDEDOR' && orderStatus === 'payment_reported' && (
             <button onClick={handleConfirmPayment} className="btn-ff w-full py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-800 text-lg border-green-400">
               <CheckCircle size={22} className="animate-pulse"/> CONFIRMAR PAGO & ENVIAR DATOS
             </button>
           )}
           
           {currentUserRole === 'COMPRADOR' && orderStatus === 'payment_confirmed' && (
             <button onClick={handleFinalizeOrder} className="btn-ff w-full py-4 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 text-lg border-blue-400">
               <CheckSquare size={22} className="animate-pulse"/> CUENTA VERIFICADA - FINALIZAR
             </button>
           )}
           
           {orderStatus === 'completed' && (
             <div className="text-center text-green-400 font-gamer uppercase p-3 border-2 border-green-500 bg-green-900/40 shadow-[0_0_20px_rgba(0,255,0,0.3)] tracking-widest text-lg animate-pulse">
               ORDEN COMPLETADA EXITOSAMENTE
             </div>
           )}
           
           {orderStatus === 'cancelled' && (
             <div className="text-center text-red-500 font-gamer uppercase p-3 border-2 border-red-600 bg-red-900/40 shadow-[0_0_20px_rgba(255,0,0,0.3)] tracking-widest text-lg animate-pulse">
               ORDEN CANCELADA / ANULADA
             </div>
           )}
           
           {(orderStatus === 'created' || orderStatus === 'payment_reported' || orderStatus === 'payment_confirmed') && currentUserRole !== 'SOPORTE' && !orderData?.supportRequested && (
             <button onClick={requestSupport} className="w-full mt-2 py-2 text-xs font-bold uppercase text-purple-400 hover:text-white border border-purple-900 hover:border-purple-500 bg-purple-900/20 hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 rounded">
               <Headphones size={16}/> ALERTA: LLAMAR SOPORTE
             </button>
           )}
           
           {(orderStatus === 'created' || orderStatus === 'payment_reported' || orderStatus === 'payment_confirmed') && currentUserRole === 'SOPORTE' && (
              <div className="flex gap-2 mt-2">
                 <button onClick={adminForceCancel} className="flex-1 py-2 text-[10px] font-black uppercase text-red-300 hover:text-white border border-red-800 bg-red-900/40 hover:bg-red-700 transition-colors flex flex-col items-center justify-center gap-1 rounded hover:shadow-[0_0_15px_red]">
                   <Gavel size={14}/> FALLAR FAVOR COMPRADOR
                 </button>
                 <button onClick={adminForceComplete} className="flex-1 py-2 text-[10px] font-black uppercase text-green-300 hover:text-white border border-green-800 bg-green-900/40 hover:bg-green-700 transition-colors flex flex-col items-center justify-center gap-1 rounded hover:shadow-[0_0_15px_green]">
                   <CheckCircle size={14}/> FALLAR FAVOR VENDEDOR
                 </button>
              </div>
           )}
        </div>

        {/* INPUT DE MENSAJE */}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(newMessage); }} className="p-3 bg-black flex gap-3 border-t border-gray-800 z-10 relative">
          <input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder={currentUserRole === 'SOPORTE' ? "Escriba como Agente Oficial..." : "Escriba un mensaje..."} 
            className={`flex-grow input-ff py-3 !pl-4 text-white focus:border-orange-500 outline-none ${currentUserRole === 'SOPORTE' && 'border-purple-500 bg-purple-900/10'}`} 
            disabled={orderStatus === 'completed' || orderStatus === 'cancelled'} 
          />
          <button 
            type="submit" 
            disabled={orderStatus === 'completed' || orderStatus === 'cancelled'} 
            className={`p-3 rounded-lg border shadow-[0_0_15px_rgba(255,69,0,0.5)] transition-transform hover:scale-110 active:scale-95 text-white ${currentUserRole === 'SOPORTE' ? 'bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(128,0,128,0.5)]' : 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-400'}`}
          >
            <Send size={24}/>
          </button>
        </form>
      </div>
    </>
  );
};

// ============================================================================
// 7. CENTRAL DE SOPORTE GENERAL
// ============================================================================
const SupportDashboard = ({ user, userData, setView, showNotification, isMuted }) => {
  const [disputes, setDisputes] = useState([]); 
  const [selectedDispute, setSelectedDispute] = useState(null); 
  const [internalNote, setInternalNote] = useState('');

  useEffect(() => { 
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('supportRequested', '==', true));
    const unsub = onSnapshot(q, (snap) => { 
      let fetched = snap.docs.map(d => ({id: d.id, ...d.data()})); 
      fetched.sort((a,b) => new Date(b.date) - new Date(a.date)); 
      setDisputes(fetched); 
    }); 
    return () => unsub(); 
  }, []);

  const claimCase = async (orderId) => { 
    playSound('click', isMuted); 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), { 
      supportAgent: user.uid, 
      supportAgentName: userData.adminName || 'AGENTE' 
    }); 
  };

  const addSecretNote = async () => { 
    if(!internalNote) return; 
    const currentNotes = selectedDispute.secretNotes || []; 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', selectedDispute.id), { 
      secretNotes: [...currentNotes, { text: internalNote, date: new Date().toISOString(), agent: userData.adminName }] 
    }); 
    setInternalNote(''); 
    showNotification("Nota Secreta Agregada", "success"); 
    playSound('success', isMuted); 
  };

  const banSeller = async () => { 
    if(!confirm("⚠️ ATENCIÓN: ¿Banear la cuenta de este Vendedor Permanentemente?")) return; 
    await updateDoc(doc(db, 'artifacts', appId, 'users', selectedDispute.seller.id, 'profile', 'data'), { 
      isBanned: true, 
      banReason: "Fraude / Disputa Perdida" 
    }); 
    showNotification("VENDEDOR BANEADO DE LA PLATAFORMA", "error"); 
    playSound('error', isMuted); 
  };

  return (
    <div className="animate-enter max-w-7xl mx-auto mt-10">
      
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 border-b-4 border-purple-800 pb-8 bg-black/40 p-8 rounded-xl backdrop-blur-sm shadow-[0_0_50px_rgba(128,0,128,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-5xl font-gamer text-white uppercase italic text-shadow-glow drop-shadow-[0_0_20px_purple] mb-2 flex items-center justify-center md:justify-start gap-4">
            <Headphones size={48} className="text-purple-500 animate-pulse"/> CENTRAL DE SOPORTE
          </h2>
          <p className="font-tech text-cyan-400 tracking-[0.4em] text-xl uppercase font-bold bg-cyan-900/30 inline-block px-4 py-1 border border-cyan-500/50">
            <Shield className="inline mr-2 mb-1" size={18}/> Nivel Cero: Acceso Autorizado
          </p>
        </div>
        <button onClick={() => {playSound('click', isMuted); setView('dashboard')}} className="btn-secondary-ff px-8 py-3 text-xl relative z-10 mt-6 md:mt-0">
          &lt;&lt; VOLVER
        </button>
      </div>

      {!selectedDispute ? (
         <div className="grid grid-cols-1 gap-6">
            {disputes.length === 0 && (
              <div className="text-center py-20 bg-black/50 border-2 border-dashed border-gray-700 rounded-xl">
                <p className="text-2xl text-gray-500 font-tech uppercase tracking-widest">Sin alertas activas en el radar.</p>
              </div>
            )}
            
            {disputes.map(d => (
               <div key={d.id} className="hud-panel p-6 flex flex-col md:flex-row justify-between items-center border-purple-500/50 hover:border-purple-400 bg-gradient-to-r from-gray-900 to-black hover:scale-[1.01] transition-transform gap-4">
                  <div className="text-center md:text-left">
                    <span className="text-orange-500 font-bold bg-orange-900/30 px-2 py-1 border border-orange-500 text-xs">
                      ORDEN #{d.orderId}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase mt-2">{d.item.title}</h3>
                    <p className="text-gray-400 text-sm font-mono mt-1">
                      Vendedor: {d.seller.username} | Cliente: {d.buyer.firstName} | Estado: <span className={d.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'}>{d.status}</span>
                    </p>
                  </div>
                  <div className="text-right">
                     {d.supportAgent ? ( 
                       d.supportAgent === user.uid ? (
                         <button onClick={() => {playSound('click', isMuted); setSelectedDispute(d)}} className="btn-ff bg-gradient-to-r from-purple-600 to-purple-800 border-purple-400 px-6 py-3 shadow-[0_0_20px_purple]">
                           ATENDER MI CASO
                         </button> 
                       ) : (
                         <span className="text-purple-400 font-bold bg-purple-900/40 px-4 py-2 border border-purple-500 rounded flex items-center gap-2">
                           <Lock size={16}/> TOMADO POR {d.supportAgentName}
                         </span> 
                       )
                     ) : ( 
                       <button onClick={() => claimCase(d.id)} className="btn-secondary-ff bg-purple-900/40 border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white px-6 py-3 shadow-[0_0_15px_rgba(128,0,128,0.3)]">
                         ASIGNARME CASO
                       </button> 
                     )}
                  </div>
               </div>
            ))}
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh] animate-enter">
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
               
               <div className="bg-black/80 border-2 border-purple-600 p-6 rounded-lg shadow-[0_0_30px_rgba(128,0,128,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 blur-[80px] opacity-30 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-center border-b-2 border-purple-600 pb-4 mb-6 relative z-10">
                    <h3 className="text-3xl font-gamer text-white flex items-center gap-3">
                      <FileWarning className="text-purple-500"/> DOSSIER DEL CASO
                    </h3>
                    <button onClick={() => {playSound('click', isMuted); setSelectedDispute(null)}} className="text-red-500 hover:text-white bg-red-900/40 px-4 py-2 rounded font-bold hover:bg-red-600 transition-colors">
                      CERRAR DOSSIER
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-sm relative z-10">
                     <div className="bg-gray-900/80 p-4 rounded border-l-4 border-cyan-500 relative group">
                        <button onClick={banSeller} className="absolute top-3 right-3 text-red-500 hover:text-white bg-red-900/40 hover:bg-red-600 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Ban size={12}/> BANEAR
                        </button>
                        <h4 className="text-cyan-400 font-black mb-2 uppercase flex items-center gap-2"><User size={16}/> VENDEDOR</h4>
                        <p className="mb-1"><span className="text-gray-500">Admin:</span> {selectedDispute.seller.adminName}</p>
                        <p className="mb-1"><span className="text-gray-500">Whatsapp:</span> {selectedDispute.seller.whatsapp}</p>
                        <p><span className="text-gray-500">ID:</span> {selectedDispute.seller.idNumber}</p>
                     </div>
                     
                     <div className="bg-gray-900/80 p-4 rounded border-l-4 border-orange-500">
                        <h4 className="text-orange-400 font-black mb-2 uppercase flex items-center gap-2"><User size={16}/> COMPRADOR</h4>
                        <p className="mb-1"><span className="text-gray-500">Nombre:</span> {selectedDispute.buyer.firstName} {selectedDispute.buyer.lastName}</p>
                        <p className="mb-1"><span className="text-gray-500">Whatsapp:</span> {selectedDispute.buyer.whatsapp}</p>
                        <p><span className="text-gray-500">ID:</span> {selectedDispute.buyer.idNumber}</p>
                     </div>
                     
                     <div className="bg-gray-900/80 p-4 rounded border-l-4 border-yellow-500">
                        <h4 className="text-yellow-400 font-black mb-2 uppercase flex items-center gap-2"><Receipt size={16}/> TRANSACCIÓN</h4>
                        <p className="mb-1"><span className="text-gray-500">Item:</span> {selectedDispute.item.title}</p>
                        <p className="mb-1"><span className="text-gray-500">Total:</span> <span className="text-yellow-500 font-gamer text-xl">${selectedDispute.payment.totalUSD}</span></p>
                        <p className="mb-1"><span className="text-gray-500">Método:</span> {selectedDispute.payment.method} ({selectedDispute.payment.currency})</p>
                        <p><span className="text-gray-500">Estado:</span> <span className="bg-white/10 px-2 py-1 rounded ml-2 uppercase font-bold">{selectedDispute.status}</span></p>
                     </div>
                  </div>
               </div>
               
               {/* NOTAS CLASIFICADAS */}
               <div className="bg-gray-950 border-2 border-gray-800 p-6 rounded-lg shadow-inner">
                  <h4 className="text-gray-400 font-black mb-4 uppercase tracking-widest flex items-center gap-2 border-b border-gray-800 pb-2">
                    <EyeOff size={18}/> Notas Clasificadas (Solo Agentes)
                  </h4>
                  
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                     {(!selectedDispute.secretNotes || selectedDispute.secretNotes.length===0) && (
                       <p className="text-gray-600 text-xs italic">No hay notas en este caso.</p>
                     )}
                     {selectedDispute.secretNotes?.map((n, i) => (
                        <div key={i} className="bg-gray-900 border-l-2 border-purple-500 p-2 text-xs">
                          <span className="text-purple-400 font-bold">[{n.agent}]:</span> <span className="text-gray-300">{n.text}</span>
                        </div>
                     ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      value={internalNote} 
                      onChange={e=>setInternalNote(e.target.value)} 
                      placeholder="Agregar nota interna..." 
                      className="flex-grow bg-black border border-gray-700 text-white text-sm p-2 rounded focus:border-purple-500 outline-none"
                    />
                    <button onClick={addSecretNote} className="bg-purple-900/50 text-purple-400 border border-purple-600 px-4 py-2 hover:bg-purple-600 hover:text-white rounded font-bold text-sm">
                      GUARDAR
                    </button>
                  </div>
               </div>

            </div>
            
            <div className="flex flex-col h-full">
              <ChatSystem 
                orderId={selectedDispute.id} 
                currentUserRole="SOPORTE" 
                currentUserId={user.uid} 
                orderStatus={selectedDispute.status} 
                onUpdateStatus={()=>{}} 
                orderData={selectedDispute} 
                isMuted={isMuted}
              />
            </div>
         </div>
      )}
    </div>
  );
};

// ============================================================================
// 8. RASTREADOR DE ÓRDENES (CLIENTE)
// ============================================================================
const OrderTrackerView = ({ setView, showNotification, isMuted }) => {
  const [trackId, setTrackId] = useState(''); 
  const [trackEmail, setTrackEmail] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [foundOrder, setFoundOrder] = useState(null);

  const handleTrack = async (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    playSound('click', isMuted); 
    try { 
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('orderId', '==', trackId.trim().toUpperCase())); 
      const snap = await getDocs(q); 
      
      if(snap.empty) { 
        showNotification("ORDEN NO ENCONTRADA.", "error"); 
        playSound('error', isMuted); 
      } else { 
        const orderDoc = snap.docs[0].data(); 
        if(orderDoc.buyer.email.trim().toLowerCase() === trackEmail.trim().toLowerCase()) { 
          setFoundOrder({ dbId: snap.docs[0].id, ...orderDoc }); 
          showNotification("SALA DE CONTROL ENCONTRADA", "success"); 
          playSound('success', isMuted); 
        } else { 
          showNotification("ACCESO DENEGADO. Correo no coincide.", "error"); 
          playSound('error', isMuted); 
        } 
      } 
    } catch(err) { 
      showNotification("ERROR AL RASTREAR", "error"); 
      playSound('error', isMuted); 
    } finally { 
      setLoading(false); 
    } 
  };

  if(foundOrder) {
    return (
      <div className="max-w-6xl mx-auto mt-10 animate-enter bg-black/80 p-8 rounded-xl border-2 border-orange-500 shadow-[0_0_60px_rgba(255,69,0,0.5)]">
        <div className="flex justify-between items-center border-b border-orange-600 pb-4 mb-6">
          <h2 className="text-3xl font-gamer text-white uppercase text-shadow-glow flex items-center gap-3">
            <Radar className="text-orange-500"/> RADAR: ORDEN #{foundOrder.orderId}
          </h2>
          <button onClick={()=>{playSound('click', isMuted); setFoundOrder(null)}} className="text-red-500 font-bold hover:text-white bg-red-900/40 px-4 py-2 rounded border border-red-500 hover:bg-red-600 transition-colors">
            CERRAR RADAR
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[65vh]">
          <div className="bg-gray-900/80 p-6 rounded border border-gray-700 overflow-y-auto custom-scrollbar shadow-inner">
            <h3 className="text-xl font-black text-cyan-400 border-b border-gray-700 pb-2 mb-4 tracking-widest uppercase flex items-center gap-2">
              <FileText size={18}/> DATOS DE OPERACIÓN
            </h3>
            <p className="text-gray-300 font-mono mb-2">Producto: <span className="text-white font-bold">{foundOrder.item.title}</span></p>
            <p className="text-gray-300 font-mono mb-2">Total a Pagar: <span className="text-yellow-500 font-bold">${foundOrder.payment.totalUSD}</span></p>
            <p className="text-gray-300 font-mono mb-6">Vendedor Oficial: <span className="text-white font-bold">{foundOrder.seller.adminName}</span></p>
            
            <div className="bg-orange-900/30 border border-orange-500 p-4 rounded text-center shadow-[0_0_15px_rgba(255,69,0,0.2)]">
              <p className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2">
                <AlertTriangle className="inline mr-2 mb-1"/> INSTRUCCIONES
              </p>
              <p className="text-gray-300 text-xs">
                Utilice el canal a la derecha para comunicarse con el vendedor, subir el comprobante y recibir sus datos. Todo está protegido por Escrow.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col h-full">
            <ChatSystem orderId={foundOrder.dbId} currentUserRole="COMPRADOR" currentUserId="GUEST_BUYER" orderStatus={foundOrder.status} onUpdateStatus={()=>{}} orderData={foundOrder} isMuted={isMuted}/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-20 animate-enter hud-panel p-10 shadow-[0_0_80px_rgba(0,255,255,0.4)] border-cyan-500 relative overflow-hidden">
       <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-600 blur-[100px] opacity-30 pointer-events-none"></div>
       <button onClick={() => {playSound('click', isMuted); setView('home')}} className="text-gray-400 hover:text-white font-bold mb-6 relative z-10">
         &lt;&lt; VOLVER AL INICIO
       </button>
       
       <div className="text-center mb-10 relative z-10">
         <Radar size={64} className="mx-auto text-cyan-500 mb-4 animate-spin-slow"/>
         <h2 className="text-5xl font-gamer text-white uppercase text-shadow-glow">Radar de Combate</h2>
         <p className="text-cyan-400 font-tech tracking-widest uppercase mt-2">Rastrea y recupera tu orden de compra encriptada</p>
       </div>
       
       <form onSubmit={handleTrack} className="space-y-6 relative z-10">
          <div className="input-wrapper">
            <Search className="w-6 h-6"/>
            <input required value={trackId} onChange={e=>setTrackId(e.target.value)} className="input-ff w-full p-5 text-xl tracking-widest uppercase" placeholder="Nº DE ORDEN (Ej: ORD-XXXXXX)"/>
          </div>
          <div className="input-wrapper">
            <Mail className="w-6 h-6"/>
            <input type="email" required value={trackEmail} onChange={e=>setTrackEmail(e.target.value)} className="input-ff w-full p-5 text-lg" placeholder="CORREO REGISTRADO EN LA COMPRA"/>
          </div>
          <button disabled={loading} className="w-full btn-secondary-ff border-cyan-500 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-600 hover:text-white py-6 text-2xl font-black tracking-widest shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            {loading ? "RASTREANDO SEÑAL..." : "UBICAR MI COMPRA"}
          </button>
       </form>
    </div>
  );
};

// ============================================================================
// 9. ARMERÍA (HISTORIAL DE COMPRAS DEL CLIENTE)
// ============================================================================
const BuyerInventoryView = ({ user, setView, showNotification, isMuted }) => {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => { 
    if(!user) return; 
    const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('buyer.email', '==', user.email)), (snap) => { 
      let fetched = snap.docs.map(d => ({id: d.id, ...d.data()})); 
      fetched.sort((a,b) => new Date(b.date) - new Date(a.date)); 
      setPurchases(fetched); 
    }); 
    return () => unsub(); 
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto mt-12 animate-enter">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 border-b-4 border-blue-800 pb-8 bg-black/40 p-8 rounded-xl backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,255,0.2)] gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-gamer text-white uppercase italic text-shadow-glow drop-shadow-[0_0_20px_blue] mb-2 flex items-center gap-4 justify-center md:justify-start">
            <Package size={48} className="text-blue-500"/> MI ARMERÍA
          </h2>
          <p className="font-tech text-cyan-400 tracking-[0.4em] text-xl uppercase font-bold bg-cyan-900/30 inline-block px-4 py-1 border border-cyan-500/50">
            HISTORIAL DE COMPRAS
          </p>
        </div>
        <button onClick={() => {playSound('click', isMuted); setView('home')}} className="btn-secondary-ff px-8 py-3 text-xl border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white">
          &lt;&lt; VOLVER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {purchases.length === 0 && (
          <div className="col-span-2 text-center py-20 bg-black/50 border-2 border-dashed border-gray-700 rounded-xl">
            <Package size={64} className="mx-auto text-gray-600 mb-4 opacity-50"/>
            <p className="text-2xl text-gray-500 font-tech uppercase tracking-widest">Aún no has adquirido suministros.</p>
          </div>
        )}
        
        {purchases.map(p => (
          <div key={p.id} className="hud-panel p-6 border-blue-500/50 bg-gradient-to-br from-gray-900 to-black hover:border-blue-400 transition-all hover:scale-[1.02]">
             <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-4">
               <div>
                 <span className="text-xs font-black bg-blue-900/40 text-blue-400 border border-blue-500 px-2 py-1 rounded">
                   ORDEN #{p.orderId}
                 </span>
                 <h3 className="text-2xl font-black text-white uppercase mt-2">{p.item.title}</h3>
               </div>
               <div className="text-right">
                 <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase shadow-[0_0_10px_currentColor] ${p.status === 'completed' ? 'bg-green-500 text-black' : p.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
                   {p.status}
                 </span>
               </div>
             </div>
             
             <div className="flex justify-between items-end">
               <div className="text-sm font-mono text-gray-400 space-y-1">
                 <p>Fecha: {new Date(p.date).toLocaleDateString()}</p>
                 <p>Comandante: <span className="text-white">{p.seller.username}</span></p>
                 <p>Total: <span className="text-yellow-500 font-bold">${p.payment.totalUSD}</span></p>
               </div>
               <button onClick={()=>{navigator.clipboard.writeText(p.orderId); showNotification("ID de Orden Copiado", "success"); playSound('click', isMuted)}} className="text-blue-400 text-xs font-bold hover:text-white underline">
                 COPIAR ID
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 10. BÓVEDA DE DESEOS (WISHLIST)
// ============================================================================
const WishlistView = ({ user, listings, setPurchaseItem, setView, showNotification, isMuted }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  
  useEffect(() => { 
    if(!user) return; 
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'wishlist', 'data'), (doc) => { 
      if(doc.exists()) setWishlistIds(doc.data().items || []); 
    }); 
    return () => unsub(); 
  }, [user]);

  const removeWishlist = async (id) => { 
    playSound('click', isMuted); 
    const newItems = wishlistIds.filter(i => i !== id); 
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'wishlist', 'data'), { items: newItems }); 
    showNotification("ARTÍCULO DESCARTADO", "success"); 
  };

  const wishItems = listings.filter(l => wishlistIds.includes(l.id));

  return (
    <div className="max-w-7xl mx-auto mt-12 animate-enter">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 border-b-4 border-pink-800 pb-8 bg-black/40 p-8 rounded-xl backdrop-blur-sm shadow-[0_0_50px_rgba(236,72,153,0.2)] gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-gamer text-white uppercase italic text-shadow-glow drop-shadow-[0_0_20px_pink] mb-2 flex items-center gap-4 justify-center md:justify-start">
            <Heart size={48} className="text-pink-500 fill-pink-500"/> BÓVEDA DE DESEOS
          </h2>
          <p className="font-tech text-cyan-400 tracking-[0.4em] text-xl uppercase font-bold bg-cyan-900/30 inline-block px-4 py-1 border border-cyan-500/50">
            ARTÍCULOS MARCADOS
          </p>
        </div>
        <button onClick={() => {playSound('click', isMuted); setView('home')}} className="btn-secondary-ff px-8 py-3 text-xl border-pink-500 text-pink-400 hover:bg-pink-600 hover:text-white">
          &lt;&lt; VOLVER AL MERCADO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishItems.length === 0 && (
          <div className="col-span-4 text-center py-32 bg-black/50 border-2 border-dashed border-gray-700 rounded-xl">
            <Heart size={80} className="mx-auto text-gray-600 mb-6 opacity-30"/>
            <p className="text-2xl text-gray-500 font-tech uppercase tracking-widest">No hay artículos marcados.</p>
          </div>
        )}

        {wishItems.map((item, index) => (
          <div key={item.id} className="hud-panel flex flex-col group h-full border-b-4 border-pink-500 animate-enter">
            <div className="relative h-60 bg-black overflow-hidden clip-path-bottom-slant">
              <img src={item.images?.[0]} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
              
              <button onClick={()=>removeWishlist(item.id)} className="absolute top-3 right-3 bg-black/80 p-2 rounded-full border border-pink-500 text-pink-500 hover:bg-pink-600 hover:text-white transition-colors shadow-[0_0_15px_pink] z-20">
                <Trash2 size={16}/>
              </button>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
              
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/90 px-3 py-1 rounded border-l-2 border-yellow-500 z-20">
                <User size={14} className="text-yellow-500"/>
                <span className="text-[10px] font-tech text-white uppercase">{item.adminName}</span>
              </div>
            </div>

            <div className="p-6 flex-grow flex flex-col relative bg-gradient-to-b from-transparent to-black/90">
              <h3 className="font-tech font-black text-white text-xl leading-tight mb-4 uppercase drop-shadow-md">{item.title}</h3>
              <div className="mt-auto border-t border-gray-800 pt-4 flex justify-between items-end">
                <span className="text-4xl font-gamer text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {formatCurrency(item.discountActive ? item.discountPrice : item.price)}
                </span>
                <button onClick={()=>{playSound('click', isMuted); setPurchaseItem(item)}} className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black p-3 hover:scale-110 transition-transform clip-path-polygon border border-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                  <ShoppingBag size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 11. PERFIL PÚBLICO DEL VENDEDOR (CON ESTRELLAS, AVATAR, REFERENCIAS)
// ============================================================================
const SellerProfileView = ({ sellerId, onClose, onBuy, user, userData, showNotification, isMuted }) => {
  const [profile, setProfile] = useState(null);
  const [salesCount, setSalesCount] = useState(0);
  const [sellerListings, setSellerListings] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('arsenal');
  const [avgRating, setAvgRating] = useState(0);
  const [clientIp, setClientIp] = useState('');

  useEffect(() => {
    const load = async () => {
      // 1. Cargar Info Principal
      try {
        const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', sellerId, 'profile', 'data'));
        if (docSnap.exists()) setProfile(docSnap.data());
      } catch (e) { console.error("Error perfil:", e); }

      // 2. Cargar Ventas
      try {
        const qOrders = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', sellerId));
        const salesSnap = await getDocs(qOrders);
        setSalesCount(salesSnap.docs.filter(d => d.data().status === 'completed').length);
      } catch (e) { console.error("Error órdenes:", e); }

      // 3. Cargar Arsenal
      try {
        const qListings = query(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), where('sellerId', '==', sellerId));
        const listingsSnap = await getDocs(qListings);
        setSellerListings(listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(item => item.isActive !== false));
      } catch (e) { console.error("Error Arsenal:", e); }

      // 4. Cargar Estrellas y Reputación
      try {
        const qRatings = query(collection(db, 'artifacts', appId, 'users', sellerId, 'ratings'));
        const ratingsSnap = await getDocs(qRatings);
        const fetchedRatings = ratingsSnap.docs.map(d => d.data());
        
        if(fetchedRatings.length > 0) {
           let totalScore = 0;
           fetchedRatings.forEach(r => {
              if(r.type === 'good') totalScore += 5;
              else if(r.type === 'neutral') totalScore += 3;
              else totalScore += 1;
           });
           setAvgRating(totalScore / fetchedRatings.length);
        } else {
           setAvgRating(0);
        }
      } catch (e) { console.error("Error reputación:", e); }

      // 5. LÓGICA DE SEGUIDORES BASADA EN DIRECCIÓN IP
      try {
        // Capturamos la IP actual de la casa/dispositivo
        const currentIp = await getIP();
        // Firebase no permite puntos en los nombres de documentos, así que los cambiamos por guiones bajos
        const sanitizedIp = currentIp.replace(/\./g, '_').replace(/:/g, '_'); 
        setClientIp(sanitizedIp);

        const followersSnap = await getDocs(collection(db, 'artifacts', appId, 'users', sellerId, 'followers'));
        setFollowerCount(followersSnap.size);
        
        if(sanitizedIp) {
           // Verificamos si esta IP específica ya le dio a seguir
           const myFollow = await getDoc(doc(db, 'artifacts', appId, 'users', sellerId, 'followers', sanitizedIp));
           setIsFollowing(myFollow.exists());
        }
      } catch (e) { console.error("Error seguidores:", e); }
    };
    
    load();
  }, [sellerId]);

  // 🔥 ACTUALIZACIÓN OPTIMISTA BASADA EN IP
  const toggleFollow = async () => {
     playSound('click', isMuted);
     
     // Evitamos que un vendedor logueado se siga a sí mismo
     if(user && user.uid === sellerId) return showNotification("No puedes seguirte a ti mismo", "error");
     
     // Si la IP no ha cargado, le pedimos que espere un segundo
     if(!clientIp) return showNotification("Calculando conexión segura, intenta de nuevo.", "error");
     
     const ref = doc(db, 'artifacts', appId, 'users', sellerId, 'followers', clientIp);
     const wasFollowing = isFollowing;

     // 1. Cambiamos la UI instantáneamente para que NO se sienta congelado
     setIsFollowing(!wasFollowing);
     setFollowerCount(prev => wasFollowing ? Math.max(0, prev - 1) : prev + 1);

     // 2. Procesamos la base de datos en segundo plano usando la IP
     try {
       if(wasFollowing) { 
         await deleteDoc(ref); 
       } else { 
         await setDoc(ref, { followedAt: serverTimestamp(), ipOriginal: clientIp }); 
         showNotification("¡COMANDANTE SEGUIDO!", "success");
       }
     } catch (e) {
       console.error("Error al seguir en Firebase:", e);
       // 3. Si Firebase falla de fondo, revertimos los colores y números a como estaban.
       setIsFollowing(wasFollowing);
       setFollowerCount(prev => wasFollowing ? prev + 1 : Math.max(0, prev - 1));
       showNotification("Error de conexión al servidor.", "error");
     }
  };

  const toggleManualVerify = async () => {
     playSound('click', isMuted);
     const newStatus = !profile.isManuallyVerified;
     
     setProfile({...profile, isManuallyVerified: newStatus});
     
     try {
       await updateDoc(doc(db, 'artifacts', appId, 'users', sellerId, 'profile', 'data'), { isManuallyVerified: newStatus });
       showNotification(newStatus ? "Insignia ÉLITE Otorgada" : "Insignia ÉLITE Retirada", "success");
     } catch (e) {
       setProfile({...profile, isManuallyVerified: !newStatus});
       showNotification("Error al cambiar insignia.", "error");
     }
  };

  if (!profile) return null;

  const xp = salesCount * 150;
  const rank = getRankInfo(xp);
  
  const isVerifiedElite = profile.isManuallyVerified || (salesCount >= 1000 && avgRating >= 4.5);

  const renderStars = () => {
     return [1,2,3,4,5].map(star => (
        <Star 
          key={star} 
          fill={star <= Math.round(avgRating) ? "currentColor" : "none"} 
          className={star <= Math.round(avgRating) ? "text-yellow-500 drop-shadow-[0_0_8px_yellow]" : "text-gray-600"} 
          size={24}
        />
     ));
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 overflow-auto backdrop-blur-xl">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
       <div className="hud-panel p-8 md:p-12 max-w-7xl w-full relative animate-enter max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_100px_rgba(255,69,0,0.4)]">
          <button onClick={()=>{playSound('click', isMuted); onClose()}} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-50 transition-colors hover:rotate-90 duration-300">
            <X size={40}/>
          </button>
          
          <div className="flex flex-col lg:flex-row gap-10 relative z-10">
             
             {/* COLUMNA IZQUIERDA (INFO Y ESTADÍSTICAS) */}
             <div className="w-full lg:w-1/3">
                <div className="flex flex-col items-center text-center mb-6 relative group">
                   <div className="absolute inset-0 bg-orange-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                   
                   <div className={`w-40 h-40 rounded-full border-4 ${rank.border} overflow-hidden mb-4 bg-black shadow-[0_0_50px_rgba(255,69,0,0.8)] ${rank.glow} relative z-10`}>
                      {profile.profilePicture ? (
                        <img src={profile.profilePicture} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/> 
                      ) : (
                        <User size={80} className="text-gray-500 m-auto mt-10"/>
                      )}
                   </div>
                   
                   <div className={`text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full border mb-4 ${rank.bg} ${rank.border} ${rank.color} ${rank.glow}`}>
                     <Award size={14} className="inline mr-1 mb-0.5"/> RANGO: {rank.rank}
                   </div>
                   
                   <div className="flex items-center gap-3 justify-center flex-wrap mb-2">
                      <h2 className="text-4xl font-gamer text-white uppercase glitch tracking-wider" data-text={profile.publicUsername}>
                        {profile.publicUsername}
                      </h2>
                      
                      {isVerifiedElite && (
                         <div className="relative group/badge animate-pulse cursor-help" title={profile.isManuallyVerified ? "Verificación Oficial por Soporte" : "Verificación Automática (1000+ Ventas y 4.5+ Estrellas)"}>
                            <div className="flex items-center gap-1 bg-gradient-to-r from-red-900 to-yellow-900 border-2 border-yellow-500 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                               <ShieldCheck className="text-yellow-400" fill="#8B0000" size={18}/>
                               <span className="text-yellow-500 font-black text-xs uppercase tracking-widest">Élite</span>
                            </div>
                         </div>
                      )}
                   </div>
                   
                   <p className="text-yellow-500 font-tech uppercase font-bold tracking-widest flex items-center gap-2 mb-4">
                     <Users size={16}/> {followerCount} Seguidores
                   </p>

                   {user?.uid !== sellerId && (
                      <button onClick={toggleFollow} className={`w-full py-3 font-black uppercase tracking-widest border-2 transition-all ${isFollowing ? 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-red-900 hover:border-red-500 hover:text-red-400' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-orange-400 shadow-[0_0_20px_rgba(255,69,0,0.5)] hover:scale-105'}`}>
                         {isFollowing ? '✅ SIGUIENDO' : 'SEGUIR COMANDANTE'}
                      </button>
                   )}
                   {user?.uid === sellerId && <p className="text-xs text-gray-500 mt-2 italic">Estás viendo tu propio perfil público.</p>}
                   
                   {/* BOTON SECRETO PARA AGENTES DE SOPORTE */}
                   {userData && (userData.role === 'admin' || userData.role === 'support') && (
                      <button onClick={toggleManualVerify} className="w-full py-2 mt-4 font-black uppercase tracking-widest border-2 border-purple-500 bg-purple-900/40 text-purple-300 hover:bg-purple-600 hover:text-white transition-all text-xs shadow-[0_0_15px_rgba(128,0,128,0.3)]">
                         [ADMIN] {profile.isManuallyVerified ? 'RETIRAR INSIGNIA ÉLITE' : 'OTORGAR INSIGNIA ÉLITE'}
                      </button>
                   )}
                </div>

                <div className="space-y-4 mb-8">
                   <div className="bg-black/60 p-5 border-2 border-gray-800 text-center hover:border-yellow-500 transition-all hover:scale-105 shadow-lg group">
                      <p className="text-sm text-gray-400 uppercase font-tech tracking-wider group-hover:text-yellow-500">Ventas Completadas</p>
                      <p className="text-5xl font-gamer text-yellow-500 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] mt-2">{salesCount}</p>
                   </div>
                   
                   <div className="bg-black/60 p-5 border-2 border-gray-800 text-center hover:border-green-500 transition-all hover:scale-105 shadow-lg group">
                      <p className="text-sm text-gray-400 uppercase font-tech tracking-wider group-hover:text-green-400">Reputación ({avgRating.toFixed(1)})</p>
                      <div className="flex justify-center mt-3 gap-1">
                         {renderStars()}
                      </div>
                   </div>
                </div>

                <div className="space-y-3 text-base text-gray-200 font-mono border-t-2 border-gray-800 pt-6 bg-black/40 p-4 rounded-lg">
                   <p className="flex justify-between border-b border-gray-800 pb-2"><span className="text-orange-500 font-bold">Admin:</span> <span>{profile.adminName}</span></p>
                   <p className="flex justify-between border-b border-gray-800 pb-2"><span className="text-orange-500 font-bold">Whatsapp:</span> <span>{profile.whatsapp}</span></p>
                   <p className="flex justify-between"><span className="text-orange-500 font-bold">Miembro desde:</span> <span>{new Date(profile.createdAt).toLocaleDateString()}</span></p>
                </div>
             </div>

             {/* COLUMNA DERECHA (PESTAÑAS) */}
             <div className="w-full lg:w-2/3 border-l-2 border-gray-800 pl-0 lg:pl-10">
                
                <div className="flex gap-6 mb-8 border-b-2 border-gray-800 pb-4 overflow-x-auto custom-scrollbar">
                   <button onClick={()=>{playSound('click', isMuted); setActiveTab('arsenal')}} className={`font-tech text-2xl md:text-3xl uppercase tracking-widest flex items-center gap-3 transition-all whitespace-nowrap ${activeTab==='arsenal'?'text-white text-shadow-glow border-b-2 border-orange-500 pb-2':'text-gray-500 hover:text-gray-300'}`}>
                     <Flame className={activeTab==='arsenal' ? "text-orange-500 animate-pulse" : "text-gray-500"} size={36}/> Arsenal <span className={activeTab==='arsenal'?"text-orange-500":"text-gray-600"}>[{sellerListings.length}]</span>
                   </button>
                   <button onClick={()=>{playSound('click', isMuted); setActiveTab('references')}} className={`font-tech text-2xl md:text-3xl uppercase tracking-widest flex items-center gap-3 transition-all whitespace-nowrap ${activeTab==='references'?'text-white text-shadow-glow border-b-2 border-cyan-500 pb-2':'text-gray-500 hover:text-gray-300'}`}>
                     <Star className={activeTab==='references' ? "text-cyan-500 animate-pulse" : "text-gray-500"} size={36}/> Referencias <span className={activeTab==='references'?"text-cyan-500":"text-gray-600"}>[{profile.references?.length || 0}]</span>
                   </button>
                </div>

                {activeTab === 'arsenal' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {sellerListings.length === 0 ? (
                        <div className="col-span-2 text-center py-20 border-2 border-dashed border-gray-700 bg-black/50">
                          <p className="text-gray-500 italic text-xl">Este vendedor no tiene suministros activos o está de vacaciones.</p>
                        </div>
                      ) : (
                        sellerListings.map((item, index) => (
                          <ProductCard key={item.id} item={item} index={index} onBuy={() => { onClose(); onBuy(item); }} onViewSeller={() => {}} />
                        ))
                      )}
                   </div>
                ) : (
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-enter">
                      {(!profile.references || profile.references.length === 0) ? (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-700 bg-black/50">
                          <p className="text-gray-500 italic text-xl font-tech uppercase tracking-widest">El comandante aún no ha subido referencias de ventas.</p>
                        </div>
                      ) : (
                        profile.references.map((img, i) => (
                          <div key={i} className="relative group/ref overflow-hidden border-2 border-cyan-900 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:border-cyan-400 transition-colors cursor-pointer">
                             <div className="absolute inset-0 bg-cyan-600/20 opacity-0 group-hover/ref:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                             <img src={img} onError={(e)=>e.target.style.display='none'} className="w-full h-48 object-cover group-hover/ref:scale-125 transition-transform duration-500" />
                          </div>
                        ))
                      )}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

// ============================================================================
// 12. DASHBOARD DEL VENDEDOR (EDITAR PERFIL, FINANZAS, INVENTARIO)
// ============================================================================
const Dashboard = ({ user, userData, listings, setView, showNotification, setViewSellerId, isMuted }) => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => { 
    const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', user.uid)), (snap) => {
      setOrders(snap.docs.map(d => ({id:d.id, ...d.data()})));
    }); 
    return () => unsub(); 
  }, [user.uid]);

  const myListings = listings.filter(l => l.sellerId === user.uid);
  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.payment.totalUSD), 0);
  const pendingCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedSales = orders.filter(o => o.status === 'completed').length;
  
  const xp = completedSales * 150; 
  const rank = getRankInfo(xp); 
  const nextLevelXp = (Math.floor(xp/500)+1)*500; 
  const xpPercentage = (xp / nextLevelXp) * 100;

  const togglePause = async (id, currentStatus) => { 
    playSound('click', isMuted); 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', id), { isActive: !currentStatus }); 
    showNotification(currentStatus ? "ARTÍCULO PAUSADO" : "ARTÍCULO ACTIVADO", "success"); 
  };

  const pauseAll = async () => { 
    playSound('click', isMuted); 
    if(!confirm("¿Pausar TODO tu inventario? (Modo Vacaciones)")) return; 
    for(let item of myListings) { 
      if(item.isActive !== false) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', item.id), { isActive: false }); 
      }
    } 
    showNotification("MODO VACACIONES ACTIVADO", "success"); 
  };

  return (
    <div className="animate-enter max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 border-b-4 border-gray-800 pb-8 bg-black/40 p-8 rounded-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent pointer-events-none"></div>
        
        <div className="text-center md:text-left relative z-10 w-full md:w-auto">
          <h2 className="text-5xl md:text-7xl font-gamer text-white uppercase italic text-shadow-glow drop-shadow-[0_0_20px_rgba(255,69,0,0.8)] mb-2">Base de Mando</h2>
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <p className="font-tech text-cyan-400 tracking-[0.4em] text-xl uppercase font-bold bg-cyan-900/30 px-4 py-1 border border-cyan-500/50">
              Comandante {userData?.adminName}
            </p>
            <span className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${rank.bg} ${rank.border} ${rank.color} ${rank.glow}`}>
              <Award size={14} className="inline mr-1 mb-0.5"/> RANGO: {rank.rank}
            </span>
          </div>
          
          <div className="mt-6 max-w-md w-full">
            <div className="flex justify-between text-xs font-tech font-bold text-gray-400 mb-1">
              <span>XP ACTUAL: {xp}</span>
              <span>PRÓXIMO NIVEL: {nextLevelXp} XP</span>
            </div>
            <div className="xp-bar-container">
              <div className="xp-bar-fill" style={{width: `${xpPercentage}%`}}></div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8 md:mt-0 relative z-10 justify-center">
          <button onClick={() => {playSound('click', isMuted); setViewSellerId(user.uid)}} className="btn-secondary-ff px-6 py-4 flex items-center gap-2 border-cyan-500 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-600 hover:text-white font-bold">
            <Eye size={20}/> MI PERFIL PÚBLICO
          </button>
          <button onClick={() => {playSound('click', isMuted); setView('edit-profile')}} className="btn-secondary-ff px-6 py-4 flex items-center gap-2 font-bold">
            <Edit size={20}/> EDITAR PERFIL
          </button>
          <button onClick={() => {playSound('click', isMuted); setView('create')}} className="btn-ff px-8 py-4 flex items-center gap-3 text-xl shadow-[0_0_30px_rgba(255,69,0,0.6)]">
            <Plus size={24} className="animate-spin-slow" /> NUEVO DESPLIEGUE
          </button>
        </div>
      </div>

      {/* MÉTRICAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="hud-panel p-6 bg-gradient-to-br from-green-900/40 to-black border-green-500">
          <h3 className="text-green-400 font-tech uppercase tracking-widest text-sm mb-2 flex items-center gap-2"><Activity size={18}/> Ingresos Totales</h3>
          <p className="text-5xl font-gamer text-white drop-shadow-[0_0_15px_green]">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="hud-panel p-6 bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500">
          <h3 className="text-yellow-400 font-tech uppercase tracking-widest text-sm mb-2 flex items-center gap-2"><RefreshCw size={18}/> Órdenes en Proceso</h3>
          <p className="text-5xl font-gamer text-white drop-shadow-[0_0_15px_yellow]">{pendingCount}</p>
        </div>
        <div className="hud-panel p-6 bg-gradient-to-br from-blue-900/40 to-black border-blue-500">
          <h3 className="text-blue-400 font-tech uppercase tracking-widest text-sm mb-2 flex items-center gap-2"><CheckSquare size={18}/> Ventas Cerradas</h3>
          <p className="text-5xl font-gamer text-white drop-shadow-[0_0_15px_blue]">{completedSales}</p>
        </div>
      </div>

      <PaymentMethodsManager user={user} showNotification={showNotification} isMuted={isMuted} />
      <SalesOrders user={user} isMuted={isMuted}/>
      
      {/* INVENTARIO DEL VENDEDOR */}
      <div className="mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center bg-black/50 p-4 border-l-4 border-yellow-500 rounded mb-8 gap-4">
          <h3 className="font-tech text-3xl text-white uppercase tracking-[0.2em] flex items-center gap-4 text-shadow-glow">
            <Trophy className="text-yellow-500 drop-shadow-[0_0_10px_yellow]" size={36}/> Inventario Activo <span className="text-gray-500">[{myListings.length}]</span>
          </h3>
          <button onClick={pauseAll} className="text-red-400 border border-red-500 bg-red-900/30 hover:bg-red-600 hover:text-white px-4 py-2 font-bold tracking-widest uppercase rounded flex items-center gap-2 text-sm">
            <Ban size={16}/> Pausar Todo (Vacaciones)
          </button>
        </div>

        <div className="space-y-6">
          {myListings.length === 0 && (
            <div className="text-center py-20 bg-black/50 border-2 border-dashed border-gray-700 rounded-xl">
              <p className="text-2xl text-gray-500 font-tech uppercase tracking-widest">No hay suministros desplegados.</p>
            </div>
          )}

          {myListings.map(item => { 
            const isActive = item.isActive !== false; 
            return (
              <div key={item.id} className={`hud-panel p-6 flex flex-col md:flex-row items-center gap-8 hover:bg-gray-900/80 transition-all shadow-lg ${!isActive && 'opacity-60 grayscale'}`}>
                
                <div className="w-32 h-32 bg-black border-2 border-orange-600 shrink-0 overflow-hidden relative group">
                  <img src={item.images?.[0]} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                </div>
                
                <div className="flex-grow text-center md:text-left">
                  <h4 className="font-black font-tech text-3xl text-white uppercase tracking-wider mb-2 drop-shadow-md">{item.title}</h4>
                  <span className="text-yellow-500 font-gamer text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">{formatCurrency(item.price)}</span> 
                  {!isActive && <span className="ml-4 text-xs font-black bg-red-900 text-red-400 px-2 py-1 rounded">PAUSADO</span>}
                </div>
                
                <div className="flex flex-wrap justify-center gap-3">
                   <button onClick={() => togglePause(item.id, isActive)} className={`px-4 py-3 font-bold border-2 transition-all flex items-center gap-2 ${isActive ? 'bg-orange-900/40 text-orange-400 border-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-green-900/40 text-green-400 border-green-500 hover:bg-green-500 hover:text-white'}`}>
                     {isActive ? <PauseCircle size={18}/> : <PlayCircle size={18}/>} {isActive ? 'PAUSAR' : 'ACTIVAR'}
                   </button>
                   <button onClick={() => {playSound('click', isMuted); setView(`edit-${item.id}`)}} className="btn-secondary-ff px-4 py-3 flex items-center gap-2 font-bold">
                     <Edit size={18}/> EDITAR
                   </button>
                </div>

              </div>
            )
          })} 
        </div>
      </div>
    </div>
  );
};

const EditProfileForm = ({ user, userData, setView, showNotification, isMuted }) => {
  const [formData, setFormData] = useState({ 
     firstName: userData?.firstName||'', 
     lastName: userData?.lastName||'', 
     whatsapp: userData?.whatsapp||'', 
     publicUsername: userData?.publicUsername||'', 
     adminName: userData?.adminName||'',
     profilePicture: userData?.profilePicture||'', 
     references: userData?.references||[]
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
     e.preventDefault(); 
     setLoading(true); 
     playSound('click', isMuted);
     try {
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), formData);
        showNotification("PERFIL ACTUALIZADO CON ÉXITO", "success"); 
        playSound('success', isMuted); 
        setView('dashboard');
     } catch (e) { 
        showNotification("ERROR AL ACTUALIZAR", "error"); 
        playSound('error', isMuted);
     } finally { 
        setLoading(false); 
     }
  };

  const handleProfilePicChange = async (e) => {
     if(e.target.files[0]) {
        playSound('click', isMuted);
        const compressed = await compressImage(e.target.files[0]);
        setFormData({...formData, profilePicture: compressed});
     }
  };

  const handleRefsChange = async (e) => {
     playSound('click', isMuted);
     const files = Array.from(e.target.files);
     const newRefs = await Promise.all(files.map(f => compressImage(f)));
     setFormData(prev => ({...prev, references: [...prev.references, ...newRefs]}));
  };

  const removeRef = (index) => {
     playSound('click', isMuted);
     const newRefs = [...formData.references]; 
     newRefs.splice(index, 1);
     setFormData({...formData, references: newRefs});
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-enter hud-panel p-10 md:p-14 shadow-[0_0_80px_rgba(255,69,0,0.5)]">
       <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-orange-600 pb-6 mb-8 gap-4">
          <h2 className="text-4xl font-gamer text-white uppercase text-shadow-glow flex items-center gap-3">
            <Edit className="text-orange-500"/> MODIFICAR PERFIL
          </h2>
          <button onClick={()=>{playSound('click', isMuted); setView('dashboard')}} className="text-gray-400 hover:text-white font-bold">
            &lt;&lt; CANCELAR
          </button>
       </div>
       
       <form onSubmit={handleUpdate} className="space-y-8">
          
          <div className="flex flex-col md:flex-row gap-8 items-center bg-black/50 p-6 rounded-lg border border-gray-800">
             <div className="relative group w-32 h-32 rounded-full border-4 border-orange-500 bg-black overflow-hidden shadow-[0_0_20px_rgba(255,69,0,0.5)] flex-shrink-0">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover" /> 
                ) : (
                  <User size={64} className="text-gray-500 m-auto mt-8"/>
                )}
                <label className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs uppercase backdrop-blur-sm">
                   <Camera size={28} className="mb-1 text-orange-500 animate-pulse" /> CAMBIAR AVATAR
                   <input type="file" hidden accept="image/*" onChange={handleProfilePicChange} />
                </label>
             </div>
             <div className="text-center md:text-left">
                <h3 className="text-2xl font-tech text-white uppercase tracking-widest text-shadow-glow mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <ImageIcon size={20} className="text-orange-500"/> Identidad Visual
                </h3>
                <p className="text-gray-400 text-sm font-mono leading-relaxed">
                  Sube tu logo o avatar personalizado. Si no subes ninguno, aparecerá un ícono anónimo para proteger tu privacidad.
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 border border-gray-800 rounded">
             <div className="input-wrapper">
               <User className="w-6 h-6"/><input name="firstName" value={formData.firstName} onChange={e=>setFormData({...formData, firstName:e.target.value})} className="input-ff w-full p-4 text-lg" placeholder="Nombres" required/>
             </div>
             <div className="input-wrapper">
               <User className="w-6 h-6"/><input name="lastName" value={formData.lastName} onChange={e=>setFormData({...formData, lastName:e.target.value})} className="input-ff w-full p-4 text-lg" placeholder="Apellidos" required/>
             </div>
             <div className="input-wrapper">
               <Smartphone className="w-6 h-6"/><input name="whatsapp" value={formData.whatsapp} onChange={e=>setFormData({...formData, whatsapp:e.target.value})} className="input-ff w-full p-4 text-lg" placeholder="Whatsapp" required/>
             </div>
             <div className="input-wrapper">
               <UserCheck className="w-6 h-6"/><input name="publicUsername" value={formData.publicUsername} onChange={e=>setFormData({...formData, publicUsername:e.target.value})} className="input-ff w-full p-4 text-lg" placeholder="Alias Público" required/>
             </div>
             <div className="input-wrapper md:col-span-2">
               <Shield className="w-6 h-6"/><input name="adminName" value={formData.adminName} onChange={e=>setFormData({...formData, adminName:e.target.value})} className="input-ff w-full p-4 text-lg" placeholder="Nombre Real / Empresa" required/>
             </div>
          </div>

          <div className="mt-8 border-t-2 border-dashed border-gray-800 pt-8">
             <h3 className="text-xl font-tech text-cyan-400 uppercase tracking-widest flex items-center gap-3 mb-2 text-shadow-glow">
               <Star size={24}/> Referencias de Ventas y Reputación
             </h3>
             <p className="text-gray-400 text-sm font-mono mb-6 leading-relaxed">
               Sube capturas de pantalla de tus ventas exitosas, conversaciones con clientes satisfechos o reputación previa. Esto generará confianza masiva en los nuevos compradores.
             </p>
             
             <div className="border-2 border-dashed border-cyan-900 bg-cyan-900/10 p-8 text-center hover:border-cyan-500 hover:bg-cyan-900/20 transition-all group rounded-xl shadow-inner cursor-pointer relative overflow-hidden">
                <Upload size={48} className="mx-auto mb-4 text-cyan-700 group-hover:text-cyan-400 transition-colors drop-shadow-md group-hover:scale-110 duration-300"/>
                <label className="cursor-pointer text-lg font-black uppercase tracking-widest text-gray-400 group-hover:text-white relative z-10 w-full block">
                   [ + Clic Aquí Para Anexar Capturas + ] 
                   <input type="file" hidden multiple accept="image/*" onChange={handleRefsChange}/>
                </label>
                
                {formData.references.length > 0 && (
                   <div className="flex flex-wrap gap-4 mt-8 justify-center relative z-10 bg-black/80 p-6 rounded border border-cyan-900/50 shadow-[inset_0_0_20px_rgba(0,255,255,0.1)]">
                      {formData.references.map((img, i) => (
                         <div key={i} className="relative group/img">
                            <img src={img} className="w-24 h-24 object-cover border-2 border-cyan-500 rounded shadow-[0_0_15px_rgba(0,255,255,0.3)]"/>
                            <button type="button" onClick={() => removeRef(i)} className="absolute -top-3 -right-3 bg-red-600 border-2 border-black text-white p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:scale-125 shadow-lg">
                              <X size={14}/>
                            </button>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

          <button disabled={loading} className="w-full btn-ff py-6 text-3xl mt-8 shadow-[0_0_40px_rgba(255,69,0,0.6)] hover:shadow-[0_0_60px_rgba(255,69,0,1)] tracking-widest">
            {loading ? "ACTUALIZANDO SISTEMA..." : "GUARDAR CAMBIOS"}
          </button>
       </form>
    </div>
  );
};

const PaymentMethodsManager = ({ user, showNotification, isMuted }) => {
  const [methods, setMethods] = useState([]); 
  const [newMethod, setNewMethod] = useState({ name: '', currency: 'VES', details: '' }); 
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { 
    if (!user) return; 
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods'), (snap) => {
      setMethods(snap.docs.map(d => ({id: d.id, ...d.data()})));
    }); 
    return () => unsub(); 
  }, [user]);

  const handleAdd = async (e) => { 
    e.preventDefault(); 
    playSound('click', isMuted); 
    if(!newMethod.name || !newMethod.details) return showNotification("COMPLETE TODOS LOS CAMPOS", "error"); 
    setLoading(true); 
    try { 
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods'), newMethod); 
      setNewMethod({ name: '', currency: 'VES', details: '' }); 
      showNotification("MÉTODO AGREGADO", "success"); 
      playSound('success', isMuted); 
    } catch(e) { 
      showNotification("ERROR AL GUARDAR", "error"); 
    } finally { 
      setLoading(false); 
    } 
  };

  const handleDelete = async (id) => { 
    if(confirm("¿ELIMINAR MÉTODO?")) { 
      playSound('click', isMuted); 
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods', id)); 
    } 
  };

  return (
    <div className="hud-panel p-8 mt-12 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
      <h3 className="font-tech text-2xl text-cyan-400 mb-8 uppercase flex items-center gap-3 tracking-widest text-shadow-glow">
        <CreditCard size={32}/> Métodos de Recepción
      </h3>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 bg-black/60 p-6 border-2 border-gray-800 rounded">
         <div className="input-wrapper">
           <Banknote className="w-6 h-6"/><input placeholder="Nombre (Ej: Pago Móvil)" value={newMethod.name} onChange={e=>setNewMethod({...newMethod, name: e.target.value})} className="input-ff p-4 w-full text-lg" />
         </div>
         <select value={newMethod.currency} onChange={e=>setNewMethod({...newMethod, currency: e.target.value})} className="input-ff p-4 bg-black text-lg border-2 border-gray-700">
           <option value="VES">Bolívares (VES)</option>
           <option value="USDT">USDT (Binance)</option>
           <option value="USD">Zelle / USD</option>
         </select>
         <textarea placeholder="Datos (Banco, Teléfono, CI, Email...)" value={newMethod.details} onChange={e=>setNewMethod({...newMethod, details: e.target.value})} className="input-ff p-4 md:col-span-2 h-16 pt-3 text-sm font-mono" />
         <button disabled={loading} className="btn-ff py-4 md:col-span-4 flex justify-center items-center gap-3 text-xl tracking-widest">
           <Plus size={24}/> AGREGAR A BÓVEDA
         </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {methods.map(m => (
            <div key={m.id} className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 p-6 relative group hover:border-cyan-500 transition-all hover:scale-[1.02] shadow-lg rounded">
               <button onClick={() => handleDelete(m.id)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:rotate-90 bg-black/50 p-1 rounded">
                 <X size={20}/>
               </button>
               <h4 className="font-black text-white uppercase text-xl mb-3 flex items-center justify-between">
                 {m.name} <span className="text-xs bg-cyan-900/40 border border-cyan-500 px-3 py-1 text-cyan-400 rounded-sm">{m.currency}</span>
               </h4>
               <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap font-mono bg-black/50 p-3 rounded border border-gray-800">{m.details}</p>
            </div>
         ))}
      </div>
    </div>
  );
};

const SalesOrders = ({ user, isMuted }) => {
  const [orders, setOrders] = useState([]); 
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  useEffect(() => { 
    if (!user) return; 
    const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', user.uid)), (snap) => { 
      let fetched = snap.docs.map(d => ({id: d.id, ...d.data()})); 
      fetched.sort((a,b) => new Date(b.date) - new Date(a.date)); 
      setOrders(fetched); 
    }); 
    return () => unsub(); 
  }, [user]);

  const updateOrderStatus = async (newStatus) => { 
    if(!selectedOrder?.id) return; 
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', selectedOrder.id), { status: newStatus }); 
    setSelectedOrder(prev => ({...prev, status: newStatus})); 
  };

  return (
    <div className="mt-12 hud-panel p-8 shadow-[0_0_40px_rgba(0,255,0,0.1)]">
      <h3 className="font-tech text-2xl text-green-400 mb-8 uppercase flex items-center gap-3 tracking-widest text-shadow-glow">
        <RefreshCw size={32} className="animate-spin-slow"/> Radar de Ventas (Entrantes)
      </h3>
      <div className="space-y-6">
        {orders.length === 0 && (
          <p className="text-gray-500 font-tech uppercase text-xl text-center py-10 bg-black/50 border border-dashed border-gray-700">
            Sin operaciones activas.
          </p>
        )}
        {orders.map(order => (
          <div key={order.id} className="bg-gradient-to-r from-gray-900 to-black border-2 border-gray-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-green-500 transition-all hover:scale-[1.01] shadow-lg rounded">
            <div>
              <p className="text-orange-500 font-bold text-sm bg-orange-900/20 inline-block px-2 py-1 mb-2 border border-orange-500/50">#{order.orderId}</p>
              {order.supportRequested && <p className="ml-2 text-purple-400 font-bold text-xs bg-purple-900/40 inline-block px-2 py-1 mb-2 border border-purple-500 animate-pulse">SOPORTE</p>}
              <p className="text-white font-black text-xl uppercase tracking-wider mb-1">{order.item.title}</p>
              <p className="text-sm text-gray-400 font-mono">Cliente: {order.buyer.firstName} {order.buyer.lastName}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-yellow-500 font-gamer text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] mb-2">${order.payment.totalUSD}</p>
              <span className={`text-xs px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-[0_0_15px_currentColor] ${order.status === 'completed' ? 'bg-green-500 text-black' : order.status === 'cancelled' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-black'}`}>
                {order.status === 'created' ? 'NUEVA' : order.status === 'payment_reported' ? 'PAGO REPORTADO' : order.status === 'payment_confirmed' ? 'DATOS ENVIADOS' : order.status === 'cancelled' ? 'CANCELADA' : 'COMPLETADA'}
              </span>
            </div>
            <button onClick={() => {playSound('click', isMuted); setSelectedOrder(order)}} className="btn-secondary-ff px-6 py-4 text-sm flex gap-3 font-bold tracking-widest border-cyan-500 bg-cyan-900/20 hover:bg-cyan-600 hover:text-white">
              <MessageSquare size={20}/> GESTIONAR
            </button>
          </div>
        ))}
      </div>
      
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="hud-panel p-8 max-w-6xl w-full h-[85vh] flex flex-col relative shadow-[0_0_80px_rgba(0,255,255,0.3)] border-cyan-600">
            <button onClick={() => {playSound('click', isMuted); setSelectedOrder(null)}} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-300 z-50">
              <X size={40}/>
            </button>
            <h3 className="text-4xl font-gamer text-white mb-8 border-b-2 border-cyan-600 pb-4 flex items-center gap-4 text-shadow-glow">
              <Crosshair className="text-cyan-400" size={40}/> Operación #{selectedOrder.orderId}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
              <div className="overflow-y-auto pr-4 space-y-6 text-base custom-scrollbar">
                
                <div className="bg-gray-900/80 p-4 rounded border-l-4 border-orange-500 shadow-md">
                  <h4 className="text-orange-400 font-black mb-2 uppercase tracking-widest flex items-center gap-2">
                    <User size={18}/> DATOS DEL CLIENTE
                  </h4>
                  <p className="mb-1"><span className="text-gray-500">Nombre:</span> <span className="text-white font-bold">{selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}</span></p>
                  <p className="mb-1"><span className="text-gray-500">Cédula / ID:</span> <span className="text-white font-bold">{selectedOrder.buyer.idNumber}</span></p>
                  <p className="mb-1"><span className="text-gray-500">Whatsapp:</span> <span className="text-white font-bold">{selectedOrder.buyer.whatsapp}</span></p>
                  <p><span className="text-gray-500">Ubicación:</span> <span className="text-white font-bold">{selectedOrder.buyer.state}, {selectedOrder.buyer.country}</span></p>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded border-l-4 border-cyan-500 shadow-md">
                  <h4 className="text-cyan-400 font-black mb-2 uppercase tracking-widest flex items-center gap-2">
                    <Receipt size={18}/> DATOS FINANCIEROS
                  </h4>
                  <p className="mb-1"><span className="text-gray-500">Monto:</span> <span className="text-yellow-500 font-gamer text-2xl">${selectedOrder.payment.totalUSD}</span></p>
                  <p className="mb-1"><span className="text-gray-500">Método:</span> <span className="text-white font-bold">{selectedOrder.payment.method} ({selectedOrder.payment.currency})</span></p>
                  {selectedOrder.payment.currency === 'VES' && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded">
                      <p className="text-sm text-green-400 mb-1">Tasa: {selectedOrder.payment.rateUsed}</p>
                      <p className="text-2xl font-black text-green-400">Total VES: {formatCurrency(selectedOrder.payment.totalVES, 'VES')}</p>
                    </div>
                  )}
                </div>

              </div>
              <div className="flex flex-col h-full">
                <ChatSystem orderId={selectedOrder.id} currentUserRole="VENDEDOR" currentUserId={user.uid} orderStatus={selectedOrder.status} onUpdateStatus={updateOrderStatus} orderData={selectedOrder} isMuted={isMuted}/>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ListingForm = ({ user, userData, setView, showNotification, mode = 'create', editId = null, listings = [], isMuted }) => {
  const [data, setData] = useState({ title: '', price: '', description: '', images: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && editId) { 
      const item = listings.find(l => l.id === editId); 
      if (item) setData({ title: item.title, price: item.price, description: item.description, images: item.images || [] }); 
    }
  }, [mode, editId, listings]);

  const handleFileChange = async (e) => {
    playSound('click', isMuted);
    const files = Array.from(e.target.files); 
    const newImages = await Promise.all(files.map(f => compressImage(f)));
    setData(prev => ({...prev, images: [...prev.images, ...newImages]}));
  };

  const handleSave = async (e) => {
    e.preventDefault(); 
    playSound('click', isMuted);
    
    if(data.images.length === 0) return showNotification("SE REQUIERE AL MENOS UNA IMAGEN", "error");
    
    setLoading(true);
    try {
       const payload = { 
         ...data, 
         price: Number(data.price), 
         sellerId: user.uid, 
         adminName: userData.adminName, 
         sellerUsername: userData.publicUsername, 
         updatedAt: serverTimestamp() 
       };
       if(mode === 'create') {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), { ...payload, createdAt: serverTimestamp(), isActive: true });
       } else {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', editId), payload);
       }
       showNotification("ARSENAL PUBLICADO CON ÉXITO", "success"); 
       playSound('success', isMuted); 
       setView('dashboard');
    } catch(e) { 
      showNotification("ERROR DE TRANSMISIÓN", "error"); 
      playSound('error', isMuted); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto hud-panel p-10 md:p-14 mt-12 animate-enter shadow-[0_0_80px_rgba(255,69,0,0.5)] border-2 border-orange-500 bg-black/90 backdrop-blur-xl">
       <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b-2 border-orange-600 pb-6">
         <h2 className="text-4xl md:text-5xl font-gamer text-white uppercase italic text-shadow-glow flex items-center gap-4">
           <Flame size={48} className="text-orange-500 animate-pulse"/> {mode === 'create' ? 'Inicializando Despliegue' : 'Modificando Activo'}
         </h2>
         <button onClick={() => {playSound('click', isMuted); setView('dashboard')}} className="mt-6 md:mt-0 text-gray-400 hover:text-red-500 transition-all hover:rotate-90 hover:scale-125 duration-300 bg-black/50 p-2 rounded-full border border-gray-700 hover:border-red-500">
           <X size={36} />
         </button>
       </div>
       
       <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2">
               <label className="block text-cyan-400 font-bold mb-2 uppercase tracking-widest text-sm">Título del Suministro</label>
               <input placeholder="Ej: Cuenta Sakura Veterana" className="input-ff w-full p-5 text-2xl" value={data.title} onChange={e => setData({...data, title: e.target.value})} required />
             </div>
             <div>
               <label className="block text-yellow-500 font-bold mb-2 uppercase tracking-widest text-sm">Valor (USD)</label>
               <input type="number" placeholder="Ej: 150" className="input-ff w-full p-5 text-yellow-500 font-gamer text-3xl shadow-[inset_0_0_15px_rgba(255,215,0,0.2)]" value={data.price} onChange={e => setData({...data, price: e.target.value})} required />
             </div>
          </div>
          
          <div>
            <label className="block text-cyan-400 font-bold mb-2 uppercase tracking-widest text-sm">Informe Detallado de Combate</label>
            <textarea placeholder="Especificar armas evolutivas, pases élite..." className="input-ff w-full p-5 h-48 text-lg font-mono" value={data.description} onChange={e => setData({...data, description: e.target.value})} required />
          </div>
          
          <div className="border-4 border-dashed border-gray-700 bg-black/50 p-10 text-center hover:border-orange-500 hover:bg-orange-900/10 transition-all group rounded-xl shadow-inner cursor-pointer relative">
             <Camera size={64} className="mx-auto mb-4 text-gray-600 group-hover:text-orange-500 transition-colors drop-shadow-md group-hover:drop-shadow-[0_0_15px_orange] group-hover:scale-110 duration-300"/>
             <label className="cursor-pointer text-lg font-black uppercase tracking-widest text-gray-400 group-hover:text-white relative z-10 w-full block">
               [ + Click Para Anexar Evidencia + ] 
               <input type="file" hidden multiple accept="image/*" onChange={handleFileChange}/>
             </label>
             
             {data.images.length > 0 && (
               <div className="flex flex-wrap gap-4 mt-8 justify-center relative z-10 bg-black/80 p-6 rounded border border-gray-800">
                 {data.images.map((img, i) => (
                   <div key={i} className="relative group/img">
                     <img src={img} className="w-24 h-24 object-cover border-2 border-orange-500 rounded shadow-[0_0_15px_rgba(255,69,0,0.5)] group-hover/img:scale-150 transition-transform duration-300 z-10 relative"/>
                     {i === 0 && <span className="absolute -top-3 -left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded border border-white z-20 uppercase">Portada</span>}
                   </div>
                 ))}
               </div>
             )}
          </div>
          
          <button disabled={loading} className="w-full btn-ff py-6 text-3xl shadow-[0_0_60px_rgba(255,69,0,0.6)] hover:shadow-[0_0_80px_rgba(255,69,0,1)] tracking-[0.2em] relative">
            <span className="relative z-10 flex items-center justify-center gap-4">
              {loading ? <><RefreshCw className="animate-spin"/> TRANSMITIENDO DATOS...</> : <><Upload className="animate-bounce"/> PUBLICAR ARSENAL AHORA</>}
            </span>
          </button>
       </form>
    </div>
  );
};

// ============================================================================
// 13. AUTH: LOGIN Y REGISTRO (CON RECOLECCIÓN TOTAL DE DATOS)
// ============================================================================
const LoginForm = ({ setView, showNotification, isMuted }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [showRecover, setShowRecover] = useState(false);
  
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    playSound('click', isMuted); 
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
      setView('dashboard'); 
      showNotification("CREDENCIALES ACEPTADAS.", "success"); 
      playSound('success', isMuted); 
    } catch (error) { 
      showNotification("Error de autenticación. Verifique sus datos.", "error"); 
      playSound('error', isMuted); 
    } 
  };
  
  const handleRecover = async (e) => { 
    e.preventDefault(); 
    playSound('click', isMuted); 
    if(!email) return showNotification("INGRESE SU CORREO", "error"); 
    try { 
      await sendPasswordResetEmail(auth, email); 
      showNotification("ENLACE ENVIADO. Revisa tu carpeta de SPAM.", "success"); 
      setShowRecover(false); 
    } catch (error) { 
      showNotification("Error al recuperar.", "error"); 
    } 
  };

  return (
    <div className="max-w-md mx-auto mt-20 relative animate-enter">
      <div className="absolute -left-64 top-[-50px] hidden xl:block animate-floatExtreme pointer-events-none z-[8]">
        <img src={proxyImg('https://freelogopng.com/images/all_img/1664286161free-fire-characters-png.png')} onError={(e)=>e.target.style.display='none'} className="h-[500px] opacity-70 drop-shadow-[0_0_50px_rgba(255,69,0,0.8)] mix-blend-screen" />
      </div>
      <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 via-yellow-500 to-red-600 rounded-xl blur-xl opacity-60 animate-pulse"></div>
      
      <div className="hud-panel p-10 md:p-14 relative z-10 bg-black/95 shadow-[0_0_80px_rgba(255,69,0,0.8)] border-2 border-orange-500">
        {showRecover ? (
          <div className="animate-enter">
            <h3 className="text-3xl font-gamer text-white uppercase text-center mb-8 text-shadow-glow">Recuperar Acceso</h3>
            <div className="bg-cyan-900/20 border-l-4 border-cyan-500 p-4 mb-6 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <p className="text-sm text-cyan-400 font-bold tracking-wide">
                <span className="text-white">NOTA:</span> El enlace llegará a su correo. Si no lo visualiza, <span className="text-yellow-400">revise la carpeta de Spam.</span>
              </p>
            </div>
            <form onSubmit={handleRecover} className="space-y-8">
              <div className="input-wrapper">
                <Mail className="w-6 h-6"/>
                <input type="email" required className="input-ff w-full p-5 text-lg" placeholder="CORREO REGISTRADO" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowRecover(false)} className="flex-1 btn-secondary-ff py-4 text-lg font-bold">CANCELAR</button>
                <button type="submit" className="flex-1 btn-ff py-4 text-lg shadow-[0_0_20px_rgba(255,69,0,0.5)]">ENVIAR</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="animate-enter">
             <div className="text-center mb-12 relative group">
               <div className="absolute inset-0 bg-orange-600 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity rounded-full"></div>
               <div className="w-28 h-28 mx-auto bg-black border-4 border-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,69,0,0.8)] relative z-10 transform group-hover:rotate-12 transition-transform duration-500">
                 <Lock size={48} className="text-orange-500 drop-shadow-[0_0_10px_orange]" />
               </div>
               <h2 className="text-5xl font-gamer text-white uppercase italic drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] text-shadow-glow relative z-10">Acceso Oficial</h2>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-10">
                <div className="group">
                  <label className="block text-sm font-black text-cyan-400 mb-3 font-tech uppercase tracking-[0.2em] drop-shadow-md">Agente</label>
                  <div className="input-wrapper">
                    <Mail className="w-6 h-6"/><input type="email" required className="input-ff w-full p-5 text-xl tracking-wider" placeholder="AGENTE@TECNOBYTE.COM" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-black text-cyan-400 mb-3 font-tech uppercase tracking-[0.2em] drop-shadow-md">Código de Seguridad</label>
                  <div className="input-wrapper">
                    <Key className="w-6 h-6"/><input type="password" required className="input-ff w-full p-5 text-xl tracking-[0.3em]" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="text-right mt-3">
                    <button type="button" onClick={() => setShowRecover(true)} className="text-xs text-yellow-500 hover:text-white uppercase font-black tracking-widest transition-colors hover:underline">
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full btn-ff py-6 text-3xl mt-10 shadow-[0_10px_40px_rgba(255,0,0,0.6)] tracking-widest relative overflow-hidden">
                   <span className="relative z-10 flex items-center justify-center gap-3"><Zap className="animate-pulse"/> AUTENTICAR</span>
                </button>
             </form>
             
             <div className="mt-10 text-center border-t-2 border-gray-800 pt-8 relative">
                <button onClick={() => setView('register')} className="text-gray-400 hover:text-yellow-400 text-sm font-tech uppercase tracking-[0.3em] font-bold transition-all hover:scale-110 drop-shadow-md">
                  &gt;&gt; Solicitar Permisos de Venta
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RegisterForm = ({ setView, showNotification, isMuted }) => {
  const [formData, setFormData] = useState({ 
    firstName: '', lastName: '', email: '', whatsapp: '', 
    idNumber: '', publicUsername: '', adminName: '', rif: '', 
    password: '', confirmPassword: '' 
  });
  const [kycData, setKycData] = useState({ selfie: null, docFront: null }); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false); 
  const [passStrength, setPassStrength] = useState({ length: false, upper: false, lower: false, num: false, special: false }); 
  const [liveness, setLiveness] = useState(false);

  const checkPass = (val) => { 
    setPassStrength({ 
      length: val.length >= 8, 
      upper: /[A-Z]/.test(val), 
      lower: /[a-z]/.test(val), 
      num: /\d/.test(val), 
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val) 
    }); 
  };

  const handleChange = (e) => { 
    setFormData({...formData, [e.target.name]: e.target.value}); 
    if (e.target.name === 'password') checkPass(e.target.value); 
  };
  
  const handleKyc = async (field, file) => { 
    if(file) { 
      const comp = await compressImage(file); 
      setKycData(prev => ({...prev, [field]: comp})); 
      playSound('click', isMuted); 
    } 
  };

  const handleNextStep = () => { 
    playSound('click', isMuted); 
    if (!formData.firstName || !formData.email || !formData.password || !formData.confirmPassword) return showNotification("FALTAN CAMPOS OBLIGATORIOS", "error"); 
    if (formData.password !== formData.confirmPassword) return showNotification("CONTRASEÑAS NO COINCIDEN", "error"); 
    if (!Object.values(passStrength).every(Boolean)) return showNotification("CONTRASEÑA DÉBIL", "error"); 
    setStep(2); 
  };
  
  const handleRegister = async (e) => { 
     e.preventDefault(); 
     if (!kycData.selfie || !kycData.docFront) return showNotification("FALTA BIOMETRÍA", "error"); 
     if(!liveness) return showNotification("CONFIRME PRUEBA DE VIDA", "error"); 
     
     setLoading(true); 
     playSound('click', isMuted); 
     
     try { 
        const userIP = await getIP(); 
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password); 
        const { password, confirmPassword, ...restOfData } = formData;
        
        // GUARDA ABSOLUTAMENTE TODO EN FIREBASE (EXCEPTO PASSWORDS EN TEXTO PLANO)
        await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'data'), { 
          ...restOfData, 
          kycData, 
          ip: userIP, 
          role: 'seller', 
          userAgent: navigator.userAgent,
          createdAt: new Date().toISOString() 
        }); 
        
        showNotification("REGISTRO COMPLETADO", "success"); 
        playSound('success', isMuted); 
        setView('dashboard'); 
     } catch (e) { 
        showNotification(e.message, "error"); 
        playSound('error', isMuted);
     } finally { 
        setLoading(false); 
     } 
  };
  
  return (
    <div className="max-w-5xl mx-auto mt-16 relative animate-enter">
      <div className="absolute -right-64 top-0 hidden xl:block animate-floatExtreme pointer-events-none z-[8]" style={{ animationDirection: 'reverse' }}>
        <img src={proxyImg('https://freelogopng.com/images/all_img/1664285810free-fire-character-png.png')} onError={(e)=>e.target.style.display='none'} alt="decor right" className="h-[600px] opacity-60 drop-shadow-[0_0_50px_rgba(255,69,0,0.8)]" />
      </div>
      
      <div className="hud-panel p-10 md:p-14 shadow-[0_0_100px_rgba(255,69,0,0.3)] border-2 border-orange-500 bg-black/95">
        <h2 className="text-5xl font-gamer text-white mb-12 text-center flex items-center justify-center gap-5 text-shadow-glow">
          <Shield className="text-orange-500 drop-shadow-[0_0_15px_orange]" size={56}/> RECLUTAMIENTO DE ELITE
        </h2>
        
        <form onSubmit={handleRegister}>
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-enter">
              <div className="input-wrapper"><User className="w-6 h-6"/><input name="firstName" placeholder="Nombre *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><User className="w-6 h-6"/><input name="lastName" placeholder="Apellido *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><Mail className="w-6 h-6"/><input name="email" placeholder="Email *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><Smartphone className="w-6 h-6"/><input name="whatsapp" placeholder="Whatsapp *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><CreditCard className="w-6 h-6"/><input name="idNumber" placeholder="DNI / Cédula *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><FileText className="w-6 h-6"/><input name="rif" placeholder="RIF (Opcional)" className="input-ff p-5 border-green-900/50 focus:border-green-500 w-full text-lg" onChange={handleChange} /></div>
              
              <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-black p-8 border-2 border-gray-800 rounded mt-4 shadow-inner">
                 <p className="text-sm text-cyan-400 mb-6 font-black tracking-[0.2em] uppercase border-b border-cyan-900 pb-2">
                   <Lock className="inline mr-2 mb-1"/> SEGURIDAD DE ACCESO MAESTRA
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="input-wrapper"><Key className="w-6 h-6"/><input name="password" type="password" placeholder="Contraseña Maestra *" className="input-ff p-5 w-full text-lg tracking-[0.2em]" onChange={handleChange} /></div>
                    <div className="input-wrapper"><Key className="w-6 h-6"/><input name="confirmPassword" type="password" placeholder="Repetir Contraseña *" className="input-ff p-5 w-full text-lg tracking-[0.2em]" onChange={handleChange} /></div>
                 </div>
                 <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500 uppercase font-bold tracking-widest bg-black/50 p-4 rounded border border-gray-800">
                   <span className={`flex items-center gap-1 ${passStrength.length ? "text-green-500" : ""}`}>{passStrength.length && <CheckCircle size={12}/>} 8+ Caracteres</span>
                   <span className={`flex items-center gap-1 ${passStrength.upper ? "text-green-500" : ""}`}>{passStrength.upper && <CheckCircle size={12}/>} Mayúscula</span>
                   <span className={`flex items-center gap-1 ${passStrength.num ? "text-green-500" : ""}`}>{passStrength.num && <CheckCircle size={12}/>} Número</span>
                   <span className={`flex items-center gap-1 ${passStrength.special ? "text-green-500" : ""}`}>{passStrength.special && <CheckCircle size={12}/>} Símbolo</span>
                 </div>
              </div>
              <button type="button" onClick={handleNextStep} className="btn-ff py-6 md:col-span-2 text-2xl font-black tracking-[0.2em] mt-4 shadow-[0_0_40px_rgba(255,69,0,0.5)] flex justify-center items-center gap-3">
                SIGUIENTE FASE <Zap/>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-enter">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gradient-to-b from-gray-900 to-black p-10 border-2 border-gray-800 text-center relative group hover:border-orange-500 transition-colors rounded-lg shadow-lg">
                    <ScanFace size={64} className="mx-auto mb-6 text-gray-600 group-hover:text-orange-500"/>
                    <p className="text-lg font-black mb-4 uppercase tracking-[0.2em] text-white">FOTOGRAFÍA EN VIVO *</p>
                    <label className="text-sm btn-secondary-ff p-4 cursor-pointer block font-bold tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-400">
                      {kycData.selfie ? "REEMPLAZAR CAPTURA" : "ACTIVAR CÁMARA FRONTAL"} 
                      <input type="file" hidden accept="image/*" capture="user" onChange={e => handleKyc('selfie', e.target.files[0])}/>
                    </label>
                 </div>
                 <div className="bg-gradient-to-b from-gray-900 to-black p-10 border-2 border-gray-800 text-center relative group hover:border-cyan-500 transition-colors rounded-lg shadow-lg">
                    <FileText size={64} className="mx-auto mb-6 text-gray-600 group-hover:text-cyan-500"/>
                    <p className="text-lg font-black mb-4 uppercase tracking-[0.2em] text-white">DOCUMENTO DNI/ID *</p>
                    <label className="text-sm btn-secondary-ff p-4 cursor-pointer block font-bold tracking-widest hover:bg-cyan-600 hover:text-white hover:border-cyan-400">
                      {kycData.docFront ? "REEMPLAZAR ESCANEO" : "ESCANEAR DOCUMENTO"} 
                      <input type="file" hidden accept="image/*" onChange={e => handleKyc('docFront', e.target.files[0])}/>
                    </label>
                 </div>
              </div>
              
              <div className="bg-black/50 p-8 border border-gray-800 rounded space-y-6">
                <div className="input-wrapper"><UserCheck className="w-6 h-6"/><input name="publicUsername" placeholder="Alias Público (Ej: GhostKiller) *" className="input-ff p-5 w-full text-xl" onChange={handleChange} /></div>
                <div className="input-wrapper"><Shield className="w-6 h-6"/><input name="adminName" placeholder="Nombre Real / Empresa *" className="input-ff p-5 w-full text-xl" onChange={handleChange} /></div>
              </div>
              
              <label className="flex items-center gap-4 text-base text-gray-300 bg-orange-900/20 p-6 border-2 border-orange-500/50 rounded-lg cursor-pointer hover:bg-orange-900/40 hover:border-orange-400 transition-all shadow-[0_0_20px_rgba(255,69,0,0.1)] group">
                <input type="checkbox" onChange={e => setLiveness(e.target.checked)} className="w-6 h-6 accent-orange-600 cursor-pointer"/> 
                <span className="font-bold tracking-wide uppercase group-hover:text-white">Confirmo que soy persona real (Prueba de Vida).</span>
              </label>
              
              <div className="flex gap-6 mt-8">
                <button type="button" onClick={() => setStep(1)} className="flex-[1] btn-secondary-ff py-5 font-bold text-xl tracking-widest">&lt;&lt; ATRÁS</button>
                <button disabled={loading} className="flex-[2] btn-ff py-5 text-2xl shadow-[0_0_50px_rgba(255,69,0,0.8)] animate-pulse font-black tracking-[0.2em]">
                  {loading ? "ENCRIPTANDO DATOS..." : "FINALIZAR REGISTRO"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 14. VISTAS LEGALES Y FOOTER
// ============================================================================
const TermsView = ({ setView }) => (
  <div className="max-w-4xl mx-auto mt-12 animate-enter hud-panel p-10 shadow-[0_0_80px_rgba(255,69,0,0.5)] bg-black/90">
    <button onClick={() => setView('home')} className="text-gray-400 hover:text-white font-bold mb-6 flex items-center gap-2">&lt;&lt; VOLVER AL INICIO</button>
    <h2 className="text-4xl font-gamer text-white uppercase text-shadow-glow border-b-2 border-orange-600 pb-4 mb-8">TÉRMINOS Y CONDICIONES DE SERVICIO</h2>
    <div className="space-y-6 text-gray-300 font-mono text-sm leading-relaxed">
      <p>Bienvenido a Nexus Station. Al utilizar nuestra plataforma, aceptas los siguientes términos establecidos por <strong>TecnoByte LLC</strong>.</p>
      <h3 className="text-orange-500 font-bold text-lg mt-4">1. Naturaleza del Servicio</h3>
      <p>Nexus Station funciona estrictamente como una plataforma intermediaria (Escrow P2P). Proveemos el canal de comunicación seguro y la infraestructura tecnológica para conectar compradores y vendedores.</p>
      <h3 className="text-orange-500 font-bold text-lg mt-4">2. Verificación de Identidad (KYC)</h3>
      <p>Todo vendedor debe proveer información real y comprobable (Identificación Oficial y Prueba de Vida Biográfica). Falsificar esta información resultará en el bloqueo permanente de la cuenta y reporte a las autoridades competentes.</p>
      <h3 className="text-orange-500 font-bold text-lg mt-4">3. Política de Transacciones y Reembolsos</h3>
      <p>Los fondos deben ser confirmados antes de liberar cualquier credencial. Una vez que el comprador hace clic en "CUENTA VERIFICADA", la transacción se considera <strong>FINALIZADA e IRREVERSIBLE</strong>. No se emitirán reembolsos posteriores a esta acción bajo ninguna circunstancia.</p>
      <h3 className="text-orange-500 font-bold text-lg mt-4">4. Sistema de Disputas</h3>
      <p>En caso de anomalías, tanto el vendedor como el comprador pueden activar el botón "Llamar Soporte". Un agente oficial de TecnoByte LLC intervendrá, revisará el historial del chat encriptado y tomará una decisión final vinculante.</p>
    </div>
  </div>
);

const LegalView = ({ setView }) => (
  <div className="max-w-4xl mx-auto mt-12 animate-enter hud-panel p-10 shadow-[0_0_80px_rgba(255,69,0,0.5)] bg-black/90">
    <button onClick={() => setView('home')} className="text-gray-400 hover:text-white font-bold mb-6 flex items-center gap-2">&lt;&lt; VOLVER AL INICIO</button>
    <h2 className="text-4xl font-gamer text-white uppercase text-shadow-glow border-b-2 border-orange-600 pb-4 mb-8">AVISO LEGAL Y DESCARGO DE RESPONSABILIDAD</h2>
    <div className="space-y-6 text-gray-300 font-mono text-sm leading-relaxed">
      <h3 className="text-orange-500 font-bold text-lg">1. Propiedad Intelectual</h3>
      <p><strong>TecnoByte LLC</strong> y el portal Nexus Station NO están afiliados, asociados, autorizados, respaldados ni conectados oficialmente de ninguna manera con Garena, Garena Free Fire, ni ninguna de sus subsidiarias o afiliados. Los nombres, marcas comerciales, emblemas e imágenes registrados pertenecen exclusivamente a sus respectivos propietarios.</p>
      <h3 className="text-orange-500 font-bold text-lg mt-4">2. Responsabilidad de la Empresa</h3>
      <p>TecnoByte LLC proporciona la plataforma y el sistema de custodia. No somos propietarios de los artículos digitales listados en el mercado. La responsabilidad de la veracidad y legalidad de los artículos recae enteramente sobre los usuarios vendedores verificados.</p>
      <h3 className="text-orange-500 font-bold text-lg mt-4">3. Jurisdicción</h3>
      <p>El uso de este sitio web y cualquier disputa que surja de su uso está sujeto a las leyes del comercio electrónico vigentes. TecnoByte LLC se reserva el derecho de entregar información de usuarios (KYC, IPs) requerida mediante órdenes judiciales en casos de fraude comprobado.</p>
    </div>
  </div>
);

// --- FOOTER PROFESIONAL ---
const Footer = ({ setView }) => (
  <footer className="bg-gradient-to-b from-black to-gray-950 pt-20 pb-12 border-t-4 border-red-900 mt-32 relative z-20 shadow-[0_-20px_50px_rgba(255,0,0,0.2)] font-sans">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-60"></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_20px_orange]"></div>
    
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <div className="flex flex-col items-center mb-12">
        <img src={nexusLogo} alt="NEXUS STATION" className="h-28 object-contain logo-hyper-anim drop-shadow-[0_0_30px_rgba(255,69,0,0.5)] mb-6" />
        <p className="text-gray-400 max-w-lg text-center font-tech text-sm tracking-widest leading-relaxed">
          El marketplace de élite para transacciones P2P seguras. Únete al campo de batalla con el respaldo de TecnoByte LLC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-gray-800 pt-12 text-center md:text-left">
        
        <div className="space-y-4">
          <h4 className="text-cyan-400 font-tech font-black text-xl uppercase tracking-widest mb-6">Atención al Cliente</h4>
          <a href="mailto:support@tecnobytellc.zendesk.com" className="flex items-center justify-center md:justify-start gap-3 text-gray-300 hover:text-cyan-400 transition-colors bg-gray-900/50 p-3 rounded-lg border border-gray-800 hover:border-cyan-500 group">
             <Mail size={20} className="group-hover:animate-pulse"/> support@tecnobytellc.zendesk.com
          </a>
          <a href="https://wa.me/19047400467" target="_blank" rel="noreferrer" className="flex items-center justify-center md:justify-start gap-3 text-gray-300 hover:text-green-500 transition-colors bg-gray-900/50 p-3 rounded-lg border border-gray-800 hover:border-green-500 group">
             <MessageCircle size={20} className="group-hover:animate-pulse"/> WhatsApp Soporte Oficial
          </a>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          <h4 className="text-yellow-400 font-tech font-black text-xl uppercase tracking-widest mb-6">Redes Sociales</h4>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=61584195867648" target="_blank" rel="noreferrer" className="bg-gray-900 border border-gray-700 p-4 rounded-full text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:scale-110">
              <Facebook size={24}/>
            </a>
            <a href="https://www.instagram.com/tecnobytellc/" target="_blank" rel="noreferrer" className="bg-gray-900 border border-gray-700 p-4 rounded-full text-gray-400 hover:text-pink-500 hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all hover:scale-110">
              <Instagram size={24}/>
            </a>
            <a href="https://www.tiktok.com/@tecnobyte.llc" target="_blank" rel="noreferrer" className="bg-gray-900 border border-gray-700 p-4 rounded-full text-gray-400 hover:text-white hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all hover:scale-110">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-orange-500 font-tech font-black text-xl uppercase tracking-widest mb-6">Legal & Políticas</h4>
          <div className="flex flex-col gap-3">
             <button onClick={() => { setView('terms'); window.scrollTo(0,0); }} className="text-left text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2"><FileText size={16} className="text-orange-500"/> Términos y Condiciones</button>
             <button onClick={() => { setView('legal'); window.scrollTo(0,0); }} className="text-left text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2"><Shield size={16} className="text-orange-500"/> Aviso Legal y Privacidad</button>
          </div>
        </div>

      </div>

      <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-500 font-tech text-sm tracking-[0.2em] font-bold uppercase drop-shadow-md">© {new Date().getFullYear()} NEXUS STATION</p>
        <p className="text-orange-600 font-tech text-xs tracking-[0.2em] font-bold uppercase drop-shadow-md">DESARROLLADO POR TECNOBYTE LLC. TODOS LOS DERECHOS RESERVADOS.</p>
      </div>
    </div>
  </footer>
);

// ============================================================================
// COMPONENTES RESTAURADOS (NUEVOS): NAVBAR, MARKETPLACE, CARDS Y MODAL
// ============================================================================
const Navbar = ({ user, userData, setView, onLogout, isMuted, setIsMuted, unreadAlerts }) => (
  <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b-2 border-orange-600/50 shadow-[0_5px_20px_rgba(255,69,0,0.3)]">
    <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('home')}>
        {/* AQUÍ SE RESTAURÓ EL EFECTO GLITCH, LUZ Y FLOTANTE (logo-hyper-anim) */}
        <img src={nexusLogo} alt="Logo" className="h-12 md:h-16 object-contain logo-hyper-anim drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]" />
        <span className="text-2xl font-gamer text-white hidden md:block text-shadow-glow">NEXUS STATION</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setIsMuted(!isMuted)} className="text-gray-400 hover:text-white">
          {isMuted ? <VolumeX /> : <Volume2 />}
        </button>
        <button onClick={() => setView('track-order')} className="text-cyan-400 hover:text-white font-tech uppercase font-bold text-sm hidden md:block flex items-center gap-2">
          <Radar className="inline" size={16}/> Radar
        </button>
        {user ? (
          <>
            <button onClick={() => setView('wishlist')} className="text-pink-500 hover:text-pink-400"><Heart /></button>
            <button onClick={() => setView('buyer-inventory')} className="text-blue-500 hover:text-blue-400"><Package /></button>
            {(userData?.role === 'admin' || userData?.role === 'support') && (
              <button onClick={() => setView('support')} className="text-purple-500 hover:text-purple-400 relative">
                <Headphones />
              </button>
            )}
            <button onClick={() => setView('dashboard')} className="btn-secondary-ff px-4 py-2 text-sm flex gap-2 items-center relative">
              <User size={16}/> BASE
              {unreadAlerts > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] animate-pulse">{unreadAlerts}</span>}
            </button>
            <button onClick={onLogout} className="text-red-500 hover:text-red-400"><LogOut /></button>
          </>
        ) : (
          <button onClick={() => setView('login')} className="btn-ff px-6 py-2 text-sm">INGRESAR</button>
        )}
      </div>
    </div>
  </nav>
);

const ProductCard = ({ item, index, onBuy, onViewSeller }) => {
  const isDiscounted = item.discountActive;
  return (
    <div className={`hud-panel flex flex-col group h-full border-b-4 border-orange-500 animate-enter-delay-${(index % 3) + 1}`}>
      <div className="relative h-60 bg-black overflow-hidden clip-path-bottom-slant cursor-pointer" onClick={onViewSeller}>
        <img src={item.images?.[0]} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt={item.title}/>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/90 px-3 py-1 rounded border-l-2 border-yellow-500 z-20">
          <User size={14} className="text-yellow-500"/>
          <span className="text-[10px] font-tech text-white uppercase">{item.adminName || item.sellerUsername}</span>
        </div>
        {item.isManuallyVerified && (
           <div className="absolute top-4 left-4 bg-gradient-to-r from-red-900 to-yellow-900 border border-yellow-500 px-2 py-1 rounded shadow-[0_0_10px_gold] z-20 flex items-center gap-1">
             <ShieldCheck size={12} className="text-yellow-400"/> <span className="text-[10px] text-yellow-500 font-black">ÉLITE</span>
           </div>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col relative bg-gradient-to-b from-transparent to-black/90">
        <h3 className="font-tech font-black text-white text-xl leading-tight mb-4 uppercase drop-shadow-md">{item.title}</h3>
        <div className="mt-auto border-t border-gray-800 pt-4 flex justify-between items-end">
          <span className="text-4xl font-gamer text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            {formatCurrency(isDiscounted ? item.discountPrice : item.price)}
          </span>
          <button onClick={(e)=>{e.stopPropagation(); onBuy();}} className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black p-3 hover:scale-110 transition-transform clip-path-polygon border border-yellow-200 shadow-[0_0_15px_rgba(255,215,0,0.5)]">
            <ShoppingBag size={20} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Marketplace = ({ listings, setPurchaseItem, setView, user, setViewSellerId, isMuted, showNotification, filterType, setFilterType }) => {
  // LÓGICA DE BÚSQUEDA RESTAURADA
  const [searchTerm, setSearchTerm] = useState('');
  
  const activeListings = listings.filter(l => l.isActive !== false);
  
  // FILTRADO DE PUBLICACIONES Y VENDEDORES
  const filteredListings = activeListings.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.adminName && item.adminName.toLowerCase().includes(term)) ||
      (item.sellerUsername && item.sellerUsername.toLowerCase().includes(term))
    );
  });
  
  return (
    <div className="max-w-7xl mx-auto animate-enter">
      <div className="mb-12 flex flex-col md:flex-row items-center justify-between bg-black/40 p-8 md:p-12 rounded-xl border-b-4 border-orange-600 shadow-[0_0_50px_rgba(255,69,0,0.2)] gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent pointer-events-none"></div>
        
        <div className="text-center md:text-left relative z-10 w-full md:w-auto">
          {/* CARTEL DE TEMPORADA DE FUEGO RESTAURADO */}
          <div className="inline-block bg-orange-600 text-white font-black font-tech px-4 py-1 text-sm md:text-base uppercase tracking-widest mb-4 border border-orange-400 shadow-[0_0_15px_rgba(255,69,0,0.8)] animate-pulse">
            🔥 TEMPORADA DE FUEGO
          </div>
          {/* TÍTULO GIGANTE RESTAURADO */}
          <h1 className="text-7xl md:text-9xl font-gamer text-white uppercase italic text-shadow-glow drop-shadow-[0_0_30px_rgba(255,69,0,0.8)] mb-4">Mercado Negro</h1>
          <p className="font-tech text-cyan-400 tracking-[0.4em] text-xl md:text-3xl uppercase font-bold">Adquiere suministros de élite asegurados por Escrow.</p>
        </div>

        {/* BARRA DE BÚSQUEDA FÍSICA Y VISUAL RESTAURADA */}
        <div className="w-full md:w-96 relative z-10">
          <div className="input-wrapper relative group">
            <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 group-focus-within:text-orange-500 transition-colors"/>
            <input 
              type="text" 
              placeholder="Buscar armas, cuentas, vendedores..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/80 border-2 border-orange-500/50 focus:border-orange-500 text-white font-tech text-lg py-4 pl-14 pr-4 rounded-lg shadow-[inset_0_0_20px_rgba(255,69,0,0.2)] focus:shadow-[0_0_25px_rgba(255,69,0,0.5)] outline-none transition-all placeholder-gray-500"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-black/50 border-2 border-dashed border-gray-700 rounded-xl">
            <ScanFace size={80} className="mx-auto text-gray-600 mb-6 opacity-50 animate-pulse"/>
            <p className="text-3xl text-gray-500 font-tech uppercase tracking-widest">Radar despejado. No hay suministros que coincidan.</p>
          </div>
        ) : (
          filteredListings.map((item, index) => (
            <ProductCard key={item.id} item={item} index={index} onBuy={() => setPurchaseItem(item)} onViewSeller={() => setViewSellerId(item.sellerId)} />
          ))
        )}
      </div>
    </div>
  );
};

const PurchaseModal = ({ item, onClose, showNotification, isMuted }) => {
  const [step, setStep] = useState(1);
  const [buyerData, setBuyerData] = useState({ firstName: '', lastName: '', idNumber: '', whatsapp: '', email: '', state: '', country: 'Venezuela' });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);

  useEffect(() => {
    const fetchMethods = async () => {
      const snap = await getDocs(collection(db, 'artifacts', appId, 'users', item.sellerId, 'paymentMethods'));
      setPaymentMethods(snap.docs.map(d => ({id: d.id, ...d.data()})));
      const rate = await getExchangeRate();
      setExchangeRate(rate);
    };
    fetchMethods();
  }, [item.sellerId]);

  const handleProceed = () => {
    playSound('click', isMuted);
    if(!buyerData.firstName || !buyerData.email || !buyerData.whatsapp || !buyerData.idNumber) return showNotification("Complete todos los campos del comprador", "error");
    setStep(2);
  };

  const handleCheckout = async () => {
    playSound('click', isMuted);
    if(!selectedMethod) return showNotification("Seleccione un método de pago", "error");
    setLoading(true);
    try {
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const totalUSD = item.discountActive ? item.discountPrice : item.price;
      const totalVES = totalUSD * exchangeRate;
      
      const sellerSnap = await getDoc(doc(db, 'artifacts', appId, 'users', item.sellerId, 'profile', 'data'));
      const sellerData = sellerSnap.exists() ? sellerSnap.data() : { adminName: item.adminName, publicUsername: item.sellerUsername };

      const orderPayload = {
        orderId,
        item: { id: item.id, title: item.title, price: totalUSD },
        buyer: buyerData,
        seller: { id: item.sellerId, adminName: sellerData.adminName, username: sellerData.publicUsername, whatsapp: sellerData.whatsapp || '' },
        payment: { 
          method: selectedMethod.name, 
          currency: selectedMethod.currency, 
          totalUSD: totalUSD, 
          totalVES: selectedMethod.currency === 'VES' ? totalVES : 0, 
          rateUsed: exchangeRate 
        },
        status: 'created',
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        supportRequested: false
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderPayload);
      showNotification("ORDEN CREADA EXITOSAMENTE", "success");
      playSound('success', isMuted);
      onClose();
    } catch(e) {
      showNotification("Error al procesar la orden", "error");
      playSound('error', isMuted);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="hud-panel p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_80px_rgba(255,69,0,0.5)] border-2 border-orange-500">
         <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-50"><X size={32}/></button>
         <h2 className="text-4xl font-gamer text-white uppercase text-shadow-glow mb-8 border-b-2 border-orange-600 pb-4 flex items-center gap-3"><ShoppingBag className="text-orange-500"/> PROTOCOLO DE COMPRA</h2>
         
         {step === 1 ? (
           <div className="space-y-6 animate-enter">
             <h3 className="text-cyan-400 font-tech font-bold uppercase tracking-widest">1. Identificación del Comprador</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/50 p-6 border border-gray-800 rounded">
                <input className="input-ff p-4" placeholder="Nombres *" value={buyerData.firstName} onChange={e=>setBuyerData({...buyerData, firstName: e.target.value})} />
                <input className="input-ff p-4" placeholder="Apellidos" value={buyerData.lastName} onChange={e=>setBuyerData({...buyerData, lastName: e.target.value})} />
                <input className="input-ff p-4" placeholder="Cédula / ID *" value={buyerData.idNumber} onChange={e=>setBuyerData({...buyerData, idNumber: e.target.value})} />
                <input className="input-ff p-4" placeholder="WhatsApp *" value={buyerData.whatsapp} onChange={e=>setBuyerData({...buyerData, whatsapp: e.target.value})} />
                <input className="input-ff p-4" placeholder="Correo Electrónico *" type="email" value={buyerData.email} onChange={e=>setBuyerData({...buyerData, email: e.target.value})} />
                <input className="input-ff p-4" placeholder="Estado / Provincia" value={buyerData.state} onChange={e=>setBuyerData({...buyerData, state: e.target.value})} />
             </div>
             <button onClick={handleProceed} className="btn-ff w-full py-4 text-xl tracking-widest mt-4">CONTINUAR AL PAGO</button>
           </div>
         ) : (
           <div className="space-y-6 animate-enter">
             <h3 className="text-cyan-400 font-tech font-bold uppercase tracking-widest">2. Recepción de Fondos</h3>
             <div className="bg-gray-900/80 p-6 rounded border-l-4 border-yellow-500">
               <p className="text-gray-400 uppercase font-bold text-sm">Total a Pagar:</p>
               <p className="text-4xl font-gamer text-yellow-500">${item.discountActive ? item.discountPrice : item.price}</p>
               {exchangeRate > 0 && <p className="text-sm text-green-400 mt-2 font-mono">Tasa VES: {exchangeRate} | Total Aprox: {formatCurrency((item.discountActive ? item.discountPrice : item.price) * exchangeRate, 'VES')}</p>}
             </div>
             
             <h4 className="text-white font-tech uppercase tracking-widest mt-6 mb-2">Métodos Disponibles del Comandante:</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {paymentMethods.length === 0 && <p className="text-red-500 font-bold">El vendedor no tiene métodos de pago configurados.</p>}
               {paymentMethods.map(m => (
                 <div key={m.id} onClick={()=>{playSound('click', isMuted); setSelectedMethod(m);}} className={`p-4 border-2 rounded cursor-pointer transition-all ${selectedMethod?.id === m.id ? 'border-orange-500 bg-orange-900/30 shadow-[0_0_15px_rgba(255,69,0,0.4)]' : 'border-gray-700 bg-black/60 hover:border-gray-500'}`}>
                   <p className="font-black text-white uppercase">{m.name} <span className="text-xs text-cyan-400 ml-2 bg-cyan-900/30 px-2 py-1 rounded">{m.currency}</span></p>
                   <p className="text-xs text-gray-400 mt-2 font-mono whitespace-pre-wrap">{m.details}</p>
                 </div>
               ))}
             </div>
             
             <div className="flex gap-4 mt-8">
               <button onClick={()=>{playSound('click', isMuted); setStep(1);}} className="flex-1 btn-secondary-ff py-4 font-bold text-lg">&lt;&lt; VOLVER</button>
               <button onClick={handleCheckout} disabled={loading} className="flex-1 btn-ff py-4 text-xl tracking-widest shadow-[0_0_30px_rgba(255,69,0,0.5)]">{loading ? 'PROCESANDO...' : 'CREAR ORDEN'}</button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

// ============================================================================
// 15. MAIN APP COMPONENT (ROOT)
// ============================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); 
  const [listings, setListings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [viewSellerId, setViewSellerId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [filterType, setFilterType] = useState('recent');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data'));
        if (snap.exists()) setUserData(snap.data());
      } else { 
        setUserData(null); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setListings(items);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
     if(!user) return;
     let initialLoad = true;
     const unsub = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', user.uid)), (snap) => {
        if(initialLoad) { 
          initialLoad = false; 
          return; 
        }
        snap.docChanges().forEach((change) => {
           const d = change.doc.data();
           if (change.type === "added") { 
             playSound('notif', isMuted); 
             setUnreadAlerts(u=>u+1); 
             showNotification(`NUEVA VENTA RECIBIDA: #${d.orderId}`, "success"); 
           }
           if (change.type === "modified" && d.status === 'payment_reported') { 
             playSound('notif', isMuted); 
             setUnreadAlerts(u=>u+1); 
             showNotification(`PAGO REPORTADO EN #${d.orderId}`, "success"); 
           }
        });
     });
     return () => unsub();
  }, [user, isMuted]);

  const showNotification = (msg, type = 'success') => { 
    setNotification({ msg, type }); 
    setTimeout(() => setNotification(null), 5000); 
  };
  
  const handleLogout = async () => { 
    playSound('click', isMuted); 
    await signOut(auth); 
    setUserData(null); 
    setView('home'); 
    showNotification("Sesión finalizada"); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-gamer text-3xl relative overflow-hidden">
        <Styles />
        <div className="fixed inset-0 bg-black z-[-20]"></div>
        <VideoBackground />
        <FireEffect />
        <div className="z-10 flex flex-col items-center p-10 hud-panel animate-pulse">
          <Crosshair size={120} className="text-orange-600 animate-spin-slow mb-6 drop-shadow-[0_0_20px_#FF4500]" />
          <span className="tracking-[0.2em] text-shadow-glow glitch" data-text="INICIANDO SISTEMA TECNOBYTE...">
            INICIANDO SISTEMA TECNOBYTE...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100 bg-transparent selection:bg-orange-600 selection:text-white">
      <Styles /> 
      <ClickSparks />
      <div className="fixed inset-0 bg-black z-[-20]"></div>
      <VideoBackground />
      <LightningStorm />
      <FireEffect />
      <MeteorShower />
      <AshRain />
      <CharacterDecor />
      <div className="fixed inset-0 pointer-events-none z-[7] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

      <Navbar user={user} userData={userData} setView={setView} onLogout={handleLogout} isMuted={isMuted} setIsMuted={setIsMuted} unreadAlerts={unreadAlerts}/>

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 animate-enter">
        {notification && (
          <div className={`fixed top-28 left-1/2 transform -translate-x-1/2 z-[100] px-10 py-6 hud-panel border-l-8 flex items-center gap-5 font-tech uppercase font-black tracking-widest text-xl animate-enter ${notification.type === 'error' ? 'border-red-600 text-red-500 shadow-[0_0_60px_rgba(255,0,0,0.9)] bg-red-950/90' : 'border-green-500 text-green-400 shadow-[0_0_60px_rgba(0,255,0,0.9)] bg-green-950/90'}`}>
            {notification.type === 'error' ? <AlertTriangle size={40} className="animate-pulse"/> : <CheckCircle size={40} className="animate-pulse"/>}
            {notification.msg}
          </div>
        )}

        {view === 'home' && <Marketplace listings={listings} setPurchaseItem={setPurchaseItem} setView={setView} user={user} setViewSellerId={setViewSellerId} isMuted={isMuted} showNotification={showNotification} filterType={filterType} setFilterType={setFilterType} />}
        {view === 'login' && <LoginForm setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'register' && <RegisterForm setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'dashboard' && <Dashboard user={user} userData={userData} listings={listings} setView={setView} showNotification={showNotification} setViewSellerId={setViewSellerId} isMuted={isMuted}/>}
        {view === 'edit-profile' && <EditProfileForm user={user} userData={userData} setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'support' && <SupportDashboard user={user} userData={userData} setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'track-order' && <OrderTrackerView setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'buyer-inventory' && <BuyerInventoryView user={user} setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'wishlist' && <WishlistView user={user} listings={listings} setPurchaseItem={setPurchaseItem} setView={setView} showNotification={showNotification} isMuted={isMuted}/>}
        {view === 'terms' && <TermsView setView={setView} />}
        {view === 'legal' && <LegalView setView={setView} />}
        {view === 'create' && <ListingForm user={user} userData={userData} setView={setView} showNotification={showNotification} mode="create" isMuted={isMuted}/>}
        {view.startsWith('edit-') && view !== 'edit-profile' && <ListingForm user={user} userData={userData} setView={setView} showNotification={showNotification} mode="edit" editId={view.split('-')[1]} listings={listings} isMuted={isMuted}/>}
      </main>

      {purchaseItem && <PurchaseModal item={purchaseItem} onClose={()=>{playSound('click', isMuted); setPurchaseItem(null)}} showNotification={showNotification} isMuted={isMuted}/>}
      {viewSellerId && <SellerProfileView sellerId={viewSellerId} onClose={()=>{playSound('click', isMuted); setViewSellerId(null)}} onBuy={(item) => setPurchaseItem(item)} user={user} userData={userData} showNotification={showNotification} isMuted={isMuted}/>}

      <Footer setView={setView} />
    </div>
  );
}
