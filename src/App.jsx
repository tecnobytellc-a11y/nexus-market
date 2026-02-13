import React, { useState, useEffect, useRef } from 'react';
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
  Lock, Zap, Crosshair, Trophy, Diamond, X, Flame, Skull,
  ScanFace, Upload, KeyRound, Eye, EyeOff, Globe, MapPin,
  CreditCard, Banknote, Receipt, Download, RefreshCw, MessageSquare, Send,
  ImageIcon, CheckSquare, Star, Search, ThumbsUp, ThumbsDown, Minus,
  Mail, Phone, Smartphone, UserCheck, Key, Shield
} from 'lucide-react';

import nexusLogo from './nexus-station-logo.png';

// --- 1. CONFIGURACIÓN FIREBASE REAL (INTACTA) ---
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "tecnobyte-marketplace-v1"; 

// --- 2. UTILIDADES Y MOTORES (INTACTOS) ---

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
    console.error("Fallo en satélite financiero:", error);
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
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getIP = async () => {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (error) {
    return "IP_OCULTA_O_ERROR";
  }
};

// --- 3. ESTILOS CSS MASTER (VISUAL ARMAGEDDON V2.0 - MEJORADO) ---
const Styles = () => (
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

    body { background-color: var(--ff-dark); color: white; font-family: 'Rajdhani', sans-serif; overflow-x: hidden; scroll-behavior: smooth; }

    /* --- ANIMACIONES AVANZADAS --- */
    @keyframes slideInUp { from { transform: translateY(80px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulseGlowExtreme { 
      0%, 100% { box-shadow: 0 0 20px rgba(255, 69, 0, 0.2); border-color: rgba(255, 255, 255, 0.1); }
      50% { box-shadow: 0 0 50px rgba(255, 69, 0, 0.9), inset 0 0 20px rgba(255, 0, 0, 0.5); border-color: rgba(255, 215, 0, 0.8); }
    }
    @keyframes floatChar { 0%, 100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 20px rgba(255,69,0,0.5)); } 50% { transform: translateY(-25px) scale(1.05); filter: drop-shadow(0 0 40px rgba(255,0,0,0.8)); } }
    @keyframes floatExtreme { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-15px) rotate(2deg); } 75% { transform: translateY(15px) rotate(-2deg); } }
    @keyframes lightningFlash { 0%, 95%, 98%, 100% { opacity: 0; } 96%, 99% { opacity: 0.8; } }
    @keyframes spinSlowReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }

    .animate-enter { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    .animate-enter-delay-1 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; opacity: 0; }
    .animate-enter-delay-2 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards; opacity: 0; }
    .animate-enter-delay-3 { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards; opacity: 0; }
    .animate-floatExtreme { animation: floatExtreme 6s ease-in-out infinite; }
    
    .font-gamer { font-family: 'Black Ops One', cursive; }
    .font-tech { font-family: 'Orbitron', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #FF4500, #8B0000); border-radius: 4px; border: 1px solid #FFD700; }

    /* --- LOGO ULTRA ANIMADO --- */
    @keyframes logo-glitch-skew {
      0% { transform: skew(0deg); }
      20% { transform: skew(-3deg); }
      40% { transform: skew(3deg); }
      60% { transform: skew(-2deg); }
      80% { transform: skew(2deg); }
      100% { transform: skew(0deg); }
    }
    @keyframes logo-flash {
      0%, 100% { opacity: 1; filter: brightness(1) drop-shadow(0 0 10px #FF4500); }
      50% { opacity: 0.9; filter: brightness(1.8) drop-shadow(0 0 30px #FFD700); }
    }
    .logo-hyper-anim {
      animation: logo-glitch-skew 4s infinite linear alternate-reverse, logo-flash 3s infinite steps(10), floatChar 5s infinite ease-in-out;
      filter: drop-shadow(0 0 15px rgba(255, 69, 0, 0.8));
    }

    /* --- METEORITOS MEJORADOS --- */
    @keyframes meteor-fall {
      0% { transform: translateX(50vw) translateY(-50vh) scale(1); opacity: 1; }
      100% { transform: translateX(-50vw) translateY(100vh) scale(0.2); opacity: 0; }
    }
    .meteor {
      position: absolute;
      width: 150px; height: 3px;
      background: linear-gradient(to left, #fff, #ff4500, transparent);
      transform: rotate(-45deg);
      box-shadow: 0 0 30px 5px #ff0000;
      opacity: 0;
      border-radius: 50%;
    }

    /* --- FUEGO & CENIZAS EXTREMAS --- */
    .ember {
      position: absolute; width: 5px; height: 5px; background: #FFD700;
      box-shadow: 0 0 15px 2px #FF4500, 0 0 30px 5px #FF0000; border-radius: 50%;
      mix-blend-mode: screen;
    }
    @keyframes emberRise { 
      0% { transform: translateY(120vh) translateX(0) scale(0.8) rotate(0deg); opacity: 0; } 
      10% { opacity: 1; }
      100% { transform: translateY(-20vh) translateX(200px) scale(0.1) rotate(360deg); opacity: 0; } 
    }

    /* HUD PANELS */
    .hud-panel {
      background: var(--ff-panel);
      border: 1px solid rgba(255, 69, 0, 0.6);
      position: relative;
      clip-path: polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px);
      backdrop-filter: blur(20px);
      box-shadow: 0 0 40px rgba(0,0,0,0.9), inset 0 0 20px rgba(255,69,0,0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .hud-panel::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%);
      background-size: 200% 200%; animation: glass-shine 4s infinite linear; pointer-events: none; z-index: 1;
    }
    @keyframes glass-shine { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .hud-panel:hover { 
      border-color: var(--ff-yellow); box-shadow: 0 0 60px rgba(255, 69, 0, 0.6), inset 0 0 30px rgba(255,215,0,0.2); 
      transform: scale(1.02) translateY(-5px); z-index: 20;
    }

    /* INPUTS HUD */
    .input-wrapper { position: relative; transition: all 0.3s; margin-bottom: 0.5rem; }
    .input-wrapper svg { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #888; transition: all 0.4s; z-index: 10; }
    .input-wrapper:focus-within svg { color: var(--ff-yellow); filter: drop-shadow(0 0 8px var(--ff-yellow)); transform: translateY(-50%) scale(1.2); }
    
    .input-ff {
      background: rgba(0, 0, 0, 0.85); border: 2px solid #444; border-radius: 8px;
      color: white; font-family: 'Rajdhani', sans-serif; font-weight: 800; letter-spacing: 1px;
      padding-left: 3.5rem !important; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
    }
    .input-ff:focus { 
       border-color: var(--ff-yellow); outline: none; background: rgba(255, 69, 0, 0.15); 
       box-shadow: 0 0 25px rgba(255, 69, 0, 0.4), inset 0 0 15px rgba(255,215,0,0.2); 
       transform: scale(1.02);
    }

    /* BOTONES EPICOS */
    .btn-ff {
      background: linear-gradient(135deg, #FFD700 0%, #FF4500 50%, #8B0000 100%);
      color: white; font-family: 'Black Ops One', cursive; text-transform: uppercase;
      border: 2px solid #FFD700; clip-path: polygon(15% 0, 100% 0, 100% 65%, 85% 100%, 0 100%, 0 35%);
      transition: all 0.3s; position: relative; overflow: hidden; cursor: pointer; text-shadow: 2px 2px 0 rgba(0,0,0,0.8);
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
    
    /* TEXT GLITCH */
    .glitch { position: relative; display: inline-block; font-weight: 900; }
    .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: transparent; }
    .glitch::before { left: 3px; text-shadow: -2px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 2s infinite linear alternate-reverse; }
    .glitch::after { left: -3px; text-shadow: -2px 0 #00fff9; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim2 3s infinite linear alternate-reverse; }
    
    /* FIRE FLAMES */
    .fire-base { position: fixed; bottom: 0; left: 0; right: 0; height: 35vh; background: linear-gradient(to top, rgba(255,69,0,0.8), rgba(255,0,0,0.2), transparent); filter: blur(8px); z-index: -5; pointer-events: none; }
    .fire-flame { position: absolute; bottom: -100px; width: 100%; height: 120%; background: url('https://raw.githubusercontent.com/s1mpson/css-fire/master/img/fire.png') repeat-x; background-size: auto 100%; mix-blend-mode: color-dodge; opacity: 0.9; animation: fireFlicker 2s infinite alternate ease-in-out; }
    @keyframes fireFlicker { 0% { transform: scaleY(1) translateY(0); opacity: 0.9; } 50% { transform: scaleY(1.1) skewX(-3deg) translateY(-10px); opacity: 1; } 100% { transform: scaleY(0.9) skewX(3deg) translateY(5px); opacity: 0.8; } }

    /* CHAT BUBBLES */
    .chat-bubble-me { background: linear-gradient(135deg, rgba(255,69,0,0.3), rgba(139,0,0,0.5)); border: 1px solid var(--ff-yellow); border-radius: 15px 15px 0 15px; margin-left: auto; box-shadow: 0 5px 15px rgba(255,69,0,0.2); }
    .chat-bubble-other { background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(0,0,255,0.3)); border: 1px solid var(--ff-cyan); border-radius: 15px 15px 15px 0; margin-right: auto; box-shadow: 0 5px 15px rgba(0,255,255,0.2); }
  `}</style>
);

const VideoBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-[-15] overflow-hidden bg-black">
    {/* Video de Partículas de Fuego en Bucle (Alta disponibilidad) */}
    <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen scale-105">
       <source src="https://cdn.pixabay.com/video/2020/08/21/47743-451554625_large.mp4" type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-[#1a0000]"></div>
  </div>
);

const LightningStorm = () => (
  <div className="fixed inset-0 pointer-events-none z-[-12] bg-white opacity-0 mix-blend-overlay" style={{ animation: 'lightningFlash 15s infinite' }}></div>
);

const MeteorShower = () => (
  <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <div key={i} className="meteor" style={{
        top: Math.random() * 80 - 20 + '%', left: Math.random() * 150 + '%',
        animation: `meteor-fall ${Math.random() * 1.5 + 1}s infinite ${Math.random() * 5}s`,
        background: Math.random() > 0.8 ? 'linear-gradient(to left, #00ffff, #0000ff, transparent)' : 'linear-gradient(to left, #fff, #ff4500, transparent)'
      }}></div>
    ))}
  </div>
);

const AshRain = () => (
  <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
    {[...Array(400)].map((_, i) => {
      const size = Math.random() * 4 + 2;
      return (
        <div key={i} className="ember" style={{
          width: `${size}px`, height: `${size}px`, 
          left: Math.random() * 100 + '%', bottom: '-20px',
          animation: `emberRise ${Math.random() * 5 + 3}s ease-in infinite`, animationDelay: Math.random() * 10 + 's', opacity: Math.random() * 0.9 + 0.1
        }}></div>
      );
    })}
  </div>
);

const CharacterDecor = () => (
  <div className="fixed inset-0 pointer-events-none z-[-3] overflow-hidden max-w-[1920px] mx-auto opacity-70">
    <img src="https://i.pinimg.com/originals/ce/c4/85/cec485125eaaf9cceaf96ee6bda02e60.png" onError={(e)=>e.target.style.display='none'} className="absolute bottom-0 left-[-100px] md:left-0 h-[45vh] md:h-[80vh] object-contain drop-shadow-[0_0_40px_rgba(255,69,0,0.8)]" style={{ animation: 'floatChar 6s ease-in-out infinite' }} alt="char1"/>
    <img src="https://i.pinimg.com/originals/db/db/1d/dbdb1d0e82c286dc5eebc3f191b4cb3f.png" onError={(e)=>e.target.style.display='none'} className="absolute bottom-0 right-[-100px] md:right-[-50px] h-[50vh] md:h-[85vh] object-contain drop-shadow-[0_0_40px_rgba(255,215,0,0.8)]" style={{ animation: 'floatChar 7s ease-in-out infinite reverse' }} alt="char2"/>
    <img src="https://i.pinimg.com/originals/30/1e/cb/301ecbaab8de6cf2a8187ab6705ec9ce.png" onError={(e)=>e.target.style.display='none'} className="absolute bottom-0 left-1/4 h-[30vh] md:h-[50vh] object-contain opacity-30 drop-shadow-[0_0_30px_rgba(255,0,0,0.9)] mix-blend-screen" style={{ animation: 'floatChar 8s ease-in-out infinite 2s' }} alt="char3"/>
  </div>
);

const FireEffect = () => (
  <div className="fixed bottom-0 left-0 w-full h-screen pointer-events-none z-[-5] overflow-hidden">
    <div className="fire-base"></div>
    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#ff2a00]/50 via-[#ff0000]/20 to-transparent blur-2xl animate-pulse"></div>
    <div className="fire-flame"></div>
  </div>
);

// --- 4. SISTEMA DE CHAT P2P (INTACTO) ---
const ChatSystem = ({ orderId, currentUserRole, currentUserId, orderStatus, onUpdateStatus, orderData }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders', orderId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [orderId]);

  const sendMessage = async (text, type = 'text', imageUrl = null) => {
    if (!text && !imageUrl) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders', orderId, 'messages'), {
        text, type, imageUrl,
        senderId: currentUserId || 'GUEST',
        role: currentUserRole,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) { console.error("Error enviando:", error); }
  };

  const handleReportPayment = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const img = await compressImage(file);
      await sendMessage("He realizado el pago. Adjunto comprobante.", "image", img);
      await onUpdateStatus('payment_reported');
    } finally { setIsUploading(false); }
  };

  const handleConfirmPayment = async () => {
    if(!confirm("¿CONFIRMA RECEPCIÓN DEL PAGO? Acción irreversible.")) return;
    await sendMessage("Pago recibido. Transmitiendo credenciales seguras:", "system");
    await sendMessage(`CUENTA: ${orderData.item.title}\nUSUARIO: admin_user\nCLAVE: TempPass123!`, "credentials"); 
    await onUpdateStatus('payment_confirmed');
  };

  const handleFinalizeOrder = async () => {
    if(!confirm("¿CONFIRMA ACCESO EXITOSO?")) return;
    await sendMessage("Acceso verificado. Transacción finalizada.", "system");
    await onUpdateStatus('completed');
  };

  return (
    <div className="flex flex-col h-[500px] border-2 border-orange-600/50 bg-black/80 rounded-lg overflow-hidden relative shadow-[0_0_30px_rgba(255,69,0,0.4)] backdrop-blur-md">
      <div className="bg-gradient-to-r from-gray-900 via-red-900/30 to-gray-900 p-4 border-b border-orange-600/50 flex justify-between items-center">
        <span className="text-cyan-400 font-bold flex items-center gap-2 font-tech uppercase tracking-widest"><MessageSquare size={18} className="animate-pulse"/> CANAL SEGURO P2P</span>
        <div className="flex items-center gap-2">
           <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase shadow-[0_0_15px_currentColor] ${orderStatus === 'completed' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
              ESTADO: {orderStatus === 'created' ? 'ESPERANDO PAGO' : orderStatus === 'payment_reported' ? 'CONFIRMANDO' : orderStatus === 'payment_confirmed' ? 'ENTREGANDO' : 'FINALIZADO'}
           </span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.role === currentUserRole;
          return (
            <div key={msg.id} className={`flex flex-col max-w-[85%] animate-enter ${isMe ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
              {msg.type === 'system' ? (
                 <div className="w-full text-center my-3"><span className="text-[10px] bg-red-900/50 text-orange-300 px-4 py-1.5 rounded-full uppercase border border-orange-600 shadow-[0_0_10px_rgba(255,69,0,0.5)] font-bold">{msg.text}</span></div>
              ) : (
                <div className={`p-4 text-sm font-bold tracking-wide ${isMe ? 'chat-bubble-me text-white' : 'chat-bubble-other text-gray-100'}`}>
                  {msg.imageUrl && <img src={msg.imageUrl} onError={(e)=>e.target.style.display='none'} className="w-48 rounded mb-2 border-2 border-orange-500 cursor-pointer hover:scale-[2] transition-transform duration-500 z-50 relative origin-bottom-right" />}
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-950 border-t border-orange-600/50 p-3">
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
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(newMessage); }} className="p-3 bg-black flex gap-3 border-t border-gray-800">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escriba un mensaje..." 
          className="flex-grow input-ff py-3 !pl-4 text-white focus:border-orange-500 outline-none"
          disabled={orderStatus === 'completed'}
        />
        <button type="submit" disabled={orderStatus === 'completed'} className="bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white p-3 rounded-lg border border-orange-400 shadow-[0_0_15px_rgba(255,69,0,0.5)] transition-transform hover:scale-110 active:scale-95"><Send size={24}/></button>
      </form>
    </div>
  );
};

// --- 5. PERFIL PUBLICO (INTACTO) ---
const SellerProfileView = ({ sellerId, onClose, onBuy }) => {
  const [profile, setProfile] = useState(null);
  const [salesCount, setSalesCount] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [sellerListings, setSellerListings] = useState([]);

  useEffect(() => {
    const load = async () => {
      const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', sellerId, 'profile', 'data'));
      if (docSnap.exists()) setProfile(docSnap.data());
      
      const qOrders = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', sellerId), where('status', '==', 'completed'));
      const salesSnap = await getDocs(qOrders);
      setSalesCount(salesSnap.size);

      const qListings = query(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), where('sellerId', '==', sellerId));
      const listingsSnap = await getDocs(qListings);
      setSellerListings(listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qRatings = query(collection(db, 'artifacts', appId, 'users', sellerId, 'ratings'), orderBy('createdAt', 'desc'));
      const ratingsSnap = await getDocs(qRatings);
      setRatings(ratingsSnap.docs.map(d => d.data()));
    };
    load();
  }, [sellerId]);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 overflow-auto backdrop-blur-xl">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
       <div className="hud-panel p-8 md:p-12 max-w-6xl w-full relative animate-enter max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_100px_rgba(255,69,0,0.4)]">
          <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-50 transition-colors hover:rotate-90 duration-300"><X size={40}/></button>
          
          <div className="flex flex-col md:flex-row gap-10 relative z-10">
             {/* INFO PERFIL */}
             <div className="w-full md:w-1/3">
                <div className="flex flex-col items-center text-center mb-8 relative group">
                   <div className="absolute inset-0 bg-orange-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                   <div className="w-40 h-40 rounded-full border-4 border-orange-500 overflow-hidden mb-6 bg-black shadow-[0_0_50px_rgba(255,69,0,0.8)] relative z-10">
                      {profile.kycData?.selfie ? <img src={profile.kycData.selfie} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"/> : <User size={80} className="text-gray-500 m-auto mt-10"/>}
                   </div>
                   
                   <div className="flex items-center gap-3 justify-center flex-wrap">
                      <h2 className="text-4xl font-gamer text-white uppercase glitch tracking-wider" data-text={profile.publicUsername}>{profile.publicUsername}</h2>
                      {salesCount >= 1000 && (
                         <div className="relative group/badge">
                            <div className="bg-blue-500/20 border-2 border-blue-400 rounded-full p-1 shadow-[0_0_20px_rgba(0,191,255,0.8)] cursor-help animate-pulse">
                               <CheckCircle size={24} className="text-blue-400" strokeWidth={3} />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-black border-2 border-blue-500 text-blue-400 text-sm p-4 rounded shadow-[0_0_30px_rgba(0,191,255,0.4)] opacity-0 group-hover/badge:opacity-100 transition-opacity z-50 pointer-events-none font-tech uppercase text-center">
                               <p className="font-bold text-white mb-1">Usuario, confiable y verificado.</p>
                               <p className="text-[10px] text-orange-400 mt-1">Por TecnoByte LLC.</p>
                            </div>
                         </div>
                      )}
                   </div>
                   <span className="text-cyan-400 font-tech tracking-[0.2em] text-sm uppercase flex items-center gap-2 mt-3 bg-cyan-900/30 px-4 py-1.5 rounded-full border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]"><Shield size={16}/> Comandante Verificado</span>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="bg-black/60 p-5 border-2 border-gray-800 text-center hover:border-yellow-500 transition-all hover:scale-105 shadow-lg group">
                      <p className="text-sm text-gray-400 uppercase font-tech tracking-wider group-hover:text-yellow-500">Ventas Completadas</p>
                      <p className="text-5xl font-gamer text-yellow-500 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] mt-2">{salesCount}</p>
                   </div>
                   <div className="bg-black/60 p-5 border-2 border-gray-800 text-center hover:border-green-500 transition-all hover:scale-105 shadow-lg group">
                      <p className="text-sm text-gray-400 uppercase font-tech tracking-wider group-hover:text-green-400">Reputación</p>
                      <div className="flex justify-center text-green-500 mt-3 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)] gap-1"><Star fill="currentColor" size={24}/><Star fill="currentColor" size={24}/><Star fill="currentColor" size={24}/><Star fill="currentColor" size={24}/><Star fill="currentColor" size={24}/></div>
                   </div>
                </div>

                <div className="space-y-3 text-base text-gray-200 font-mono border-t-2 border-gray-800 pt-6 bg-black/40 p-4 rounded-lg">
                   <p className="flex justify-between border-b border-gray-800 pb-2"><span className="text-orange-500 font-bold">Admin:</span> <span>{profile.adminName}</span></p>
                   <p className="flex justify-between border-b border-gray-800 pb-2"><span className="text-orange-500 font-bold">Whatsapp:</span> <span>{profile.whatsapp}</span></p>
                   <p className="flex justify-between"><span className="text-orange-500 font-bold">Miembro desde:</span> <span>{new Date(profile.createdAt).toLocaleDateString()}</span></p>
                </div>

                {/* HISTORIAL DE CALIFICACIONES */}
                <div className="mt-8 border-t-2 border-orange-900/50 pt-6 relative">
                   <div className="absolute -inset-4 bg-red-900/10 blur-xl z-[-1]"></div>
                   <h3 className="font-tech text-2xl text-white mb-6 uppercase text-center flex items-center justify-center gap-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"><CheckSquare size={24} className="text-green-500"/> Registro de Operaciones</h3>
                   <div className="space-y-4 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                      {ratings.length === 0 ? (
                         <p className="text-gray-500 text-sm text-center italic">Sin operaciones registradas aún.</p>
                      ) : (
                         ratings.map((r, i) => (
                            <div key={i} className="bg-gradient-to-r from-black via-gray-900 to-black border border-gray-700 p-4 flex justify-between items-center hover:border-orange-500 transition-all hover:scale-[1.02] shadow-md rounded">
                               <div>
                                  <p className="text-base font-bold text-white uppercase">{r.buyerName}</p>
                                  <p className="text-xs text-orange-500 font-mono mt-1">OP: #{r.orderId}</p>
                               </div>
                               <div className={`px-3 py-1.5 text-xs font-bold uppercase rounded flex items-center gap-2 shadow-[0_0_10px_currentColor] ${
                                  r.type === 'good' ? 'bg-green-900/40 text-green-400 border border-green-500' :
                                  r.type === 'neutral' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500' :
                                  'bg-red-900/40 text-red-400 border border-red-500'
                               }`}>
                                  {r.type === 'good' ? <ThumbsUp size={14}/> : r.type === 'neutral' ? <Minus size={14}/> : <ThumbsDown size={14}/>}
                                  {r.type === 'good' ? 'POSITIVA' : r.type === 'neutral' ? 'NEUTRAL' : 'NEGATIVA'}
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>
             </div>

             {/* ARSENAL */}
             <div className="w-full md:w-2/3 border-l-2 border-gray-800 pl-0 md:pl-10">
                <h3 className="font-tech text-3xl text-white mb-8 uppercase flex items-center gap-3 border-b-2 border-orange-600 pb-4 text-shadow-glow">
                   <Flame className="text-orange-500 animate-pulse" size={36}/> Arsenal Disponible <span className="text-orange-500">[{sellerListings.length}]</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {sellerListings.length === 0 ? (
                      <div className="col-span-2 text-center py-20 border-2 border-dashed border-gray-700 bg-black/50"><p className="text-gray-500 italic text-xl">Este vendedor no tiene suministros activos.</p></div>
                   ) : (
                      sellerListings.map((item, index) => (
                         <ProductCard 
                            key={item.id} 
                            item={item} 
                            index={index} 
                            onBuy={() => { onClose(); onBuy(item); }} 
                            onViewSeller={() => {}} 
                         />
                      ))
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- 6. VISTA PRINCIPAL (MARKETPLACE + SEARCH) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); 
  const [listings, setListings] = useState([]);
  const [notification, setNotification] = useState(null);
  const [purchaseItem, setPurchaseItem] = useState(null);
  const [viewSellerId, setViewSellerId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data');
        const snap = await getDoc(userRef);
        if (snap.exists()) setUserData(snap.data());
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'listings');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setListings(items);
    });
    return () => unsubscribe();
  }, [user]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserData(null);
    setView('home');
    showNotification("Sesión finalizada");
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-gamer text-3xl relative overflow-hidden">
      <Styles />
      <VideoBackground />
      <FireEffect />
      <div className="z-10 flex flex-col items-center p-10 hud-panel animate-pulse">
         <Crosshair size={120} className="text-orange-600 animate-spin-slow mb-6 drop-shadow-[0_0_20px_#FF4500]" />
         <span className="tracking-[0.2em] text-shadow-glow glitch" data-text="INICIANDO SISTEMA TECNOBYTE...">INICIANDO SISTEMA TECNOBYTE...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100 bg-transparent selection:bg-orange-600 selection:text-white">
      <Styles />
      {/* CAPAS DE FONDO EXTREMAS */}
      <VideoBackground />
      <LightningStorm />
      <FireEffect />
      <MeteorShower />
      <AshRain />
      <CharacterDecor />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

      <Navbar user={user} userData={userData} setView={setView} onLogout={handleLogout} />

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 animate-enter">
        {notification && (
          <div className={`fixed top-28 left-1/2 transform -translate-x-1/2 z-[100] px-8 py-5 hud-panel border-l-8 flex items-center gap-4 font-tech uppercase font-black tracking-widest text-lg animate-enter ${notification.type === 'error' ? 'border-red-600 text-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]' : 'border-green-500 text-green-400 shadow-[0_0_50px_rgba(0,255,0,0.8)]'}`}>
            {notification.type === 'error' ? <AlertTriangle size={32} className="animate-pulse"/> : <CheckCircle size={32} className="animate-pulse"/>}
            {notification.msg}
          </div>
        )}

        {view === 'home' && <Marketplace listings={listings} setPurchaseItem={setPurchaseItem} setView={setView} user={user} setViewSellerId={setViewSellerId} />}
        {view === 'login' && <LoginForm setView={setView} showNotification={showNotification} />}
        {view === 'register' && <RegisterForm setView={setView} showNotification={showNotification} />}
        {view === 'dashboard' && <Dashboard user={user} userData={userData} listings={listings} setView={setView} showNotification={showNotification} />}
        {view === 'create' && <ListingForm user={user} userData={userData} setView={setView} showNotification={showNotification} mode="create" />}
        {view.startsWith('edit-') && <ListingForm user={user} userData={userData} setView={setView} showNotification={showNotification} mode="edit" editId={view.split('-')[1]} listings={listings} />}
      </main>

      {purchaseItem && <PurchaseModal item={purchaseItem} onClose={() => setPurchaseItem(null)} showNotification={showNotification} />}
      {viewSellerId && <SellerProfileView sellerId={viewSellerId} onClose={() => setViewSellerId(null)} onBuy={(item) => setPurchaseItem(item)} />}

      <Footer />
    </div>
  );
}

// --- 7. MODAL DE COMPRA (INTACTO CON EL LOGO LOCAL) ---
const PurchaseModal = ({ item, onClose, showNotification }) => {
  const [step, setStep] = useState(1);
  const [buyerData, setBuyerData] = useState({ firstName: '', lastName: '', idNumber: '', email: '', whatsapp: '', country: '', state: '' });
  const [sellerMethods, setSellerMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [sellerData, setSellerData] = useState(null);
  const [orderStatus, setOrderStatus] = useState('created');
  const [isRated, setIsRated] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const sellerRef = doc(db, 'artifacts', appId, 'users', item.sellerId, 'profile', 'data');
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSellerData(sellerSnap.data());
          const methodsRef = collection(db, 'artifacts', appId, 'users', item.sellerId, 'paymentMethods');
          onSnapshot(methodsRef, (snap) => setSellerMethods(snap.docs.map(d => ({id: d.id, ...d.data()}))));
        }
        setRate(await getExchangeRate());
      } catch (e) { console.error(e); }
    };
    fetchSellerData();
  }, [item]);

  const handleBuyerChange = (e) => setBuyerData({...buyerData, [e.target.name]: e.target.value});

  const handleConfirmPurchase = async () => {
    if (!selectedMethod) return showNotification("SELECCIONE UN MÉTODO DE PAGO", "error");
    setLoading(true);
    
    const finalAmountUSD = item.discountActive ? item.discountPrice : item.price;
    const finalAmountVES = selectedMethod.currency === 'VES' ? finalAmountUSD * rate : 0;
    const userIP = await getIP();
    
    const orderDetails = {
      orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
      date: new Date().toISOString(),
      status: 'created',
      rated: false,
      item: { title: item.title, price: finalAmountUSD, id: item.id },
      seller: { id: item.sellerId, adminName: sellerData?.adminName, username: sellerData?.publicUsername, whatsapp: sellerData?.whatsapp, idNumber: sellerData?.idNumber },
      buyer: buyerData,
      payment: { method: selectedMethod.name, currency: selectedMethod.currency, totalUSD: finalAmountUSD, rateUsed: rate, totalVES: finalAmountVES, details: selectedMethod.details },
      securityMetadata: { ip: userIP, userAgent: navigator.userAgent, timestamp: serverTimestamp() }
    };

    try {
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderDetails);
      setInvoiceData({ ...orderDetails, dbId: docRef.id });
      setStep(3);
      showNotification("ORDEN CREADA - PROCEDA AL PAGO", "success");
      
      onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'orders', docRef.id), (doc) => {
         if(doc.exists()) {
            const d = doc.data();
            setOrderStatus(d.status);
            if(d.rated) setIsRated(true);
         }
      });

    } catch (e) { showNotification("ERROR CRÍTICO: " + e.message, "error"); } 
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (newStatus) => {
     if(!invoiceData?.dbId) return;
     await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', invoiceData.dbId), { status: newStatus });
     setOrderStatus(newStatus);
  };

  const handleRateSeller = async (type) => { 
    if(!invoiceData) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', invoiceData.seller.id, 'ratings'), {
        buyerName: `${invoiceData.buyer.firstName} ${invoiceData.buyer.lastName}`,
        type: type,
        orderId: invoiceData.orderId,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', invoiceData.dbId), { rated: true });
      setIsRated(true);
      showNotification("¡CALIFICACIÓN ENVIADA AL COMANDANTE!", "success");
    } catch(e) { showNotification("ERROR AL CALIFICAR", "error"); }
  };

  if (step === 3 && invoiceData) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 overflow-auto backdrop-blur-xl">
        <div id="invoice-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full h-[90vh]">
          
          <div className="hud-panel p-8 font-mono relative animate-enter text-gray-200 border-2 border-orange-500 overflow-y-auto shadow-[0_0_50px_rgba(255,69,0,0.5)]">
            <div className="border-b-2 border-orange-600 pb-6 mb-8 flex justify-between items-start">
               <div>
                  {/* LOGO LOCAL RESTAURADO */}
                  <img src="/nexus-station-logo.png" alt="NEXUS" className="h-16 logo-hyper-anim drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                  <p className="text-sm text-cyan-400 tracking-[0.4em] uppercase font-tech mt-2 font-bold">MARKETPLACE DE ELITE</p>
               </div>
               <div className="text-right">
                  <h2 className="text-4xl font-black text-white uppercase font-tech tracking-widest text-shadow-glow">FACTURA</h2>
                  <p className="text-lg text-orange-500 font-bold mt-2 bg-orange-900/30 px-3 py-1 border border-orange-500 rounded">#{invoiceData.orderId}</p>
               </div>
            </div>
            <div className="space-y-6 text-sm">
               <div className="bg-gradient-to-r from-gray-900 to-black p-5 border border-gray-700 rounded"><h3 className="font-bold border-b-2 border-orange-600/50 mb-3 text-orange-400 uppercase text-lg tracking-wider">DATOS VENDEDOR</h3><p className="text-base text-gray-300">Admin: <span className="text-white">{invoiceData.seller.adminName}</span></p><p className="text-base text-gray-300">Whatsapp: <span className="text-white">{invoiceData.seller.whatsapp}</span></p></div>
               <div className="bg-gradient-to-r from-gray-900 to-black p-5 border border-gray-700 rounded"><h3 className="font-bold border-b-2 border-cyan-600/50 mb-3 text-cyan-400 uppercase text-lg tracking-wider">DATOS CLIENTE</h3><p className="text-base text-gray-300">Nombre: <span className="text-white">{invoiceData.buyer.firstName} {invoiceData.buyer.lastName}</span></p><p className="text-base text-gray-300">ID: <span className="text-white">{invoiceData.buyer.idNumber}</span></p></div>
               <table className="w-full border-collapse mt-8"><thead><tr className="bg-orange-900/40 text-orange-400 uppercase font-tech text-lg border-2 border-orange-600"><th className="p-3 text-left">ÍTEM ADQUIRIDO</th><th className="p-3 text-right">VALOR USD</th></tr></thead><tbody><tr><td className="p-5 border-2 border-gray-700 text-white font-bold text-lg">{invoiceData.item.title}</td><td className="p-5 text-right border-2 border-gray-700 text-yellow-500 font-gamer text-2xl">${invoiceData.payment.totalUSD}</td></tr></tbody></table>
               <div className="text-right mt-6 bg-black/50 p-6 border border-yellow-500 rounded"><p className="font-black text-white text-2xl">TOTAL A PAGAR USD: <span className="text-yellow-500 text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">${invoiceData.payment.totalUSD}</span></p>{invoiceData.payment.currency === 'VES' && <p className="font-black text-green-400 mt-4 text-3xl border-t border-gray-700 pt-4 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">TOTAL VES: {formatCurrency(invoiceData.payment.totalVES, 'VES')}</p>}</div>
            </div>
            
            {orderStatus === 'completed' && !isRated && (
               <div className="mt-10 border-t-2 border-cyan-600 pt-8 animate-enter bg-gradient-to-b from-cyan-900/20 to-transparent p-6 rounded">
                  <h3 className="text-center font-tech text-cyan-400 text-xl mb-6 uppercase tracking-widest font-bold">¿Cómo fue su experiencia en combate?</h3>
                  <div className="flex justify-center gap-6">
                     <button onClick={() => handleRateSeller('good')} className="flex flex-col items-center gap-3 p-4 bg-green-900/30 border-2 border-green-600 rounded-lg hover:bg-green-600 transition-all hover:scale-110 shadow-[0_0_15px_rgba(0,255,0,0.3)] group w-28"><ThumbsUp size={32} className="text-green-400 group-hover:text-white"/> <span className="text-xs font-black tracking-widest text-green-400 group-hover:text-white">ÉPICA</span></button>
                     <button onClick={() => handleRateSeller('neutral')} className="flex flex-col items-center gap-3 p-4 bg-yellow-900/30 border-2 border-yellow-600 rounded-lg hover:bg-yellow-600 transition-all hover:scale-110 shadow-[0_0_15px_rgba(255,255,0,0.3)] group w-28"><Minus size={32} className="text-yellow-400 group-hover:text-white"/> <span className="text-xs font-black tracking-widest text-yellow-400 group-hover:text-white">NORMAL</span></button>
                     <button onClick={() => handleRateSeller('bad')} className="flex flex-col items-center gap-3 p-4 bg-red-900/30 border-2 border-red-600 rounded-lg hover:bg-red-600 transition-all hover:scale-110 shadow-[0_0_15px_rgba(255,0,0,0.3)] group w-28"><ThumbsDown size={32} className="text-red-400 group-hover:text-white"/> <span className="text-xs font-black tracking-widest text-red-400 group-hover:text-white">MALA</span></button>
                  </div>
               </div>
            )}
            {isRated && (<div className="mt-10 text-center p-6 bg-blue-900/30 border-2 border-blue-500 rounded-lg animate-enter shadow-[0_0_30px_rgba(0,191,255,0.4)]"><p className="text-blue-400 font-black uppercase text-xl flex items-center justify-center gap-3 tracking-widest"><CheckSquare size={28}/> REPORTE RECIBIDO, SOLDADO.</p></div>)}

            <div className="absolute top-6 right-6 flex gap-3 no-print z-50">
               <button onClick={() => window.print()} className="bg-cyan-600 text-black px-4 py-2 hover:bg-cyan-400 flex items-center gap-2 text-sm font-black font-tech uppercase shadow-[0_0_20px_cyan] transition-colors"><Download size={20}/> IMPRIMIR</button>
               <button onClick={onClose} className="bg-red-600 text-white p-2 hover:bg-red-500 shadow-[0_0_20px_red] transition-colors"><X size={24}/></button>
            </div>
          </div>

          <div className="flex flex-col gap-6 animate-enter" style={{animationDelay: '0.3s'}}>
             <div className="bg-yellow-600/20 border-2 border-yellow-500 p-6 rounded-lg text-center shadow-[0_0_30px_rgba(255,215,0,0.2)]"><h3 className="text-yellow-500 font-black uppercase flex items-center justify-center gap-3 text-xl tracking-widest mb-2"><AlertTriangle size={28} className="animate-pulse"/> PROTOCOLO P2P ACTIVADO</h3><p className="text-sm text-gray-300 font-bold">Siga las instrucciones en el canal seguro para liberar el producto.</p></div>
             <div className="flex-grow"><ChatSystem orderId={invoiceData.dbId} currentUserRole="COMPRADOR" currentUserId="GUEST_BUYER" orderStatus={orderStatus} onUpdateStatus={updateOrderStatus} orderData={invoiceData}/></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="hud-panel p-10 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative animate-enter shadow-[0_0_80px_rgba(255,69,0,0.6)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-300"><X size={36}/></button>
        <h2 className="text-4xl font-gamer text-white mb-10 flex items-center gap-4 border-b-2 border-orange-600 pb-4 text-shadow-glow"><ShoppingBag className="text-orange-500" size={40}/> PROCESAR ADQUISICIÓN</h2>
        
        {step === 1 && (
          <div className="space-y-8">
            <h3 className="font-tech text-cyan-400 text-xl uppercase tracking-[0.3em] mb-6 flex items-center gap-2 bg-cyan-900/20 p-3 border-l-4 border-cyan-500"><ScanFace/> Fase 1: Identificación del Operador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-6 border border-gray-800 rounded">
               <div className="input-wrapper"><User className="w-6 h-6"/><input name="firstName" placeholder="Nombres *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><User className="w-6 h-6"/><input name="lastName" placeholder="Apellidos *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><CreditCard className="w-6 h-6"/><input name="idNumber" placeholder="Cédula / ID *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><Phone className="w-6 h-6"/><input name="whatsapp" placeholder="Whatsapp Contacto *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><Mail className="w-6 h-6"/><input name="email" placeholder="Correo Electrónico *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="input-wrapper"><Globe className="w-6 h-6"/><input name="country" placeholder="País *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
                  <div className="input-wrapper"><MapPin className="w-6 h-6"/><input name="state" placeholder="Estado *" className="input-ff p-4 w-full text-lg" onChange={handleBuyerChange} /></div>
               </div>
            </div>
            <button onClick={() => {
                const { firstName, lastName, idNumber, whatsapp, email, country, state } = buyerData;
                if(!firstName || !lastName || !idNumber || !whatsapp || !email || !country || !state) return showNotification("TODOS LOS DATOS SON OBLIGATORIOS", "error");
                setStep(2);
              }} className="w-full btn-ff py-5 text-2xl mt-6 tracking-widest shadow-[0_0_30px_rgba(255,69,0,0.5)]">CONTINUAR AL PAGO &gt;&gt;</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8 animate-enter">
            <h3 className="font-tech text-cyan-400 text-xl uppercase tracking-[0.3em] mb-6 flex items-center gap-2 bg-cyan-900/20 p-3 border-l-4 border-cyan-500"><Banknote/> Fase 2: Transferencia de Créditos</h3>
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-2 border-orange-500 mb-8 flex justify-between items-center rounded shadow-[0_0_20px_rgba(255,69,0,0.3)]"><span className="text-xl font-bold uppercase tracking-widest text-gray-300">Monto a Pagar (USD):</span><span className="text-5xl font-gamer text-yellow-500 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">${item.discountActive ? item.discountPrice : item.price}</span></div>
            
            {sellerMethods.length === 0 ? (<div className="text-center p-12 border-2 border-dashed border-red-500 text-red-500 font-black uppercase text-2xl bg-red-900/20">El vendedor no ha configurado métodos de pago.</div>) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {sellerMethods.map(m => (
                     <div key={m.id} onClick={() => setSelectedMethod(m)} className={`p-6 border-2 cursor-pointer transition-all hover:scale-[1.03] ${selectedMethod?.id === m.id ? 'border-orange-500 bg-orange-900/30 shadow-[0_0_20px_rgba(255,69,0,0.4)]' : 'border-gray-700 hover:border-gray-400 bg-black/50'}`}>
                        <div className="font-black text-white uppercase flex items-center justify-between text-lg mb-3">{m.name} <span className="text-xs bg-cyan-900/50 px-3 py-1 border border-cyan-500 text-cyan-400 rounded">{m.currency}</span></div>
                        <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap bg-black/80 p-3 rounded border border-gray-800">{m.details}</p>
                     </div>
                  ))}
               </div>
            )}
            
            {selectedMethod?.currency === 'VES' && (
               <div className="bg-green-900/30 border-2 border-green-500 p-8 animate-enter rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.2)]">
                  <div className="flex justify-between text-base text-green-400 mb-4 uppercase font-black tracking-widest border-b border-green-700 pb-3"><span>Tasa CriptoYA Activa:</span><span>{rate > 0 ? formatCurrency(rate, 'VES') : 'Consultando satélite...'} / USD</span></div>
                  <div className="flex justify-between text-4xl font-gamer text-white pt-2 mt-2 items-center"><span>TOTAL A TRANSFERIR:</span><span className="text-5xl text-green-400 drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]">{formatCurrency((item.discountActive ? item.discountPrice : item.price) * rate, 'VES')}</span></div>
               </div>
            )}
            
            <button onClick={handleConfirmPurchase} disabled={loading} className="w-full btn-ff py-5 text-2xl mt-6 flex items-center justify-center gap-3 tracking-widest shadow-[0_0_40px_rgba(255,69,0,0.6)]">{loading ? "PROCESANDO TRANSACCIÓN..." : <><CheckCircle size={28} className="animate-pulse"/> CONFIRMAR TRANSFERENCIA</>}</button>
            <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 mt-4 hover:text-white uppercase font-bold tracking-widest transition-colors py-2">&lt;&lt; VOLVER A MODIFICAR DATOS</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Navbar (Header) (CON LOGO LOCAL RESTAURADO) ---
const Navbar = ({ user, userData, setView, onLogout }) => (
  <nav className="sticky top-0 z-[60] bg-black/80 backdrop-blur-xl border-b-2 border-orange-600/50 shadow-[0_10px_50px_rgba(255,69,0,0.4)] animate-enter">
    <div className="container mx-auto px-4 h-24 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer group select-none transition-transform duration-500 hover:scale-[1.02]" onClick={() => setView('home')}>
        <div className="flex flex-col relative">
          <div className="absolute -inset-4 bg-orange-600 blur-2xl opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-pulse rounded-full"></div>
          {/* LOGO LOCAL RESTAURADO */}
          <img src="/nexus-station-logo.png" alt="NEXUS STATION" className="h-16 md:h-20 object-contain logo-hyper-anim z-10 relative drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        {!user ? (
          <>
            <button onClick={() => setView('login')} className="hidden md:flex items-center gap-2 text-cyan-400 hover:text-white font-tech text-sm uppercase tracking-widest transition-colors bg-cyan-900/20 px-4 py-2 rounded border border-cyan-800 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"><Lock size={16} /> Acceso Admin</button>
            <button onClick={() => setView('register')} className="btn-ff px-8 py-3 text-lg font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(255,69,0,0.6)] tracking-widest"><User size={20} /> UNIRSE</button>
          </>
        ) : (
          <div className="flex items-center gap-6 bg-gradient-to-r from-gray-900 to-black px-6 py-3 rounded-lg border-2 border-orange-900/50 shadow-[0_0_30px_rgba(255,69,0,0.3)] hover:border-orange-500 transition-colors">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-yellow-500 font-gamer text-lg tracking-wider flex items-center gap-2"><Diamond size={16} className="fill-yellow-500 animate-pulse drop-shadow-[0_0_10px_yellow]" /> {userData?.adminName || "VENDEDOR"}</span>
              <span className="text-[11px] text-gray-400 font-tech uppercase tracking-[0.2em]">{userData?.publicUsername}</span>
            </div>
            <div className="flex gap-4 border-l border-gray-700 pl-4">
              <button onClick={() => setView('dashboard')} className="p-2 bg-orange-900/30 hover:bg-orange-600 rounded text-orange-400 hover:text-white transition-all shadow-md"><User size={24} /></button>
              <button onClick={onLogout} className="p-2 bg-red-900/30 hover:bg-red-600 rounded text-red-400 hover:text-white transition-all shadow-md"><LogOut size={24} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  </nav>
);

const Marketplace = ({ listings, setPurchaseItem, setView, user, setViewSellerId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredListings = listings.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (item.title.toLowerCase().includes(term) || item.adminName?.toLowerCase().includes(term) || item.sellerUsername?.toLowerCase().includes(term));
  });

  return (
    <div className="pb-16">
      <div className="relative rounded-2xl overflow-hidden mb-20 border-4 border-orange-600/50 group shadow-[0_0_80px_rgba(255,69,0,0.4)] animate-enter">
        <div className="absolute inset-0 bg-[url('https://wallpaperaccess.com/full/2222718.jpg')] bg-cover bg-center opacity-70 group-hover:scale-110 group-hover:opacity-90 transition-all duration-[5s] ease-out"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        
        {/* Personaje decorativo en el Hero */}
        <div className="absolute right-[-10%] bottom-0 h-[120%] pointer-events-none opacity-80 group-hover:scale-105 transition-transform duration-700 z-0">
           <img src="https://i.pinimg.com/originals/a4/8e/3c/a48e3c4a22216447e170c2a688b58406.png" onError={(e)=>e.target.style.display='none'} alt="hero character" className="h-full object-contain drop-shadow-[0_0_50px_rgba(255,69,0,0.8)]" />
        </div>

        <div className="relative z-10 p-12 md:p-24 flex flex-col items-start max-w-4xl">
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white text-base font-black px-6 py-2 mb-8 uppercase tracking-[0.4em] -skew-x-12 shadow-[8px_8px_0px_rgba(0,0,0,0.7)] animate-enter-delay-1 border border-red-400"><Flame size={18} className="inline mr-2 mb-1 animate-pulse" /> Temporada de Fuego</div>
          <h2 className="text-7xl md:text-9xl font-gamer text-white mb-6 italic leading-[0.9] drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] uppercase animate-enter-delay-2">Mercado <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-pulse">Infernal</span></h2>
          <div className="w-full max-w-2xl relative mt-8 animate-enter-delay-3">
             <div className="input-wrapper group/search">
               <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-500 rounded blur opacity-25 group-hover/search:opacity-60 transition duration-500"></div>
               <Search className="w-8 h-8 absolute left-5 top-1/2 transform -translate-y-1/2 text-orange-500 z-10 drop-shadow-[0_0_5px_rgba(255,69,0,0.8)]"/>
               <input placeholder="Rastrear Vendedor o Producto..." className="input-ff w-full p-6 pl-16 text-2xl border-2 border-orange-500/50 focus:border-orange-400 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative z-1" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
             </div>
          </div>
          <p className="text-gray-200 font-tech text-2xl mb-12 max-w-xl border-l-4 border-yellow-500 pl-8 uppercase animate-enter-delay-3 leading-relaxed text-shadow-glow mt-10 bg-black/40 p-4 rounded backdrop-blur-sm">Cuentas Sakura, Hip-Hop y Criminales listos para el combate. Transacción inmediata y segura.</p>
          {user && (<button onClick={() => setView('create')} className="animate-enter-delay-3 btn-ff px-12 py-6 text-3xl flex items-center gap-5 shadow-[0_0_50px_rgba(255,69,0,0.8)] hover:shadow-[0_0_80px_rgba(255,69,0,1)] tracking-widest"><Plus size={36} className="animate-spin-slow" /> PUBLICAR ARSENAL</button>)}
        </div>
      </div>
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredListings.map((item, index) => (<ProductCard key={item.id} item={item} index={index} onBuy={() => setPurchaseItem(item)} onViewSeller={() => setViewSellerId(item.sellerId)} />))}
        </div>
      ) : (<div className="text-center py-32 text-gray-500 font-tech uppercase bg-black/50 border-2 border-dashed border-gray-700 rounded-xl hud-panel"><Search size={80} className="mx-auto mb-6 opacity-30 animate-pulse text-orange-500"/><p className="text-2xl tracking-widest text-shadow-glow">No se encontraron resultados en el radar.</p></div>)}
    </div>
  );
};

