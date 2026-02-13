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

// --- 1. CONFIGURACIÓN FIREBASE REAL ---
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

// --- 2. UTILIDADES Y MOTORES ---

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

// --- 3. ESTILOS CSS MASTER (VISUAL ARMAGEDDON) ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;700&display=swap');

    :root {
      --ff-yellow: #FFD700;
      --ff-orange: #FF4500;
      --ff-red: #8B0000;
      --ff-dark: #050505;
      --ff-panel: rgba(15, 15, 20, 0.90);
      --ff-cyan: #00FFFF;
    }

    body { background-color: var(--ff-dark); color: white; font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }

    /* --- ANIMACIONES BÁSICAS --- */
    @keyframes slideInUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes pulseGlow { 
      0%, 100% { box-shadow: 0 0 15px rgba(255, 69, 0, 0.1); border-color: rgba(255, 255, 255, 0.1); }
      50% { box-shadow: 0 0 25px rgba(255, 69, 0, 0.6); border-color: rgba(255, 69, 0, 0.8); }
    }
    @keyframes floatChar { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.02); } }
    
    .animate-enter { animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
    .font-gamer { font-family: 'Black Ops One', cursive; }
    .font-tech { font-family: 'Orbitron', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF4500; border-radius: 3px; }

    /* --- LOGO ULTRA ANIMADO --- */
    @keyframes logo-glitch-skew {
      0% { transform: skew(0deg); }
      20% { transform: skew(-2deg); }
      40% { transform: skew(2deg); }
      60% { transform: skew(-1deg); }
      80% { transform: skew(1deg); }
      100% { transform: skew(0deg); }
    }
    @keyframes logo-flash {
      0%, 100% { opacity: 1; filter: brightness(1) drop-shadow(0 0 5px cyan); }
      50% { opacity: 0.8; filter: brightness(1.5) drop-shadow(0 0 20px cyan); }
      52% { opacity: 0.4; filter: brightness(2) drop-shadow(0 0 30px white); }
      54% { opacity: 1; filter: brightness(1) drop-shadow(0 0 5px cyan); }
    }
    
    .logo-ultra-anim {
      animation: 
        logo-glitch-skew 3s infinite linear alternate-reverse,
        logo-flash 2s infinite steps(10),
        floatChar 4s infinite ease-in-out;
      filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.8));
    }

    /* --- METEORITOS --- */
    @keyframes meteor-fall {
      0% { transform: translateX(300px) translateY(-300px); opacity: 1; }
      70% { opacity: 1; }
      100% { transform: translateX(-500px) translateY(500px); opacity: 0; }
    }
    .meteor {
      position: absolute;
      width: 100px; height: 2px;
      background: linear-gradient(to left, #ff4500, transparent);
      transform: rotate(-45deg);
      box-shadow: 0 0 20px #ff0000;
      opacity: 0;
    }

    /* --- FUEGO & CENIZAS --- */
    .ember {
      position: absolute; width: 4px; height: 4px; background: #FF4500;
      box-shadow: 0 0 10px #FFD700; border-radius: 50%;
    }
    @keyframes emberRise { 
      0% { transform: translateY(110vh) scale(0.5); opacity: 0; } 
      20% { opacity: 1; transform: translateY(80vh) scale(1); }
      100% { transform: translateY(-10vh) translateX(50px) scale(0.2); opacity: 0; } 
    }

    /* HUD PANELS */
    .hud-panel {
      background: var(--ff-panel);
      border: 1px solid rgba(255, 69, 0, 0.4);
      position: relative;
      clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
      backdrop-filter: blur(15px);
      box-shadow: 0 0 30px rgba(0,0,0,0.7);
      transition: all 0.3s;
    }
    .hud-panel:hover { border-color: var(--ff-yellow); box-shadow: 0 0 50px rgba(255, 69, 0, 0.4); transform: scale(1.01); }

    /* INPUTS HUD */
    .input-wrapper { position: relative; transition: all 0.3s; }
    .input-wrapper svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #666; transition: all 0.3s; z-index: 10; }
    .input-wrapper:focus-within svg { color: var(--ff-yellow); filter: drop-shadow(0 0 5px var(--ff-yellow)); }
    
    .input-ff {
      background: rgba(0, 0, 0, 0.8); border: 1px solid #333; border-radius: 4px;
      color: white; font-family: 'Rajdhani', sans-serif; font-weight: 700; 
      padding-left: 3rem !important; transition: all 0.3s;
    }
    .input-ff:focus { 
       border-color: var(--ff-yellow); outline: none; background: rgba(255, 69, 0, 0.1); 
       box-shadow: 0 0 20px rgba(255, 69, 0, 0.2); 
    }

    /* BOTONES */
    .btn-ff {
      background: linear-gradient(90deg, #FF4500 0%, #FF0000 100%);
      color: white; font-family: 'Black Ops One', cursive; text-transform: uppercase;
      border: none; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
      transition: all 0.2s; position: relative; overflow: hidden; cursor: pointer; text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
    }
    .btn-ff:hover { transform: scale(1.05); box-shadow: 0 0 30px var(--ff-orange); filter: brightness(1.2); }
    .btn-ff:active { transform: scale(0.95); }
    
    .btn-secondary-ff {
      background: rgba(0,0,0,0.8); border: 1px solid var(--ff-cyan); color: var(--ff-cyan);
      font-family: 'Orbitron', sans-serif; text-transform: uppercase;
      clip-path: polygon(0 0, 90% 0, 100% 30%, 100% 100%, 10% 100%, 0 70%);
      transition: all 0.2s; cursor: pointer;
    }
    .btn-secondary-ff:hover { background: rgba(0, 255, 255, 0.2); box-shadow: 0 0 20px var(--ff-cyan); text-shadow: 0 0 10px var(--ff-cyan); }

    /* TEXT GLITCH */
    .glitch { position: relative; display: inline-block; }
    .glitch::before, .glitch::after { content: attr(data-text); position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #0a0a0a; }
    .glitch::before { left: 2px; text-shadow: -2px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 2s infinite linear alternate-reverse; }
    .glitch::after { left: -2px; text-shadow: -2px 0 #00fff9; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim2 2s infinite linear alternate-reverse; }
    @keyframes glitch-anim { 0% { clip: rect(10px, 9999px, 30px, 0); transform: skew(0.8deg); } 100% { clip: rect(50px, 9999px, 90px, 0); transform: skew(0); } }
    @keyframes glitch-anim2 { 0% { clip: rect(80px, 9999px, 100px, 0); transform: skew(-0.8deg); } 100% { clip: rect(80px, 9999px, 100px, 0); transform: skew(0); } }

    /* FIRE FLAMES */
    .fire-base { position: fixed; bottom: 0; left: 0; right: 0; height: 250px; background: linear-gradient(to top, rgba(255,69,0,0.5), transparent); filter: blur(5px); z-index: -5; pointer-events: none; }
    .fire-flame { position: absolute; bottom: -80px; width: 100%; height: 100%; background: url('https://raw.githubusercontent.com/s1mpson/css-fire/master/img/fire.png') repeat-x; background-size: 100% 100%; mix-blend-mode: screen; opacity: 0.9; animation: fireFlicker 3s infinite alternate; }
    @keyframes fireFlicker { 0%, 100% { transform: scaleY(1); opacity: 0.8; } 50% { transform: scaleY(0.9) skewX(-2deg); opacity: 0.7; } }

    /* CHAT BUBBLES */
    .chat-bubble-me { background: rgba(255, 69, 0, 0.2); border: 1px solid var(--ff-orange); border-radius: 12px 12px 0 12px; margin-left: auto; }
    .chat-bubble-other { background: rgba(0, 255, 255, 0.1); border: 1px solid var(--ff-cyan); border-radius: 12px 12px 12px 0; margin-right: auto; }

    /* PRINT */
    @media print { body * { visibility: hidden; } #invoice-container, #invoice-container * { visibility: visible; } #invoice-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; background: white; color: black; } .no-print { display: none; } .hud-panel { background: white; border: 1px solid black; clip-path: none; } }
  `}</style>
);

const MeteorShower = () => (
  <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="meteor" style={{
        position: 'absolute', width: '100px', height: '2px', background: 'linear-gradient(to left, #ff4500, transparent)',
        transform: 'rotate(-45deg)', boxShadow: '0 0 20px #ff0000', opacity: 0,
        top: Math.random() * 50 + '%', left: Math.random() * 100 + '%',
        animation: `meteor-fall ${Math.random() * 2 + 2}s infinite ${Math.random() * 5}s`
      }}></div>
    ))}
    <style>{`@keyframes meteor-fall { 0% { transform: translateX(300px) translateY(-300px); opacity: 1; } 70% { opacity: 1; } 100% { transform: translateX(-500px) translateY(500px); opacity: 0; } }`}</style>
  </div>
);

const AshRain = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(250)].map((_, i) => (
      <div key={i} className="ember" style={{
        position: 'absolute', width: Math.random()*3+1+'px', height: Math.random()*3+1+'px', 
        left: Math.random()*100+'%', bottom: '-20px', background: '#FF4500', borderRadius: '50%', boxShadow: '0 0 10px #FF4500',
        animation: `emberRise ${Math.random()*4+2}s linear infinite`, animationDelay: Math.random()*5+'s', opacity: Math.random()*0.9+0.1
      }}></div>
    ))}
    <style>{`@keyframes emberRise { 0% { transform: translateY(100vh) scale(1); opacity: 1; } 100% { transform: translateY(-100vh) translateX(${Math.random()*100-50}px) scale(0.5); opacity: 0; } }`}</style>
  </div>
);

const CharacterDecor = () => (
  <div className="fixed inset-0 pointer-events-none z-[-3] overflow-hidden max-w-[1920px] mx-auto">
    <img src="https://freepngimg.com/thumb/free_fire/165975-fire-character-free-download-png-hd.png" className="absolute bottom-0 left-[-50px] md:left-0 h-[40vh] md:h-[70vh] opacity-40 object-cover mix-blend-screen drop-shadow-[0_0_30px_rgba(255,140,0,0.6)]" style={{ animation: 'floatChar 6s ease-in-out infinite' }} />
    <img src="https://freepngimg.com/thumb/free_fire/165977-fire-character-free-download-png-hq.png" className="absolute bottom-0 right-[-50px] md:right-0 h-[45vh] md:h-[75vh] opacity-40 object-cover mix-blend-screen drop-shadow-[0_0_30px_rgba(255,69,0,0.6)]" style={{ animation: 'floatChar 7s ease-in-out infinite reverse' }} />
  </div>
);

const FireEffect = () => (
  <div className="fixed bottom-0 left-0 w-full h-screen pointer-events-none z-[-5] overflow-hidden">
    <div className="fire-base"></div>
    <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-orange-600/40 to-transparent blur-xl animate-pulse"></div>
    <div className="fire-flame"></div>
  </div>
);

const CyberVideoBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden bg-black">
     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
     <div className="cyber-grid" style={{
        position: 'absolute', width: '200%', height: '200%', left: '-50%', top: '-50%',
        backgroundImage: 'linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '100px 100px', transform: 'perspective(500px) rotateX(60deg)', animation: 'grid-move 5s linear infinite'
     }}></div>
     <style>{`@keyframes grid-move { 0% { transform: perspective(500px) rotateX(60deg) translateY(0); } 100% { transform: perspective(500px) rotateX(60deg) translateY(100px); } }`}</style>
     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-900/20"></div>
  </div>
);

// --- 4. SISTEMA DE CHAT P2P ---
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
    <div className="flex flex-col h-[500px] border border-gray-700 bg-black/80 rounded-lg overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="bg-gray-900 p-3 border-b border-gray-700 flex justify-between items-center">
        <span className="text-cyan-400 font-bold flex items-center gap-2"><MessageSquare size={16}/> CANAL SEGURO P2P</span>
        <div className="flex items-center gap-2">
           <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${orderStatus === 'completed' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
              ESTADO: {orderStatus === 'created' ? 'ESPERANDO PAGO' : orderStatus === 'payment_reported' ? 'CONFIRMANDO' : orderStatus === 'payment_confirmed' ? 'ENTREGANDO' : 'FINALIZADO'}
           </span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.role === currentUserRole;
          return (
            <div key={msg.id} className={`flex flex-col max-w-[85%] ${isMe ? 'items-end ml-auto' : 'items-start mr-auto'}`}>
              {msg.type === 'system' ? (
                 <div className="w-full text-center my-2"><span className="text-[10px] bg-gray-800 text-gray-400 px-3 py-1 rounded-full uppercase border border-gray-700">{msg.text}</span></div>
              ) : (
                <div className={`p-3 text-sm ${isMe ? 'chat-bubble-me text-white' : 'chat-bubble-other text-gray-200'}`}>
                  {msg.imageUrl && <img src={msg.imageUrl} className="w-40 rounded mb-2 border border-gray-600 cursor-pointer hover:scale-150 transition-transform" />}
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-900 border-t border-gray-700 p-2">
         {currentUserRole === 'COMPRADOR' && orderStatus === 'created' && (
            <label className="btn-ff w-full py-3 flex items-center justify-center gap-2 cursor-pointer">
               {isUploading ? "SUBIENDO..." : <><ImageIcon size={18}/> REPORTAR PAGO (FOTO)</>}
               <input type="file" hidden accept="image/*" onChange={handleReportPayment} disabled={isUploading}/>
            </label>
         )}
         {currentUserRole === 'VENDEDOR' && orderStatus === 'payment_reported' && (
            <button onClick={handleConfirmPayment} className="btn-ff w-full py-3 flex items-center justify-center gap-2 bg-green-600">
               <CheckCircle size={18}/> CONFIRMAR PAGO & ENVIAR DATOS
            </button>
         )}
         {currentUserRole === 'COMPRADOR' && orderStatus === 'payment_confirmed' && (
            <button onClick={handleFinalizeOrder} className="btn-ff w-full py-3 flex items-center justify-center gap-2 bg-blue-600">
               <CheckSquare size={18}/> CUENTA VERIFICADA - FINALIZAR
            </button>
         )}
         {orderStatus === 'completed' && (
            <div className="text-center text-green-500 font-bold uppercase p-2 border border-green-500/30 bg-green-900/20">
               ORDEN COMPLETADA EXITOSAMENTE
            </div>
         )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(newMessage); }} className="p-3 bg-black flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escriba un mensaje..." 
          className="flex-grow bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-orange-500 outline-none"
          disabled={orderStatus === 'completed'}
        />
        <button type="submit" disabled={orderStatus === 'completed'} className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded"><Send size={18}/></button>
      </form>
    </div>
  );
};

// --- 5. PERFIL PUBLICO ---
const SellerProfileView = ({ sellerId, onClose, onBuy }) => {
  const [profile, setProfile] = useState(null);
  const [salesCount, setSalesCount] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [sellerListings, setSellerListings] = useState([]);

  useEffect(() => {
    const load = async () => {
      // Perfil
      const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', sellerId, 'profile', 'data'));
      if (docSnap.exists()) setProfile(docSnap.data());
      
      // Ventas
      const qOrders = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), where('seller.id', '==', sellerId), where('status', '==', 'completed'));
      const salesSnap = await getDocs(qOrders);
      setSalesCount(salesSnap.size);

      // Arsenal
      const qListings = query(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), where('sellerId', '==', sellerId));
      const listingsSnap = await getDocs(qListings);
      setSellerListings(listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Ratings
      const qRatings = query(collection(db, 'artifacts', appId, 'users', sellerId, 'ratings'), orderBy('createdAt', 'desc'));
      const ratingsSnap = await getDocs(qRatings);
      setRatings(ratingsSnap.docs.map(d => d.data()));
    };
    load();
  }, [sellerId]);

  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 overflow-auto backdrop-blur-sm">
       <div className="hud-panel p-8 max-w-5xl w-full relative animate-enter max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-red-500 z-50"><X size={32}/></button>
          <div className="hud-corner-decoration"></div>
          
          <div className="flex flex-col md:flex-row gap-8">
             {/* INFO PERFIL */}
             <div className="w-full md:w-1/3">
                <div className="flex flex-col items-center text-center mb-8">
                   <div className="w-32 h-32 rounded-full border-4 border-orange-500 overflow-hidden mb-4 bg-black shadow-[0_0_30px_rgba(255,69,0,0.5)]">
                      {profile.kycData?.selfie ? <img src={profile.kycData.selfie} className="w-full h-full object-cover"/> : <User size={64} className="text-gray-500 m-auto mt-8"/>}
                   </div>
                   
                   <div className="flex items-center gap-2 justify-center flex-wrap">
                      <h2 className="text-3xl font-gamer text-white uppercase glitch" data-text={profile.publicUsername}>{profile.publicUsername}</h2>
                      {/* BADGE DE 1000 VENTAS */}
                      {salesCount >= 1000 && (
                         <div className="relative group">
                            <div className="bg-blue-500/10 border border-blue-500 rounded-full p-1 shadow-[0_0_10px_rgba(0,0,255,0.5)] cursor-help animate-pulse">
                               <CheckCircle size={18} className="text-blue-400" strokeWidth={3} />
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black border border-blue-500 text-blue-400 text-xs p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none font-tech uppercase text-center">
                               <p className="font-bold">Usuario, confiable y verificado.</p>
                               <p className="text-[9px] text-gray-400 mt-1">Por TecnoByte LLC.</p>
                            </div>
                         </div>
                      )}
                   </div>
                   <span className="text-cyan-400 font-tech tracking-widest text-sm uppercase flex items-center gap-1 mt-2"><Shield size={14}/> Comandante Verificado</span>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="bg-black/40 p-4 border border-gray-700 text-center hover:border-yellow-500 transition-colors">
                      <p className="text-xs text-gray-500 uppercase">Ventas Completadas</p>
                      <p className="text-4xl font-gamer text-yellow-500">{salesCount}</p>
                   </div>
                   <div className="bg-black/40 p-4 border border-gray-700 text-center hover:border-green-500 transition-colors">
                      <p className="text-xs text-gray-500 uppercase">Reputación</p>
                      <div className="flex justify-center text-green-500 mt-2"><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/><Star fill="currentColor"/></div>
                   </div>
                </div>

                <div className="space-y-2 text-sm text-gray-300 font-mono border-t border-gray-700 pt-4">
                   <p><span className="text-orange-500 font-bold">Admin:</span> {profile.adminName}</p>
                   <p><span className="text-orange-500 font-bold">Whatsapp:</span> {profile.whatsapp}</p>
                   <p><span className="text-orange-500 font-bold">Miembro desde:</span> {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>

                {/* HISTORIAL DE CALIFICACIONES */}
                <div className="mt-8 border-t border-gray-700 pt-6">
                   <h3 className="font-tech text-xl text-white mb-4 uppercase text-center flex items-center justify-center gap-2"><CheckSquare size={18}/> Registro de Operaciones</h3>
                   <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {ratings.length === 0 ? (
                         <p className="text-gray-500 text-xs text-center italic">Sin operaciones registradas aún.</p>
                      ) : (
                         ratings.map((r, i) => (
                            <div key={i} className="bg-black/40 border border-gray-800 p-3 flex justify-between items-center hover:border-gray-600 transition-colors">
                               <div>
                                  <p className="text-sm font-bold text-gray-300 uppercase">{r.buyerName}</p>
                                  <p className="text-[9px] text-gray-500 font-mono">OP: #{r.orderId}</p>
                               </div>
                               <div className={`px-2 py-1 text-[10px] font-bold uppercase rounded flex items-center gap-1 ${
                                  r.type === 'good' ? 'bg-green-900/30 text-green-400 border border-green-900' :
                                  r.type === 'neutral' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900' :
                                  'bg-red-900/30 text-red-400 border border-red-900'
                               }`}>
                                  {r.type === 'good' ? <ThumbsUp size={10}/> : r.type === 'neutral' ? <Minus size={10}/> : <ThumbsDown size={10}/>}
                                  {r.type === 'good' ? 'POSITIVA' : r.type === 'neutral' ? 'NEUTRAL' : 'NEGATIVA'}
                               </div>
                            </div>
                         ))
                      )}
                   </div>
                </div>
             </div>

             {/* ARSENAL */}
             <div className="w-full md:w-2/3 border-l border-gray-700 pl-0 md:pl-8">
                <h3 className="font-tech text-2xl text-white mb-6 uppercase flex items-center gap-2 border-b border-orange-600 pb-2">
                   <Flame className="text-orange-500"/> Arsenal Disponible ({sellerListings.length})
                </h3>
                <div className="grid grid-cols-1 gap-6">
                   {sellerListings.length === 0 ? (
                      <p className="text-gray-500 italic">Este vendedor no tiene suministros activos.</p>
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
    <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 font-gamer text-2xl animate-pulse relative overflow-hidden">
      <FireEffect />
      <div className="z-10 flex flex-col items-center">
         <Crosshair size={100} className="text-orange-600 animate-spin-slow mb-4" />
         <span>CARGANDO SISTEMA TECNOBYTE...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative text-gray-100 bg-transparent">
      {/* CAPAS DE FONDO */}
      <div className="fixed inset-0 bg-[#0a0a0a] -z-20"></div>
      <CyberVideoBackground />
      <FireEffect />
      <MeteorShower />
      <AshRain />
      <CharacterDecor />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
      <div className="fixed inset-0 pointer-events-none z-40 bg-gradient-to-b from-black/50 via-transparent to-red-900/20"></div>

      <Navbar user={user} userData={userData} setView={setView} onLogout={handleLogout} />

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10 animate-enter">
        {notification && (
          <div className={`fixed top-24 right-4 z-50 px-6 py-4 hud-panel border-l-4 flex items-center gap-3 font-tech uppercase font-bold tracking-wider animate-enter ${notification.type === 'error' ? 'border-red-600 text-red-500 shadow-red-900/80' : 'border-green-500 text-green-400 shadow-green-900/80'}`}>
            {notification.type === 'error' ? <AlertTriangle size={24}/> : <CheckCircle size={24}/>}
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

// --- 7. MODAL DE COMPRA (ORDEN, FACTURA, CHAT Y CALIFICACION) ---
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
      <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 overflow-auto">
        <div id="invoice-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl w-full h-[90vh]">
          
          <div className="hud-panel p-8 font-mono relative animate-enter text-gray-200 border-2 border-orange-500/50 overflow-y-auto">
            <div className="hud-corner-decoration"></div>
            <div className="border-b-2 border-orange-600/30 pb-4 mb-6 flex justify-between items-start">
               <div>
                  <img src="/nexus-station-logo.png" alt="NEXUS" className="h-10 logo-hyper-anim" />
                  <p className="text-xs text-cyan-400 tracking-[0.3em] uppercase">MARKETPLACE DE ELITE</p>
               </div>
               <div className="text-right">
                  <h2 className="text-2xl font-bold text-white uppercase font-tech">FACTURA</h2>
                  <p className="text-sm text-orange-500">#{invoiceData.orderId}</p>
               </div>
            </div>
            <div className="space-y-6 text-sm">
               <div className="bg-black/40 p-4 border border-gray-700"><h3 className="font-bold border-b border-gray-600 mb-2 text-orange-400 uppercase">VENDEDOR</h3><p>Admin: {invoiceData.seller.adminName}</p><p>Whatsapp: {invoiceData.seller.whatsapp}</p></div>
               <div className="bg-black/40 p-4 border border-gray-700"><h3 className="font-bold border-b border-gray-600 mb-2 text-cyan-400 uppercase">CLIENTE</h3><p>{invoiceData.buyer.firstName} {invoiceData.buyer.lastName}</p><p>{invoiceData.buyer.idNumber}</p></div>
               <table className="w-full border-collapse"><thead><tr className="bg-white/10 text-orange-400 uppercase"><th className="p-2 text-left border border-gray-700">ITEM</th><th className="p-2 text-right border border-gray-700">USD</th></tr></thead><tbody><tr><td className="p-4 border border-gray-700 text-white font-bold">{invoiceData.item.title}</td><td className="p-4 text-right border border-gray-700 text-yellow-500">${invoiceData.payment.totalUSD}</td></tr></tbody></table>
               <div className="text-right"><p className="font-bold text-white">TOTAL USD: <span className="text-yellow-500">${invoiceData.payment.totalUSD}</span></p>{invoiceData.payment.currency === 'VES' && <p className="font-bold text-green-400 mt-2 text-lg">TOTAL VES: {formatCurrency(invoiceData.payment.totalVES, 'VES')}</p>}</div>
            </div>
            
            {orderStatus === 'completed' && !isRated && (
               <div className="mt-8 border-t border-gray-600 pt-6 animate-enter">
                  <h3 className="text-center font-tech text-cyan-400 mb-4 uppercase">¿Cómo fue su experiencia?</h3>
                  <div className="flex justify-center gap-4">
                     <button onClick={() => handleRateSeller('good')} className="flex flex-col items-center gap-2 p-3 bg-green-900/30 border border-green-600 rounded hover:bg-green-600 transition-colors group"><ThumbsUp className="text-green-400 group-hover:text-white"/> <span className="text-[10px] font-bold text-green-400 group-hover:text-white">BUENA</span></button>
                     <button onClick={() => handleRateSeller('neutral')} className="flex flex-col items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-600 rounded hover:bg-yellow-600 transition-colors group"><Minus className="text-yellow-400 group-hover:text-white"/> <span className="text-[10px] font-bold text-yellow-400 group-hover:text-white">MEDIA</span></button>
                     <button onClick={() => handleRateSeller('bad')} className="flex flex-col items-center gap-2 p-3 bg-red-900/30 border border-red-600 rounded hover:bg-red-600 transition-colors group"><ThumbsDown className="text-red-400 group-hover:text-white"/> <span className="text-[10px] font-bold text-red-400 group-hover:text-white">MALA</span></button>
                  </div>
               </div>
            )}
            {isRated && (<div className="mt-8 text-center p-4 bg-blue-900/20 border border-blue-500 rounded animate-enter"><p className="text-blue-400 font-bold uppercase text-xs flex items-center justify-center gap-2"><CheckSquare size={16}/> Gracias por su reporte, soldado.</p></div>)}

            <div className="absolute top-4 right-4 flex gap-2 no-print">
               <button onClick={() => window.print()} className="bg-cyan-600 text-black p-2 hover:bg-cyan-500 flex items-center gap-2 text-xs font-bold font-tech uppercase shadow-[0_0_10px_cyan]"><Download size={16}/> IMPRIMIR</button>
               <button onClick={onClose} className="bg-red-600 text-white p-2 hover:bg-red-500 shadow-[0_0_10px_red]"><X size={16}/></button>
            </div>
          </div>

          <div className="flex flex-col gap-4 animate-enter" style={{animationDelay: '0.2s'}}>
             <div className="bg-yellow-600/20 border border-yellow-500 p-4 rounded text-center"><h3 className="text-yellow-500 font-bold uppercase flex items-center justify-center gap-2"><AlertTriangle size={18}/> PROTOCOLO DE SEGURIDAD</h3><p className="text-xs text-gray-300">Siga las instrucciones en el chat para liberar el producto.</p></div>
             <div className="flex-grow"><ChatSystem orderId={invoiceData.dbId} currentUserRole="COMPRADOR" currentUserId="GUEST_BUYER" orderStatus={orderStatus} onUpdateStatus={updateOrderStatus} orderData={invoiceData}/></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="hud-panel p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-enter">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X/></button>
        <h2 className="text-3xl font-gamer text-white mb-6 flex items-center gap-3"><ShoppingBag className="text-orange-500"/> PROCESAR ADQUISICIÓN</h2>
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-tech text-cyan-400 text-sm uppercase tracking-widest mb-4">Fase 1: Identificación del Operador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="input-wrapper"><User className="w-5 h-5"/><input name="firstName" placeholder="Nombres *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><User className="w-5 h-5"/><input name="lastName" placeholder="Apellidos *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><IdCard className="w-5 h-5"/><input name="idNumber" placeholder="Cédula / ID *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><Phone className="w-5 h-5"/><input name="whatsapp" placeholder="Whatsapp Contacto *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
               <div className="input-wrapper"><Mail className="w-5 h-5"/><input name="email" placeholder="Correo Electrónico *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="input-wrapper"><Globe className="w-5 h-5"/><input name="country" placeholder="País *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
                  <div className="input-wrapper"><MapPin className="w-5 h-5"/><input name="state" placeholder="Estado *" className="input-ff p-3 w-full" onChange={handleBuyerChange} /></div>
               </div>
            </div>
            <button onClick={() => {
                const { firstName, lastName, idNumber, whatsapp, email, country, state } = buyerData;
                if(!firstName || !lastName || !idNumber || !whatsapp || !email || !country || !state) return showNotification("TODOS LOS DATOS SON OBLIGATORIOS", "error");
                setStep(2);
              }} className="w-full btn-ff py-4 text-xl mt-4">CONTINUAR AL PAGO</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-tech text-cyan-400 text-sm uppercase tracking-widest mb-4">Fase 2: Transferencia de Créditos</h3>
            <div className="bg-black/40 p-4 border border-gray-700 mb-6 flex justify-between items-center"><span>Monto a Pagar (USD):</span><span className="text-2xl font-gamer text-yellow-500">${item.discountActive ? item.discountPrice : item.price}</span></div>
            {sellerMethods.length === 0 ? (<div className="text-center p-10 border border-dashed border-red-500 text-red-500 font-bold uppercase">El vendedor no ha configurado métodos de pago.</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">{sellerMethods.map(m => (<div key={m.id} onClick={() => setSelectedMethod(m)} className={`p-4 border cursor-pointer transition-all ${selectedMethod?.id === m.id ? 'border-orange-500 bg-orange-900/20' : 'border-gray-700 hover:border-gray-500'}`}><div className="font-bold text-white uppercase flex items-center justify-between">{m.name} <span className="text-xs bg-gray-800 px-2 py-1 text-cyan-400">{m.currency}</span></div><p className="text-xs text-gray-400 mt-2 font-mono whitespace-pre-wrap">{m.details}</p></div>))}</div>)}
            {selectedMethod?.currency === 'VES' && (<div className="bg-green-900/20 border border-green-500/50 p-6 animate-enter"><div className="flex justify-between text-sm text-green-400 mb-2 uppercase font-bold"><span>Tasa USDT (CriptoYA):</span><span>{rate > 0 ? formatCurrency(rate, 'VES') : 'Consultando...'} / USD</span></div><div className="flex justify-between text-3xl font-gamer text-white border-t border-green-500/30 pt-4 mt-2"><span>TOTAL A PAGAR:</span><span>{formatCurrency((item.discountActive ? item.discountPrice : item.price) * rate, 'VES')}</span></div></div>)}
            <button onClick={handleConfirmPurchase} disabled={loading} className="w-full btn-ff py-4 text-xl mt-4 flex items-center justify-center gap-2">{loading ? "PROCESANDO..." : <><CheckCircle/> CONFIRMAR TRANSFERENCIA</>}</button>
            <button onClick={() => setStep(1)} className="w-full text-xs text-gray-500 mt-2 hover:text-white">VOLVER A DATOS</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Navbar (Header) ---
const Navbar = ({ user, userData, setView, onLogout }) => (
  <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-orange-600/50 shadow-[0_5px_40px_rgba(255,69,0,0.3)] animate-enter">
    <div className="container mx-auto px-4 h-24 flex justify-between items-center">
      <div className="flex items-center gap-3 cursor-pointer group select-none hover:scale-105 transition-transform" onClick={() => setView('home')}>
        <div className="flex flex-col">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
            <img src="/nexus-station-logo.png" alt="NEXUS STATION" className="h-16 md:h-20 object-contain logo-hyper-anim z-10 relative" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <button onClick={() => setView('login')} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white font-tech text-sm uppercase tracking-widest"><Lock size={16} /> Acceso Admin</button>
            <button onClick={() => setView('register')} className="btn-ff px-8 py-3 text-base font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,69,0,0.6)]"><User size={18} /> UNIRSE</button>
          </>
        ) : (
          <div className="flex items-center gap-6 bg-slate-900/80 px-6 py-3 rounded-lg border border-red-900/50 shadow-lg">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-yellow-500 font-gamer text-base tracking-wider flex items-center gap-2"><Diamond size={14} className="fill-yellow-500 animate-pulse" /> {userData?.adminName || "VENDEDOR"}</span>
              <span className="text-[10px] text-gray-400 font-tech uppercase tracking-widest">{userData?.publicUsername}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('dashboard')} className="p-2 hover:bg-orange-500/20 rounded-full text-orange-500 transition-colors"><User size={24} /></button>
              <button onClick={onLogout} className="p-2 hover:bg-red-500/20 rounded-full text-red-500 transition-colors"><LogOut size={24} /></button>
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
    <div className="pb-10">
      <div className="relative rounded-xl overflow-hidden mb-16 border-2 border-orange-600/40 group shadow-[0_0_50px_rgba(255,69,0,0.2)] animate-enter">
        <div className="absolute inset-0 bg-[url('https://wallpaperaccess.com/full/2222718.jpg')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-[3s]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        <div className="relative z-10 p-10 md:p-20 flex flex-col items-start max-w-4xl">
          <div className="bg-red-600 text-white text-sm font-black px-4 py-1 mb-6 uppercase tracking-[0.3em] -skew-x-12 shadow-[5px_5px_0px_rgba(0,0,0,0.5)] animate-enter-delay-1"><Flame size={14} className="inline mr-2 mb-1" /> Temporada de Fuego</div>
          <h2 className="text-6xl md:text-8xl font-gamer text-white mb-6 italic leading-[0.9] drop-shadow-2xl uppercase animate-enter-delay-2">Mercado <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">Infernal</span></h2>
          <div className="w-full max-w-lg relative mt-6 animate-enter-delay-3">
             <div className="input-wrapper">
               <Search className="w-6 h-6 absolute left-4 top-4 text-orange-500 z-10"/>
               <input placeholder="Buscar Vendedor o Producto..." className="input-ff w-full p-4 pl-12 text-xl border-orange-500/50 focus:border-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
             </div>
          </div>
          <p className="text-gray-300 font-tech text-xl mb-10 max-w-lg border-l-4 border-yellow-500 pl-6 uppercase animate-enter-delay-3 leading-relaxed text-shadow-sm mt-8">Cuentas Sakura, Hip-Hop y Criminales listos para el combate. Transacción inmediata.</p>
          {user && (<button onClick={() => setView('create')} className="animate-enter-delay-3 btn-ff px-10 py-5 text-2xl flex items-center gap-4 shadow-[0_0_40px_rgba(255,69,0,0.6)] hover:shadow-[0_0_60px_rgba(255,69,0,0.8)]"><Plus size={28} className="animate-spin-slow" /> PUBLICAR ARSENAL</button>)}
        </div>
      </div>
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredListings.map((item, index) => (<ProductCard key={item.id} item={item} index={index} onBuy={() => setPurchaseItem(item)} onViewSeller={() => setViewSellerId(item.sellerId)} />))}
        </div>
      ) : (<div className="text-center py-20 text-gray-500 font-tech uppercase"><Search size={48} className="mx-auto mb-4 opacity-50"/>No se encontraron resultados en el radar.</div>)}
    </div>
  );
};

const ProductCard = ({ item, index, onBuy, onViewSeller }) => {
  const finalPrice = item.discountActive ? item.discountPrice : item.price;
  const rarityClass = finalPrice > 200 ? 'rarity-legendary' : finalPrice > 100 ? 'rarity-epic' : 'border-b-2 border-gray-700';
  return (
    <div className={`hud-panel flex flex-col group h-full opacity-0 animate-enter ${rarityClass}`} style={{ animationDelay: `${index * 150}ms` }}>
      <div className="hud-corner-decoration"></div>
      <div className="relative h-64 bg-black overflow-hidden clip-path-bottom-slant">
        <div className="absolute inset-0 bg-orange-600/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <img src={item.images?.[0]} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80"></div>
        {item.discountActive && <div className="absolute top-4 right-[-10px] bg-red-600 text-white font-black italic px-4 py-1 text-xl skew-x-[-20deg] shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-20 animate-pulse">OFERTA</div>}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-sm border-l-2 border-yellow-500 z-20 cursor-pointer hover:bg-black" onClick={onViewSeller}>
           <User size={14} className="text-yellow-500"/>
           <span className="text-[10px] font-tech text-gray-200 uppercase tracking-wider hover:text-white hover:underline">{item.adminName}</span>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col relative bg-gradient-to-b from-transparent to-black/60">
        <h3 className="font-tech font-bold text-white text-xl leading-tight mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors uppercase drop-shadow-md">{item.title}</h3>
        <p className="text-gray-400 text-xs line-clamp-3 mb-6 font-mono leading-relaxed uppercase opacity-80">{item.description}</p>
        <div className="mt-auto border-t border-dashed border-gray-700 pt-4 flex justify-between items-end">
          <div>{item.discountActive && <span className="text-xs text-red-500 line-through block font-mono font-bold">{formatCurrency(item.price)}</span>}<span className="text-3xl font-gamer text-white text-shadow-sm">{formatCurrency(finalPrice)}</span></div>
          <button onClick={onBuy} className="bg-yellow-500 hover:bg-yellow-400 text-black p-3 transition-all hover:rotate-12 hover:scale-110 shadow-[0_0_20px_rgba(255,215,0,0.6)] clip-path-polygon"><ShoppingBag size={22} strokeWidth={3} /></button>
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
    <div className="hud-panel p-6 mt-10">
      <div className="hud-corner-decoration"></div>
      <h3 className="font-tech text-xl text-cyan-400 mb-6 uppercase flex items-center gap-2"><CreditCard/> Métodos de Pago (Recepción)</h3>
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-black/40 p-4 border border-gray-700">
         <div className="input-wrapper"><Banknote className="w-5 h-5"/><input placeholder="Nombre (Ej: Pago Móvil)" value={newMethod.name} onChange={e=>setNewMethod({...newMethod, name: e.target.value})} className="input-ff p-3 w-full" /></div>
         <select value={newMethod.currency} onChange={e=>setNewMethod({...newMethod, currency: e.target.value})} className="input-ff p-3 bg-black"><option value="VES">Bolívares (VES)</option><option value="USDT">USDT (Binance)</option><option value="USD">Zelle / USD</option></select>
         <textarea placeholder="Datos (Banco, Teléfono, CI, Email...)" value={newMethod.details} onChange={e=>setNewMethod({...newMethod, details: e.target.value})} className="input-ff p-3 md:col-span-2 h-12 pt-2" />
         <button disabled={loading} className="btn-ff py-2 md:col-span-4 flex justify-center items-center gap-2"><Plus size={16}/> AGREGAR MÉTODO</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{methods.map(m => (<div key={m.id} className="bg-black/40 border border-gray-700 p-4 relative group hover:border-orange-500"><button onClick={() => handleDelete(m.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><X size={16}/></button><h4 className="font-bold text-white uppercase">{m.name} <span className="text-xs bg-gray-800 px-2 py-0.5 ml-2 text-cyan-400">{m.currency}</span></h4><p className="text-xs text-gray-400 mt-2 whitespace-pre-wrap font-mono">{m.details}</p></div>))}</div>
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
    <div className="mt-10 hud-panel p-6">
       <div className="hud-corner-decoration"></div>
       <h3 className="font-tech text-xl text-green-400 mb-6 uppercase flex items-center gap-2"><RefreshCw/> Radar de Ventas (Órdenes Entrantes)</h3>
       <div className="space-y-4">
          {orders.length === 0 && <p className="text-gray-500">Sin operaciones activas.</p>}
          {orders.map(order => (
             <div key={order.id} className="bg-black/40 border border-gray-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-green-500 transition-colors">
                <div><p className="text-orange-500 font-bold text-xs">#{order.orderId}</p><p className="text-white font-bold">{order.item.title}</p><p className="text-xs text-gray-400">Cliente: {order.buyer.firstName} {order.buyer.lastName}</p></div>
                <div className="text-right"><p className="text-yellow-500 font-mono text-lg">${order.payment.totalUSD}</p><span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${order.status === 'completed' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>{order.status === 'created' ? 'NUEVA' : order.status === 'payment_reported' ? 'PAGO REPORTADO' : order.status === 'payment_confirmed' ? 'DATOS ENVIADOS' : 'COMPLETADA'}</span></div>
                <button onClick={() => setSelectedOrder(order)} className="btn-secondary-ff px-4 py-2 text-xs flex gap-2"><MessageSquare size={14}/> CHAT / GESTIONAR</button>
             </div>
          ))}
       </div>
       {selectedOrder && (
          <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
             <div className="hud-panel p-6 max-w-4xl w-full h-[80vh] flex flex-col relative">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-white"><X/></button>
                <h3 className="text-2xl font-gamer text-white mb-4">Operación #{selectedOrder.orderId}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-hidden">
                   <div className="overflow-y-auto pr-2 space-y-4 text-sm">
                      <div className="bg-gray-900 p-4 border border-gray-700"><h4 className="text-orange-400 font-bold mb-2">DATOS DEL CLIENTE</h4><p>Nombre: {selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}</p><p>Cédula: {selectedOrder.buyer.idNumber}</p><p>Whatsapp: {selectedOrder.buyer.whatsapp}</p><p>Ubicación: {selectedOrder.buyer.state}, {selectedOrder.buyer.country}</p></div>
                      <div className="bg-gray-900 p-4 border border-gray-700"><h4 className="text-cyan-400 font-bold mb-2">DATOS FINANCIEROS</h4><p>Monto: ${selectedOrder.payment.totalUSD}</p><p>Método: {selectedOrder.payment.method} ({selectedOrder.payment.currency})</p>{selectedOrder.payment.currency === 'VES' && <p>Tasa: {selectedOrder.payment.rateUsed} | Total VES: {formatCurrency(selectedOrder.payment.totalVES, 'VES')}</p>}</div>
                   </div>
                   <div className="flex flex-col h-full"><div className="bg-black border border-gray-700 p-2 mb-2 text-center text-xs text-green-400 font-bold">CANAL SEGURO P2P</div><div className="flex-grow"><ChatSystem orderId={selectedOrder.id} currentUserRole="VENDEDOR" currentUserId={user.uid} orderStatus={selectedOrder.status} onUpdateStatus={updateOrderStatus} orderData={selectedOrder}/></div></div>
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
    <div className="animate-enter">
      <div className="flex justify-between items-end mb-10 border-b border-gray-800 pb-6">
        <div><h2 className="text-5xl font-gamer text-white uppercase italic text-shadow-glow">Base de Mando</h2><p className="font-tech text-cyan-500 tracking-widest mt-2 uppercase">Comandante {userData?.adminName}</p></div>
        <button onClick={() => setView('create')} className="btn-ff px-8 py-4 flex items-center gap-3"><Plus size={24} /> NUEVO DESPLIEGUE</button>
      </div>
      <PaymentMethodsManager user={user} showNotification={showNotification} />
      <SalesOrders user={user} />
      <div className="mt-10">
         <h3 className="font-tech text-xl text-white uppercase tracking-wider mb-6 flex items-center gap-2"><Trophy className="text-yellow-500"/> Inventario Activo</h3>
         <div className="space-y-4">
             {myListings.map(item => (
               <div key={item.id} className="hud-panel p-5 flex flex-col md:flex-row items-center gap-8 hover:bg-white/5 transition-all">
                  <div className="w-20 h-20 bg-black border border-gray-600 shrink-0"><img src={item.images?.[0]} className="w-full h-full object-cover" /></div>
                  <div className="flex-grow"><h4 className="font-bold font-tech text-xl text-white uppercase">{item.title}</h4><span className="text-yellow-500 font-mono font-bold">{formatCurrency(item.price)}</span></div>
                  <div className="flex gap-3"><button onClick={() => setView(`edit-${item.id}`)} className="btn-secondary-ff px-4 py-2 flex items-center gap-2"><Edit size={16}/> EDITAR</button><button className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-600 hover:text-white flex items-center gap-2 font-bold uppercase"><Trash2 size={16}/> BORRAR</button></div>
               </div>
             ))}
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
    <div className="max-w-md mx-auto mt-16 relative animate-enter">
      <div className="absolute -inset-4 bg-gradient-to-r from-orange-600 via-red-600 to-yellow-500 rounded-lg blur-lg opacity-40 animate-pulse"></div>
      <div className="hud-panel p-10 relative z-10 bg-black/90">
        <div className="hud-corner-decoration"></div>
        {showRecover ? (
          <div><h3 className="text-2xl font-gamer text-white uppercase text-center mb-6">Recuperar Acceso</h3><form onSubmit={handleRecover} className="space-y-6"><div className="input-wrapper"><Mail className="w-5 h-5"/><input type="email" required className="input-ff w-full p-4" placeholder="CORREO REGISTRADO" value={email} onChange={(e) => setEmail(e.target.value)} /></div><div className="flex gap-4"><button type="button" onClick={() => setShowRecover(false)} className="flex-1 btn-secondary-ff py-3">CANCELAR</button><button type="submit" className="flex-1 btn-ff py-3">ENVIAR</button></div></form></div>
        ) : (
          <><div className="text-center mb-10"><div className="w-20 h-20 mx-auto bg-black border-2 border-orange-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,69,0,0.5)]"><Lock size={32} className="text-orange-500" /></div><h2 className="text-4xl font-gamer text-white uppercase italic drop-shadow-lg">Acceso Oficial</h2></div><form onSubmit={handleSubmit} className="space-y-8"><div className="group"><label className="block text-xs font-bold text-cyan-500 mb-2 font-tech uppercase tracking-wider">Identificador</label><div className="input-wrapper"><Mail className="w-5 h-5"/><input type="email" required className="input-ff w-full p-4 text-lg" placeholder="AGENTE@TECNOBYTE.COM" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div><div className="group"><label className="block text-xs font-bold text-cyan-500 mb-2 font-tech uppercase tracking-wider">Código de Seguridad</label><div className="input-wrapper"><Key className="w-5 h-5"/><input type="password" required className="input-ff w-full p-4 text-lg" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div><div className="text-right mt-2"><button type="button" onClick={() => setShowRecover(true)} className="text-[10px] text-yellow-500 hover:text-white uppercase font-bold tracking-wider">¿Olvidó su contraseña?</button></div></div><button type="submit" className="w-full btn-ff py-5 text-2xl mt-8 shadow-[0_5px_20px_rgba(255,0,0,0.4)]">AUTENTICAR</button></form><div className="mt-8 text-center border-t border-gray-800 pt-6"><button onClick={() => setView('register')} className="text-gray-500 hover:text-yellow-500 text-xs font-tech uppercase tracking-[0.2em] transition-all hover:scale-105">&gt;&gt; Solicitar Permisos de Venta</button></div></>
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
    <div className="max-w-4xl mx-auto mt-10 hud-panel p-10 animate-enter">
      <h2 className="text-4xl font-gamer text-white mb-8 text-center flex items-center justify-center gap-4"><Shield className="text-orange-500" size={40}/> RECLUTAMIENTO DE ELITE</h2>
      <form onSubmit={handleRegister}>
        {step === 1 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="input-wrapper"><User className="w-5 h-5"/><input name="firstName" placeholder="Nombre *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><User className="w-5 h-5"/><input name="lastName" placeholder="Apellido *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><Mail className="w-5 h-5"/><input name="email" placeholder="Email *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><Smartphone className="w-5 h-5"/><input name="whatsapp" placeholder="Whatsapp *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><IdCard className="w-5 h-5"/><input name="idNumber" placeholder="DNI / Cédula *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><FileText className="w-5 h-5"/><input name="rif" placeholder="RIF (Opcional)" className="input-ff p-4 border-green-900/50 w-full" onChange={handleChange} /></div><div className="md:col-span-2 bg-black/40 p-4 border border-gray-700"><p className="text-xs text-cyan-400 mb-2 font-bold">SEGURIDAD DE ACCESO</p><div className="grid grid-cols-2 gap-4"><div className="input-wrapper"><Key className="w-5 h-5"/><input name="password" type="password" placeholder="Contraseña Maestra *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><Key className="w-5 h-5"/><input name="confirmPassword" type="password" placeholder="Repetir Contraseña *" className="input-ff p-4 w-full" onChange={handleChange} /></div></div><div className="flex gap-2 mt-2 text-[10px] text-gray-500 uppercase"><span className={passStrength.length ? "text-green-500" : ""}>8+ Caracteres</span><span className={passStrength.upper ? "text-green-500" : ""}>Mayúscula</span><span className={passStrength.num ? "text-green-500" : ""}>Número</span><span className={passStrength.special ? "text-green-500" : ""}>Símbolo</span></div></div><button type="button" onClick={handleNextStep} className="btn-secondary-ff py-4 md:col-span-2 text-lg font-bold">SIGUIENTE FASE &gt;&gt;</button></div>)}
        {step === 2 && (<div className="space-y-6"><div className="grid grid-cols-2 gap-4"><div className="bg-black/40 p-6 border border-gray-700 text-center relative group hover:border-orange-500 transition-colors"><ScanFace size={40} className="mx-auto mb-4 text-gray-500 group-hover:text-orange-500 transition-colors"/><p className="text-xs font-bold mb-2 uppercase tracking-wider">SELFIE EN VIVO *</p><label className="text-xs btn-secondary-ff p-2 cursor-pointer block">{kycData.selfie ? "REEMPLAZAR" : "ACTIVAR CÁMARA"} <input type="file" hidden accept="image/*" capture="user" onChange={e => handleKyc('selfie', e.target.files[0])}/></label></div><div className="bg-black/40 p-6 border border-gray-700 text-center relative group hover:border-orange-500 transition-colors"><FileText size={40} className="mx-auto mb-4 text-gray-500 group-hover:text-orange-500 transition-colors"/><p className="text-xs font-bold mb-2 uppercase tracking-wider">DOCUMENTO ID *</p><label className="text-xs btn-secondary-ff p-2 cursor-pointer block">{kycData.docFront ? "REEMPLAZAR" : "ESCANEAR DOC"} <input type="file" hidden accept="image/*" onChange={e => handleKyc('docFront', e.target.files[0])}/></label></div></div><div className="input-wrapper"><UserCheck className="w-5 h-5"/><input name="publicUsername" placeholder="Alias Público *" className="input-ff p-4 w-full" onChange={handleChange} /></div><div className="input-wrapper"><Shield className="w-5 h-5"/><input name="adminName" placeholder="Nombre Admin *" className="input-ff p-4 w-full" onChange={handleChange} /></div><label className="flex items-center gap-3 text-sm text-gray-400 bg-orange-900/10 p-4 border border-orange-500/30 rounded cursor-pointer hover:bg-orange-900/20 transition-colors"><input type="checkbox" onChange={e => setLiveness(e.target.checked)} className="w-5 h-5 accent-orange-500"/> Confirmo que soy una persona real (Prueba de Vida)</label><div className="flex gap-4"><button type="button" onClick={() => setStep(1)} className="flex-1 btn-secondary-ff py-4 font-bold">ATRÁS</button><button disabled={loading} className="flex-[2] btn-ff py-4 text-xl shadow-[0_0_30px_rgba(255,69,0,0.5)] animate-pulse font-bold tracking-widest">{loading ? "ENCRIPTANDO..." : "FINALIZAR REGISTRO"}</button></div></div>)}
      </form>
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
    if(data.images.length === 0) return showNotification("SE REQUIERE AL MENOS UNA IMAGEN", "error");
    setLoading(true);
    try {
       const payload = { ...data, price: Number(data.price), sellerId: user.uid, adminName: userData.adminName, sellerUsername: userData.publicUsername, updatedAt: serverTimestamp() };
       if(mode === 'create') {
         await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'listings'), { ...payload, createdAt: serverTimestamp() });
       } else {
         await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'listings', editId), payload);
       }
       showNotification("PUBLICADO", "success"); setView('dashboard');
    } catch(e) { showNotification("ERROR: " + e.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto hud-panel p-10 mt-10 animate-enter">
       <div className="hud-corner-decoration"></div>
       <div className="flex justify-between items-center mb-10 border-b border-orange-600 pb-4">
          <h2 className="text-4xl font-gamer text-white uppercase italic text-shadow-glow">{mode === 'create' ? '>> Inicializando Despliegue' : '>> Modificando Activo'}</h2>
          <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white"><X size={36} /></button>
       </div>
       <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <input placeholder="Título de la Cuenta" className="input-ff w-full p-4 text-xl" value={data.title} onChange={e => setData({...data, title: e.target.value})} required />
             <input type="number" placeholder="Precio USD" className="input-ff w-full p-4 text-yellow-500 font-mono text-xl" value={data.price} onChange={e => setData({...data, price: e.target.value})} required />
          </div>
          <textarea placeholder="Informe Detallado (Items, Pases, Rangos)" className="input-ff w-full p-4 h-32" value={data.description} onChange={e => setData({...data, description: e.target.value})} required />
          <div className="border-2 border-dashed border-gray-600 p-6 text-center hover:border-orange-500 transition-colors">
             <Camera size={32} className="mx-auto mb-2 text-gray-500"/>
             <label className="cursor-pointer text-xs font-bold uppercase hover:text-orange-500">Subir Evidencia (Imágenes) <input type="file" hidden multiple accept="image/*" onChange={handleFileChange}/></label>
             <div className="flex gap-2 mt-4 justify-center">
                {data.images.map((img, i) => <img key={i} src={img} className="w-16 h-16 object-cover border border-gray-600"/>)}
             </div>
          </div>
          <button disabled={loading} className="w-full btn-ff py-4 text-xl shadow-[0_0_30px_rgba(255,69,0,0.5)]">{loading ? 'TRANSMITIENDO...' : 'PUBLICAR AHORA'}</button>
       </form>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-black pt-16 pb-10 border-t-2 border-red-900/50 mt-24 text-center relative z-20">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-50"></div>
    <div className="flex justify-center items-center gap-3 mb-8 opacity-90 relative z-10">
      <img src="/nexus-station-logo.png" alt="NEXUS STATION" className="h-24 object-contain logo-hyper-anim" />
    </div>
    <p className="text-gray-500 font-tech text-xs relative z-10">© 2026 NEXUS STATION DESAROLLADO POR TECNOBYTE LLC. TODOS LOS DERECHOS RESERVADOS.</p>
  </footer>
);