const ProductCard = ({ item, index, onBuy, onViewSeller }) => {
  const finalPrice = item.discountActive ? item.discountPrice : item.price;
  const rarityClass = finalPrice > 200 ? 'border-b-4 border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.2)]' : finalPrice > 100 ? 'border-b-4 border-purple-500 shadow-[0_0_30px_rgba(128,0,128,0.2)]' : 'border-b-4 border-gray-600';
  return (
    <div className={`hud-panel flex flex-col group h-full opacity-0 animate-enter ${rarityClass}`} style={{ animationDelay: `${index * 150}ms` }}>
      <div className="relative h-72 bg-black overflow-hidden clip-path-bottom-slant">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <img src={item.images?.[0]} onError={(e)=>e.target.style.display='none'} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-[1s] ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
        
        {item.discountActive && <div className="absolute top-4 right-[-20px] bg-gradient-to-r from-red-600 to-red-800 text-white font-black italic px-8 py-2 text-xl skew-x-[-20deg] shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-20 animate-pulse border-y-2 border-red-400 tracking-widest">OFERTA ACTIVA</div>}
        
        <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-black/90 backdrop-blur-xl px-4 py-2 rounded border-l-4 border-yellow-500 z-20 cursor-pointer hover:bg-gray-900 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.8)] group/seller" onClick={onViewSeller}>
           <User size={18} className="text-yellow-500 group-hover/seller:scale-125 transition-transform"/>
           <span className="text-xs font-tech text-gray-200 uppercase tracking-widest group-hover/seller:text-white font-bold">{item.adminName}</span>
        </div>
      </div>
      <div className="p-8 flex-grow flex flex-col relative bg-gradient-to-b from-transparent to-black/90">
        <h3 className="font-tech font-black text-white text-2xl leading-tight mb-4 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 transition-all uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{item.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-3 mb-8 font-mono leading-relaxed uppercase opacity-90">{item.description}</p>
        <div className="mt-auto border-t-2 border-dashed border-gray-700/80 pt-6 flex justify-between items-end">
          <div>
             {item.discountActive && <span className="text-sm text-red-500 line-through block font-mono font-bold mb-1">{formatCurrency(item.price)}</span>}
             <span className="text-5xl font-gamer text-white text-shadow-glow group-hover:scale-110 transition-transform origin-left block drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{formatCurrency(finalPrice)}</span>
          </div>
          <button onClick={onBuy} className="bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black p-4 transition-all duration-300 hover:rotate-12 hover:scale-125 shadow-[0_0_30px_rgba(255,215,0,0.8)] clip-path-polygon border-2 border-yellow-200"><ShoppingBag size={28} strokeWidth={3} /></button>
        </div>
      </div>
    </div>
  );
};

const PaymentMethodsManager = ({ user, showNotification }) => {
  const [methods, setMethods] = useState([]);
  const [newMethod, setNewMethod] = useState({ name: '', currency: 'VES', details: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods');
    const unsub = onSnapshot(q, (snap) => setMethods(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if(!newMethod.name || !newMethod.details) return showNotification("COMPLETE TODOS LOS CAMPOS", "error");
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods'), newMethod);
      setNewMethod({ name: '', currency: 'VES', details: '' });
      showNotification("MÉTODO AGREGADO", "success");
    } catch(e) { showNotification("ERROR AL GUARDAR", "error"); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if(confirm("¿ELIMINAR MÉTODO?")) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods', id));
  };

  return (
    <div className="hud-panel p-8 mt-12 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
      <h3 className="font-tech text-2xl text-cyan-400 mb-8 uppercase flex items-center gap-3 tracking-widest text-shadow-glow"><CreditCard size={32}/> Métodos de Recepción</h3>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 bg-black/60 p-6 border-2 border-gray-800 rounded">
         <div className="input-wrapper"><Banknote className="w-6 h-6"/><input placeholder="Nombre (Ej: Pago Móvil)" value={newMethod.name} onChange={e=>setNewMethod({...newMethod, name: e.target.value})} className="input-ff p-4 w-full text-lg" /></div>
         <select value={newMethod.currency} onChange={e=>setNewMethod({...newMethod, currency: e.target.value})} className="input-ff p-4 bg-black text-lg border-2 border-gray-700"><option value="VES">Bolívares (VES)</option><option value="USDT">USDT (Binance)</option><option value="USD">Zelle / USD</option></select>
         <textarea placeholder="Datos (Banco, Teléfono, CI, Email...)" value={newMethod.details} onChange={e=>setNewMethod({...newMethod, details: e.target.value})} className="input-ff p-4 md:col-span-2 h-16 pt-3 text-sm font-mono" />
         <button disabled={loading} className="btn-ff py-4 md:col-span-4 flex justify-center items-center gap-3 text-xl tracking-widest"><Plus size={24}/> AGREGAR MÉTODO A LA BÓVEDA</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {methods.map(m => (
            <div key={m.id} className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 p-6 relative group hover:border-cyan-500 transition-all hover:scale-[1.02] shadow-lg rounded">
               <button onClick={() => handleDelete(m.id)} className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-125 hover:rotate-90 bg-black/50 p-1 rounded"><X size={20}/></button>
               <h4 className="font-black text-white uppercase text-xl mb-3 flex items-center justify-between">{m.name} <span className="text-xs bg-cyan-900/40 border border-cyan-500 px-3 py-1 text-cyan-400 rounded-sm">{m.currency}</span></h4>
               <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap font-mono bg-black/50 p-3 rounded border border-gray-800">{m.details}</p>
            </div>
         ))}
      </div>
    </div>
  );
};

const SalesOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', user.uid), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => unsub();
  }, [user]);

  const updateOrderStatus = async (newStatus) => {
     if(!selectedOrder?.id) return;
     await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', selectedOrder.id), { status: newStatus });
     setSelectedOrder(prev => ({...prev, status: newStatus}));
  };

  return (
    <div className="mt-12 hud-panel p-8 shadow-[0_0_40px_rgba(0,255,0,0.1)]">
       <h3 className="font-tech text-2xl text-green-400 mb-8 uppercase flex items-center gap-3 tracking-widest text-shadow-glow"><RefreshCw size={32} className="animate-spin-slow"/> Radar de Ventas (Entrantes)</h3>
       <div className="space-y-6">
          {orders.length === 0 && <p className="text-gray-500 font-tech uppercase text-xl text-center py-10 bg-black/50 border border-dashed border-gray-700">Sin operaciones activas.</p>}
          {orders.map(order => (
             <div key={order.id} className="bg-gradient-to-r from-gray-900 to-black border-2 border-gray-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-green-500 transition-all hover:scale-[1.01] shadow-lg rounded">
                <div><p className="text-orange-500 font-bold text-sm bg-orange-900/20 inline-block px-2 py-1 mb-2 border border-orange-500/50">#{order.orderId}</p><p className="text-white font-black text-xl uppercase tracking-wider mb-1">{order.item.title}</p><p className="text-sm text-gray-400 font-mono">Cliente: {order.buyer.firstName} {order.buyer.lastName}</p></div>
                <div className="text-right flex flex-col items-end"><p className="text-yellow-500 font-gamer text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] mb-2">${order.payment.totalUSD}</p><span className={`text-xs px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-[0_0_15px_currentColor] ${order.status === 'completed' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>{order.status === 'created' ? 'NUEVA' : order.status === 'payment_reported' ? 'PAGO REPORTADO' : order.status === 'payment_confirmed' ? 'DATOS ENVIADOS' : 'COMPLETADA'}</span></div>
                <button onClick={() => setSelectedOrder(order)} className="btn-secondary-ff px-6 py-4 text-sm flex gap-3 font-bold tracking-widest border-cyan-500 bg-cyan-900/20 hover:bg-cyan-600 hover:text-white"><MessageSquare size={20}/> GESTIONAR</button>
             </div>
          ))}
       </div>
       {selectedOrder && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
             <div className="hud-panel p-8 max-w-6xl w-full h-[85vh] flex flex-col relative shadow-[0_0_80px_rgba(0,255,255,0.3)] border-cyan-600">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors hover:rotate-90 duration-300 z-50"><X size={40}/></button>
                <h3 className="text-4xl font-gamer text-white mb-8 border-b-2 border-cyan-600 pb-4 flex items-center gap-4 text-shadow-glow"><Crosshair className="text-cyan-400" size={40}/> Operación #{selectedOrder.orderId}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow overflow-hidden">
                   <div className="overflow-y-auto pr-4 space-y-6 text-base custom-scrollbar">
                      <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-2 border-orange-600/50 rounded shadow-md"><h4 className="text-orange-400 font-black mb-4 text-xl tracking-widest border-b border-orange-900 pb-2">DATOS DEL CLIENTE</h4><p className="mb-2"><span className="text-gray-400">Nombre:</span> <span className="text-white font-bold">{selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}</span></p><p className="mb-2"><span className="text-gray-400">Cédula:</span> <span className="text-white font-bold">{selectedOrder.buyer.idNumber}</span></p><p className="mb-2"><span className="text-gray-400">Whatsapp:</span> <span className="text-white font-bold">{selectedOrder.buyer.whatsapp}</span></p><p><span className="text-gray-400">Ubicación:</span> <span className="text-white font-bold">{selectedOrder.buyer.state}, {selectedOrder.buyer.country}</span></p></div>
                      <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-2 border-cyan-600/50 rounded shadow-md"><h4 className="text-cyan-400 font-black mb-4 text-xl tracking-widest border-b border-cyan-900 pb-2">DATOS FINANCIEROS</h4><p className="mb-2"><span className="text-gray-400">Monto:</span> <span className="text-yellow-500 font-gamer text-2xl">${selectedOrder.payment.totalUSD}</span></p><p className="mb-2"><span className="text-gray-400">Método:</span> <span className="text-white font-bold">{selectedOrder.payment.method} ({selectedOrder.payment.currency})</span></p>{selectedOrder.payment.currency === 'VES' && <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded"><p className="text-sm text-green-400 mb-1">Tasa: {selectedOrder.payment.rateUsed}</p><p className="text-2xl font-black text-green-400">Total VES: {formatCurrency(selectedOrder.payment.totalVES, 'VES')}</p></div>}</div>
                   </div>
                   <div className="flex flex-col h-full bg-black/50 p-2 rounded-xl border border-gray-800"><div className="bg-gradient-to-r from-green-900 to-green-800 border-b-2 border-green-500 p-3 mb-4 text-center text-sm text-white font-black tracking-[0.3em] shadow-[0_5px_15px_rgba(0,255,0,0.2)] rounded">CANAL DE TRANSMISIÓN ENCRIPTADO</div><div className="flex-grow"><ChatSystem orderId={selectedOrder.id} currentUserRole="VENDEDOR" currentUserId={user.uid} orderStatus={selectedOrder.status} onUpdateStatus={updateOrderStatus} orderData={selectedOrder}/></div></div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

const Dashboard = ({ user, userData, listings, setView, showNotification }) => {
  const myListings = listings.filter(l => l.sellerId === user.uid);
  return (
    <div className="animate-enter max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 border-b-4 border-gray-800 pb-8 bg-black/40 p-8 rounded-xl backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent pointer-events-none"></div>
        <div className="text-center md:text-left relative z-10"><h2 className="text-5xl md:text-7xl font-gamer text-white uppercase italic text-shadow-glow drop-shadow-[0_0_20px_rgba(255,69,0,0.8)] mb-2">Base de Mando</h2><p className="font-tech text-cyan-400 tracking-[0.4em] text-xl uppercase font-bold bg-cyan-900/30 inline-block px-4 py-1 border border-cyan-500/50">Comandante {userData?.adminName}</p></div>
        <button onClick={() => setView('create')} className="mt-8 md:mt-0 btn-ff px-10 py-5 flex items-center gap-4 text-2xl shadow-[0_0_40px_rgba(255,69,0,0.6)] hover:shadow-[0_0_60px_rgba(255,69,0,1)] relative z-10"><Plus size={32} className="animate-spin-slow" /> NUEVO DESPLIEGUE</button>
      </div>
      <PaymentMethodsManager user={user} showNotification={showNotification} />
      <SalesOrders user={user} />
      <div className="mt-16">
         <h3 className="font-tech text-3xl text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-4 text-shadow-glow bg-black/50 p-4 border-l-4 border-yellow-500 rounded"><Trophy className="text-yellow-500 drop-shadow-[0_0_10px_yellow]" size={36}/> Inventario Activo <span className="text-gray-500">[{myListings.length}]</span></h3>
         <div className="space-y-6">
             {myListings.map(item => (
               <div key={item.id} className="hud-panel p-6 flex flex-col md:flex-row items-center gap-8 hover:bg-gray-900/80 transition-all hover:scale-[1.01] shadow-lg">
                  <div className="w-32 h-32 bg-black border-2 border-orange-600 shrink-0 overflow-hidden relative group">
                     <div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                     <img src={item.images?.[0]} onError={(e)=>e.target.style.display='none'} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
                  </div>
                  <div className="flex-grow text-center md:text-left"><h4 className="font-black font-tech text-3xl text-white uppercase tracking-wider mb-2 drop-shadow-md">{item.title}</h4><span className="text-yellow-500 font-gamer text-4xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">{formatCurrency(item.price)}</span></div>
                  <div className="flex flex-wrap justify-center gap-4"><button onClick={() => setView(`edit-${item.id}`)} className="btn-secondary-ff px-6 py-4 flex items-center gap-3 font-bold text-lg"><Edit size={20}/> EDITAR</button><button className="px-6 py-4 bg-gradient-to-r from-red-900 to-red-950 text-red-400 border-2 border-red-600 hover:bg-red-600 hover:text-white flex items-center gap-3 font-black uppercase text-lg shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.8)] transition-all"><Trash2 size={20}/> BORRAR</button></div>
               </div>
             ))}
             {myListings.length === 0 && (
                <div className="text-center py-20 bg-black/50 border-2 border-dashed border-gray-700 rounded-xl">
                   <Gamepad2 size={64} className="mx-auto text-gray-600 mb-6 opacity-50"/>
                   <p className="text-2xl text-gray-500 font-tech uppercase tracking-widest">No hay suministros desplegados.</p>
                </div>
             )}
         </div>
      </div>
    </div>
  );
};

const LoginForm = ({ setView, showNotification }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRecover, setShowRecover] = useState(false);
  const handleSubmit = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, password); setView('dashboard'); showNotification("CREDENCIALES ACEPTADAS."); } catch (error) { showNotification(error.message, "error"); } };
  const handleRecover = async (e) => { e.preventDefault(); if(!email) return showNotification("INGRESE SU CORREO", "error"); try { await sendPasswordResetEmail(auth, email); showNotification("ENLACE ENVIADO AL CORREO", "success"); setShowRecover(false); } catch (error) { showNotification(error.message, "error"); } };

  return (
    <div className="max-w-md mx-auto mt-20 relative animate-enter">
      {/* Decoración flotante extrema para el login */}
      <div className="absolute -left-64 top-[-50px] hidden xl:block animate-floatExtreme pointer-events-none z-[-1]">
         <img src="https://i.pinimg.com/originals/db/db/1d/dbdb1d0e82c286dc5eebc3f191b4cb3f.png" onError={(e)=>e.target.style.display='none'} alt="decor" className="h-[500px] opacity-70 drop-shadow-[0_0_50px_rgba(255,69,0,0.8)] mix-blend-screen" />
      </div>

      <div className="absolute -inset-2 bg-gradient-to-r from-orange-600 via-yellow-500 to-red-600 rounded-xl blur-xl opacity-60 animate-pulse"></div>
      
      <div className="hud-panel p-10 md:p-14 relative z-10 bg-black/95 shadow-[0_0_80px_rgba(255,69,0,0.8)] border-2 border-orange-500">
        {showRecover ? (
          <div className="animate-enter"><h3 className="text-3xl font-gamer text-white uppercase text-center mb-8 text-shadow-glow">Recuperar Acceso</h3><form onSubmit={handleRecover} className="space-y-8"><div className="input-wrapper"><Mail className="w-6 h-6"/><input type="email" required className="input-ff w-full p-5 text-lg" placeholder="CORREO REGISTRADO" value={email} onChange={(e) => setEmail(e.target.value)} /></div><div className="flex gap-4"><button type="button" onClick={() => setShowRecover(false)} className="flex-1 btn-secondary-ff py-4 text-lg font-bold">CANCELAR</button><button type="submit" className="flex-1 btn-ff py-4 text-lg shadow-[0_0_20px_rgba(255,69,0,0.5)]">ENVIAR</button></div></form></div>
        ) : (
          <div className="animate-enter">
             <div className="text-center mb-12 relative group">
                <div className="absolute inset-0 bg-orange-600 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity rounded-full"></div>
                <div className="w-28 h-28 mx-auto bg-black border-4 border-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,69,0,0.8)] relative z-10 transform group-hover:rotate-12 transition-transform duration-500"><Lock size={48} className="text-orange-500 drop-shadow-[0_0_10px_orange]" /></div>
                <h2 className="text-5xl font-gamer text-white uppercase italic drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] text-shadow-glow relative z-10">Acceso Oficial</h2>
             </div>
             
             <form onSubmit={handleSubmit} className="space-y-10">
                <div className="group">
                   <label className="block text-sm font-black text-cyan-400 mb-3 font-tech uppercase tracking-[0.2em] drop-shadow-md">Identificador de Agente</label>
                   <div className="input-wrapper"><Mail className="w-6 h-6"/><input type="email" required className="input-ff w-full p-5 text-xl tracking-wider" placeholder="AGENTE@TECNOBYTE.COM" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="group">
                   <label className="block text-sm font-black text-cyan-400 mb-3 font-tech uppercase tracking-[0.2em] drop-shadow-md">Código de Seguridad</label>
                   <div className="input-wrapper"><Key className="w-6 h-6"/><input type="password" required className="input-ff w-full p-5 text-xl tracking-[0.3em]" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                   <div className="text-right mt-3"><button type="button" onClick={() => setShowRecover(true)} className="text-xs text-yellow-500 hover:text-white uppercase font-black tracking-widest transition-colors hover:underline">¿Olvidó su contraseña?</button></div>
                </div>
                <button type="submit" className="w-full btn-ff py-6 text-3xl mt-10 shadow-[0_10px_40px_rgba(255,0,0,0.6)] hover:shadow-[0_15px_50px_rgba(255,0,0,0.9)] tracking-widest relative overflow-hidden">
                   <span className="relative z-10 flex items-center justify-center gap-3"><Zap className="animate-pulse"/> AUTENTICAR</span>
                </button>
             </form>
             
             <div className="mt-10 text-center border-t-2 border-gray-800 pt-8 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                <button onClick={() => setView('register')} className="text-gray-400 hover:text-yellow-400 text-sm font-tech uppercase tracking-[0.3em] font-bold transition-all hover:scale-110 drop-shadow-md">&gt;&gt; Solicitar Permisos de Venta</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RegisterForm = ({ setView, showNotification }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', whatsapp: '', idNumber: '', publicUsername: '', adminName: '', rif: '', password: '', confirmPassword: '' });
  const [kycData, setKycData] = useState({ selfie: null, docFront: null });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [passStrength, setPassStrength] = useState({ length: false, upper: false, lower: false, num: false, special: false });
  const [liveness, setLiveness] = useState(false);

  const checkPass = (val) => { setPassStrength({ length: val.length >= 8, upper: /[A-Z]/.test(val), lower: /[a-z]/.test(val), num: /\d/.test(val), special: /[!@#$%^&*(),.?":{}|<>]/.test(val) }); };
  const handleChange = (e) => { setFormData({...formData, [e.target.name]: e.target.value}); if (e.target.name === 'password') checkPass(e.target.value); };
  const handleKyc = async (field, file) => { if(file) { const comp = await compressImage(file); setKycData(prev => ({...prev, [field]: comp})); showNotification("IMAGEN PROCESADA", "success"); } };
  const handleNextStep = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.whatsapp || !formData.idNumber || !formData.password || !formData.confirmPassword) return showNotification("TODOS LOS CAMPOS MARCADOS CON * SON OBLIGATORIOS", "error");
    if (formData.password !== formData.confirmPassword) return showNotification("LAS CONTRASEÑAS NO COINCIDEN", "error");
    if (!Object.values(passStrength).every(Boolean)) return showNotification("LA CONTRASEÑA ES DÉBIL", "error");
    setStep(2);
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.publicUsername || !formData.adminName) return showNotification("CAMPOS OBLIGATORIOS FALTANTES", "error");
    if (!kycData.selfie || !kycData.docFront) return showNotification("FALTA EVIDENCIA BIOMÉTRICA", "error");
    if(!liveness) return showNotification("CONFIRME PRUEBA DE VIDA", "error");
    setLoading(true);
    try {
      const userIP = await getIP();
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'data'), { ...formData, kycData, ip: userIP, role: 'seller', createdAt: new Date().toISOString() });
      showNotification("REGISTRO COMPLETADO", "success"); setView('dashboard');
    } catch (e) { showNotification(e.message, "error"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto mt-16 relative animate-enter">
      
      {/* Decoración lateral en Registro */}
      <div className="absolute -right-64 top-0 hidden xl:block animate-floatExtreme pointer-events-none z-[-1]" style={{ animationDirection: 'reverse' }}>
         <img src="https://i.pinimg.com/originals/ce/c4/85/cec485125eaaf9cceaf96ee6bda02e60.png" onError={(e)=>e.target.style.display='none'} alt="decor right" className="h-[600px] opacity-60 drop-shadow-[0_0_50px_rgba(255,69,0,0.8)]" />
      </div>

      <div className="hud-panel p-10 md:p-14 shadow-[0_0_100px_rgba(255,69,0,0.3)] border-2 border-orange-500 bg-black/95">
      <h2 className="text-5xl font-gamer text-white mb-12 text-center flex items-center justify-center gap-5 text-shadow-glow"><Shield className="text-orange-500 drop-shadow-[0_0_15px_orange]" size={56}/> RECLUTAMIENTO DE ELITE</h2>
      <form onSubmit={handleRegister}>
        {step === 1 && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-enter">
              <div className="input-wrapper"><User className="w-6 h-6"/><input name="firstName" placeholder="Nombre *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><User className="w-6 h-6"/><input name="lastName" placeholder="Apellido *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><Mail className="w-6 h-6"/><input name="email" placeholder="Email *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><Smartphone className="w-6 h-6"/><input name="whatsapp" placeholder="Whatsapp *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><IdCard className="w-6 h-6"/><input name="idNumber" placeholder="DNI / Cédula *" className="input-ff p-5 w-full text-lg" onChange={handleChange} /></div>
              <div className="input-wrapper"><FileText className="w-6 h-6"/><input name="rif" placeholder="RIF (Opcional)" className="input-ff p-5 border-green-900/50 focus:border-green-500 w-full text-lg" onChange={handleChange} /></div>
              
              <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-black p-8 border-2 border-gray-800 rounded mt-4 shadow-inner">
                 <p className="text-sm text-cyan-400 mb-6 font-black tracking-[0.2em] uppercase border-b border-cyan-900 pb-2"><Lock className="inline mr-2 mb-1"/> SEGURIDAD DE ACCESO MAESTRA</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="input-wrapper"><Key className="w-6 h-6"/><input name="password" type="password" placeholder="Contraseña Maestra *" className="input-ff p-5 w-full text-lg tracking-[0.2em]" onChange={handleChange} /></div>
                    <div className="input-wrapper"><Key className="w-6 h-6"/><input name="confirmPassword" type="password" placeholder="Repetir Contraseña *" className="input-ff p-5 w-full text-lg tracking-[0.2em]" onChange={handleChange} /></div>
                 </div>
                 <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-500 uppercase font-bold tracking-widest bg-black/50 p-4 rounded border border-gray-800">
                    <span className={`flex items-center gap-1 ${passStrength.length ? "text-green-500 drop-shadow-[0_0_5px_green]" : ""}`}>{passStrength.length && <CheckCircle size={12}/>} 8+ Caracteres</span>
                    <span className={`flex items-center gap-1 ${passStrength.upper ? "text-green-500 drop-shadow-[0_0_5px_green]" : ""}`}>{passStrength.upper && <CheckCircle size={12}/>} Mayúscula</span>
                    <span className={`flex items-center gap-1 ${passStrength.num ? "text-green-500 drop-shadow-[0_0_5px_green]" : ""}`}>{passStrength.num && <CheckCircle size={12}/>} Número</span>
                    <span className={`flex items-center gap-1 ${passStrength.special ? "text-green-500 drop-shadow-[0_0_5px_green]" : ""}`}>{passStrength.special && <CheckCircle size={12}/>} Símbolo</span>
                 </div>
              </div>
              <button type="button" onClick={handleNextStep} className="btn-ff py-6 md:col-span-2 text-2xl font-black tracking-[0.2em] mt-4 shadow-[0_0_40px_rgba(255,69,0,0.5)] flex justify-center items-center gap-3">SIGUIENTE FASE DE VERIFICACIÓN <Zap/></button>
           </div>
        )}
        {step === 2 && (
           <div className="space-y-8 animate-enter">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gradient-to-b from-gray-900 to-black p-10 border-2 border-gray-800 text-center relative group hover:border-orange-500 transition-colors rounded-lg shadow-lg">
                    <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                    <ScanFace size={64} className="mx-auto mb-6 text-gray-600 group-hover:text-orange-500 transition-colors drop-shadow-[0_0_10px_rgba(255,69,0,0)] group-hover:drop-shadow-[0_0_20px_rgba(255,69,0,0.8)]"/>
                    <p className="text-lg font-black mb-4 uppercase tracking-[0.2em] text-white">FOTOGRAFÍA EN VIVO *</p>
                    <label className="text-sm btn-secondary-ff p-4 cursor-pointer block font-bold tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-400">
                       {kycData.selfie ? "REEMPLAZAR CAPTURA" : "ACTIVAR CÁMARA FRONTAL"} 
                       <input type="file" hidden accept="image/*" capture="user" onChange={e => handleKyc('selfie', e.target.files[0])}/>
                    </label>
                 </div>
                 <div className="bg-gradient-to-b from-gray-900 to-black p-10 border-2 border-gray-800 text-center relative group hover:border-cyan-500 transition-colors rounded-lg shadow-lg">
                    <div className="absolute inset-0 bg-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                    <FileText size={64} className="mx-auto mb-6 text-gray-600 group-hover:text-cyan-500 transition-colors drop-shadow-[0_0_10px_rgba(0,255,255,0)] group-hover:drop-shadow-[0_0_20px_rgba(0,255,255,0.8)]"/>
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
                 <span className="font-bold tracking-wide uppercase group-hover:text-white">Confirmo que soy una persona real, operando bajo los términos del mercado. (Prueba de Vida requerida por TecnoByte LLC)</span>
              </label>
              
              <div className="flex gap-6 mt-8">
                 <button type="button" onClick={() => setStep(1)} className="flex-[1] btn-secondary-ff py-5 font-bold text-xl tracking-widest">&lt;&lt; ATRÁS</button>
                 <button disabled={loading} className="flex-[2] btn-ff py-5 text-2xl shadow-[0_0_50px_rgba(255,69,0,0.8)] animate-pulse font-black tracking-[0.2em]">{loading ? "ENCRIPTANDO DATOS..." : "FINALIZAR REGISTRO"}</button>
              </div>
           </div>
        )}
      </form>
      </div>
    </div>
  );
};

const ListingForm = ({ user, userData, setView, showNotification, mode = 'create', editId = null, listings = [] }) => {
  const [data, setData] = useState({ title: '', price: '', description: '', images: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && editId) {
      const item = listings.find(l => l.id === editId);
      if (item) setData({ title: item.title, price: item.price, description: item.description, images: item.images || [] });
    }
  }, [mode, editId, listings]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = await Promise.all(files.map(f => compressImage(f)));
    setData(prev => ({...prev, images: [...prev.images, ...newImages]}));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if(data.images.length === 0) return showNotification("SE REQUIERE AL MENOS UNA IMAGEN COMO EVIDENCIA", "error");
    setLoading(true);
    try {
       const payload = { ...data, price: Number(data.price), sellerId: user.uid, adminName: userData.adminName, sellerUsername: userData.publicUsername, updatedAt: serverTimestamp() };
       if(mode === 'create') {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), { ...payload, createdAt: serverTimestamp() });
       } else {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', editId), payload);
       }
       showNotification("ARSENAL PUBLICADO CON ÉXITO", "success"); setView('dashboard');
    } catch(e) { showNotification("ERROR DE TRANSMISIÓN: " + e.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto hud-panel p-10 md:p-14 mt-12 animate-enter shadow-[0_0_80px_rgba(255,69,0,0.5)] border-2 border-orange-500 bg-black/90 backdrop-blur-xl">
       <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b-2 border-orange-600 pb-6">
          <h2 className="text-4xl md:text-5xl font-gamer text-white uppercase italic text-shadow-glow flex items-center gap-4"><Flame size={48} className="text-orange-500 animate-pulse"/> {mode === 'create' ? 'Inicializando Despliegue' : 'Modificando Activo'}</h2>
          <button onClick={() => setView('dashboard')} className="mt-6 md:mt-0 text-gray-400 hover:text-red-500 transition-all hover:rotate-90 hover:scale-125 duration-300 bg-black/50 p-2 rounded-full border border-gray-700 hover:border-red-500"><X size={36} /></button>
       </div>
       
       <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2">
                <label className="block text-cyan-400 font-bold mb-2 uppercase tracking-widest text-sm">Título del Suministro</label>
                <input placeholder="Ej: Cuenta Sakura Veterana Pase 1" className="input-ff w-full p-5 text-2xl" value={data.title} onChange={e => setData({...data, title: e.target.value})} required />
             </div>
             <div>
                <label className="block text-yellow-500 font-bold mb-2 uppercase tracking-widest text-sm">Valor de Intercambio (USD)</label>
                <input type="number" placeholder="Ej: 150" className="input-ff w-full p-5 text-yellow-500 font-gamer text-3xl shadow-[inset_0_0_15px_rgba(255,215,0,0.2)] border-yellow-600/50" value={data.price} onChange={e => setData({...data, price: e.target.value})} required />
             </div>
          </div>
          
          <div>
             <label className="block text-cyan-400 font-bold mb-2 uppercase tracking-widest text-sm">Informe Detallado de Combate</label>
             <textarea placeholder="Especificar armas evolutivas, pases élite antiguos, nivel, rango actual, trajes exclusivos..." className="input-ff w-full p-5 h-48 text-lg font-mono leading-relaxed" value={data.description} onChange={e => setData({...data, description: e.target.value})} required />
          </div>
          
          <div className="border-4 border-dashed border-gray-700 bg-black/50 p-10 text-center hover:border-orange-500 hover:bg-orange-900/10 transition-all group rounded-xl shadow-inner cursor-pointer relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
             <Camera size={64} className="mx-auto mb-4 text-gray-600 group-hover:text-orange-500 transition-colors drop-shadow-md group-hover:drop-shadow-[0_0_15px_orange] group-hover:scale-110 duration-300"/>
             <label className="cursor-pointer text-lg font-black uppercase tracking-widest text-gray-400 group-hover:text-white relative z-10 w-full block">
                [ + Click Para Anexar Capturas de Evidencia + ] 
                <input type="file" hidden multiple accept="image/*" onChange={handleFileChange}/>
             </label>
             <p className="text-xs text-orange-500 font-tech mt-3 tracking-[0.2em] relative z-10">La primera imagen será la portada del artículo.</p>
             
             {data.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-8 justify-center relative z-10 bg-black/80 p-6 rounded border border-gray-800">
                   {data.images.map((img, i) => (
                      <div key={i} className="relative group/img">
                         <img src={img} onError={(e)=>e.target.style.display='none'} className="w-24 h-24 object-cover border-2 border-orange-500 rounded shadow-[0_0_15px_rgba(255,69,0,0.5)] group-hover/img:scale-150 transition-transform duration-300 z-10 relative"/>
                         {i === 0 && <span className="absolute -top-3 -left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded border border-white z-20 uppercase">Portada</span>}
                      </div>
                   ))}
                </div>
             )}
          </div>
          
          <button disabled={loading} className="w-full btn-ff py-6 text-3xl shadow-[0_0_60px_rgba(255,69,0,0.6)] hover:shadow-[0_0_80px_rgba(255,69,0,1)] tracking-[0.2em] relative overflow-hidden mt-8">
             <span className="relative z-10 flex items-center justify-center gap-4">{loading ? <><RefreshCw className="animate-spin"/> TRANSMITIENDO DATOS...</> : <><Upload className="animate-bounce"/> PUBLICAR ARSENAL AHORA</>}</span>
          </button>
       </form>
    </div>
  );
};

// --- Footer (CON LOGO LOCAL RESTAURADO) ---
const Footer = () => (
  <footer className="bg-black pt-24 pb-12 border-t-4 border-red-900 mt-32 text-center relative z-20 shadow-[0_-20px_50px_rgba(255,0,0,0.2)]">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-60"></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_20px_orange]"></div>
    
    <div className="flex flex-col items-center justify-center gap-6 mb-10 opacity-90 relative z-10">
      {/* LOGO LOCAL RESTAURADO */}
      <img src="/nexus-station-logo.png" alt="NEXUS STATION" className="h-32 object-contain logo-hyper-anim drop-shadow-[0_0_30px_rgba(255,69,0,0.5)]" />
      <div className="flex gap-6 mt-4">
         <div className="bg-gray-900/80 p-3 rounded-full border border-gray-700 hover:border-orange-500 transition-colors cursor-pointer text-gray-400 hover:text-orange-500"><Gamepad2 size={24}/></div>
         <div className="bg-gray-900/80 p-3 rounded-full border border-gray-700 hover:border-cyan-500 transition-colors cursor-pointer text-gray-400 hover:text-cyan-500"><Shield size={24}/></div>
         <div className="bg-gray-900/80 p-3 rounded-full border border-gray-700 hover:border-yellow-500 transition-colors cursor-pointer text-gray-400 hover:text-yellow-500"><Trophy size={24}/></div>
      </div>
    </div>
    
    <p className="text-gray-400 font-tech text-sm relative z-10 tracking-[0.3em] font-bold uppercase drop-shadow-md mb-2">© 2026 NEXUS STATION</p>
    <p className="text-orange-600 font-tech text-xs relative z-10 tracking-[0.2em] font-bold uppercase drop-shadow-md">DESARROLLADO POR TECNOBYTE LLC. TODOS LOS DERECHOS RESERVADOS.</p>
  </footer>
);
