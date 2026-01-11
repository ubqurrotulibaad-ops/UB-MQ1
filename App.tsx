
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserRole, UserProfile, StoreProduct, Transaction, Sale, SaleItem, SHUPool, MemberSHU } from './types';
import { ADMIN_MENU, MEMBER_MENU } from './constants';
import { 
  Menu, X, Bell, LogOut, Plus, Search, Edit, Trash2, Save, 
  ShoppingBag, Store, Wallet, Users, PieChart, FileText, Info,
  UserCircle, Camera, ImageIcon, ShoppingCart, TrendingUp, Calculator,
  Receipt, Landmark, UserCheck, ShieldCheck, HeartHandshake, History, ArrowDownCircle, ArrowUpCircle,
  PlusCircle, MinusCircle, Wallet2, ChevronLeft, BarChart, Activity, TrendingDown,
  Gift, Send, Download, Upload, Sparkles, ArrowRight, Lock, MapPin, Phone, User,
  Mail, UserPlus, Eye, EyeOff, Database, CloudLightning, RefreshCw, Globe, Smartphone,
  FileDown, Calendar, Package, Tag, CreditCard, Banknote, MessageCircle, ImagePlus,
  Clock, ExternalLink, ChevronRight, Star, Zap, Key, Layers, ArrowDownUp, Scale
} from 'lucide-react';

// --- UTILS ---
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

// --- INITIAL DATA ---
const INITIAL_MEMBERS: UserProfile[] = [
  { 
    id: 'ADM001', 
    name: 'Admin Utama', 
    role: UserRole.ADMIN, 
    phone: '085892156602', 
    email: 'ubmqi212@gmail.com', 
    password: 'Admin123',
    status: 'Aktif', 
    address: 'Kantor Pusat UB. Qurrotul \'Ibaad', 
    joinedDate: new Date().toISOString().split('T')[0], 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' 
  },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // --- SYNC STATE ---
  const [syncId, setSyncId] = useState(() => localStorage.getItem('ub_sync_id') || '');

  // --- APP STATE ---
  const [members, setMembers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('ub_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  const [products, setProducts] = useState<StoreProduct[]>(() => {
    const saved = localStorage.getItem('ub_products');
    return saved ? JSON.parse(saved) : [];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ub_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('ub_sales');
    return saved ? JSON.parse(saved) : [];
  });
  const [shuPool, setShuPool] = useState<SHUPool>(() => {
    const saved = localStorage.getItem('ub_shupool');
    return saved ? JSON.parse(saved) : { jasaModal: 0, jasaTransaksi: 0, pengurus: 0, cadanganModal: 0, infaqMQI: 0 };
  });
  const [memberShu, setMemberShu] = useState<MemberSHU[]>(() => {
    const saved = localStorage.getItem('ub_membershu');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_MEMBERS[0]);

  // --- PERSISTENCE ---
  useEffect(() => { localStorage.setItem('ub_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('ub_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('ub_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('ub_sales', JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem('ub_shupool', JSON.stringify(shuPool)); }, [shuPool]);
  useEffect(() => { localStorage.setItem('ub_membershu', JSON.stringify(memberShu)); }, [memberShu]);
  useEffect(() => { localStorage.setItem('ub_sync_id', syncId); }, [syncId]);

  const menu = useMemo(() => role === UserRole.ADMIN ? ADMIN_MENU : MEMBER_MENU, [role]);

  // --- BUSINESS LOGIC ---
  const handlePushToCloud = async () => {
    if (!syncId) { alert("Harap buat Kode Sinkronisasi dulu."); return; }
    setIsSyncing(true);
    try {
      const fullData = { members, products, transactions, sales, shuPool, memberShu };
      await fetch(`https://api.npoint.io/${syncId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
      });
      alert(`Berhasil diunggah ke cloud! Kode: ${syncId}`);
    } catch (err) {
      alert("Gagal sinkronisasi. Periksa koneksi internet.");
    } finally { setIsSyncing(false); }
  };

  const handleFetchFromCloud = async (targetSyncId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`https://api.npoint.io/${targetSyncId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMembers(data.members || INITIAL_MEMBERS);
      setProducts(data.products || []);
      setTransactions(data.transactions || []);
      setSales(data.sales || []);
      setShuPool(data.shuPool || { jasaModal: 0, jasaTransaksi: 0, pengurus: 0, cadanganModal: 0, infaqMQI: 0 });
      setMemberShu(data.memberShu || []);
      setSyncId(targetSyncId);
      alert("Sinkronisasi Berhasil!");
      return true;
    } catch (err) {
      alert("Kode salah atau data tidak ditemukan.");
      return false;
    } finally { setIsSyncing(false); }
  };

  const distributeSHU = (netProfit: number, memberId: string) => {
    const alloc = {
      jasaModal: Math.round(netProfit * 0.30),
      jasaTransaksi: Math.round(netProfit * 0.20),
      pengurus: Math.round(netProfit * 0.15),
      cadanganModal: Math.round(netProfit * 0.25),
      infaqMQI: Math.round(netProfit * 0.10),
    };
    setShuPool(prev => ({
      jasaModal: prev.jasaModal + alloc.jasaModal,
      jasaTransaksi: prev.jasaTransaksi + alloc.jasaTransaksi,
      pengurus: prev.pengurus + alloc.pengurus,
      cadanganModal: prev.cadanganModal + alloc.cadanganModal,
      infaqMQI: prev.infaqMQI + alloc.infaqMQI,
    }));
    setMemberShu(prev => {
      const idx = prev.findIndex(m => m.memberId === memberId);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], jasaTransaksi: updated[idx].jasaTransaksi + alloc.jasaTransaksi };
        return updated;
      }
      return [...prev, { memberId, jasaModal: 0, jasaTransaksi: alloc.jasaTransaksi }];
    });
  };

  const handleDistributeSavingsSHU = () => {
    if (shuPool.jasaModal <= 0) {
      alert("Tidak ada saldo Jasa Modal (30%) yang bisa dibagikan.");
      return;
    }
    const simpananTrxs = transactions.filter(t => t.category === 'Simpanan');
    const memberBalances: Record<string, number> = {};
    let totalSavingsPool = 0;
    members.forEach(m => {
      const balance = simpananTrxs
        .filter(t => t.description.includes(m.name))
        .reduce((acc, t) => t.type === 'DEBIT' ? acc + t.amount : acc - t.amount, 0);
      if (balance > 0) {
        memberBalances[m.id] = balance;
        totalSavingsPool += balance;
      }
    });
    if (totalSavingsPool <= 0) {
      alert("Tidak ada saldo simpanan anggota untuk dasar pembagian.");
      return;
    }
    const poolToDistribute = shuPool.jasaModal;
    setMemberShu(prev => {
      const updated = [...prev];
      members.forEach(m => {
        const balance = memberBalances[m.id] || 0;
        const share = Math.round((balance / totalSavingsPool) * poolToDistribute);
        const idx = updated.findIndex(ms => ms.memberId === m.id);
        if (idx > -1) {
          updated[idx] = { ...updated[idx], jasaModal: updated[idx].jasaModal + share };
        } else {
          updated.push({ memberId: m.id, jasaModal: share, jasaTransaksi: 0 });
        }
      });
      return updated;
    });
    setShuPool(prev => ({ ...prev, jasaModal: 0 }));
    alert(`Berhasil membagikan Rp ${formatIDR(poolToDistribute)} Jasa Modal ke Anggota!`);
  };

  const handleWithdrawSHU = (memberId: string, amount: number, type: string) => {
    const mShu = memberShu.find(ms => ms.memberId === memberId);
    if (!mShu) return;
    const availableModal = mShu.jasaModal;
    const availableTransaksi = mShu.jasaTransaksi;
    const totalMyShu = availableModal + availableTransaksi;
    if (amount > totalMyShu) { alert("Saldo SHU tidak mencukupi."); return; }
    if (type === 'MODAL' && amount > availableModal) { alert("Saldo SHU Simpanan tidak mencukupi."); return; }
    if (type === 'TRANSAKSI' && amount > availableTransaksi) { alert("Saldo SHU Transaksi tidak mencukupi."); return; }

    setMemberShu(prev => {
      const updated = [...prev];
      const idx = updated.findIndex(ms => ms.memberId === memberId);
      let remaining = amount;
      if (type === 'MODAL') { updated[idx].jasaModal -= remaining; }
      else if (type === 'TRANSAKSI') { updated[idx].jasaTransaksi -= remaining; }
      else {
        if (updated[idx].jasaModal >= remaining) { updated[idx].jasaModal -= remaining; remaining = 0; }
        else { remaining -= updated[idx].jasaModal; updated[idx].jasaModal = 0; }
        if (remaining > 0) { updated[idx].jasaTransaksi -= remaining; }
      }
      return updated;
    });

    const memberName = members.find(m => m.id === memberId)?.name || 'Anggota';
    const typeLabel = type === 'MODAL' ? '(Simpanan)' : type === 'TRANSAKSI' ? '(Transaksi)' : '';
    setTransactions(prev => [...prev, {
      id: `WTH-SHU-${Date.now()}`,
      type: 'KREDIT',
      description: `Penarikan SHU ${typeLabel}: ${memberName}`,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      category: 'SHU'
    }]);
    alert("Penarikan SHU berhasil diproses!");
  };

  const recordFinancials = (sale: Sale) => {
    const profit = sale.total - sale.hpp;
    const opCost = Math.round(profit * 0.20);
    const netProfit = profit - opCost;
    setProducts(prev => prev.map(p => {
      const item = sale.items.find(si => si.productId === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    if (sale.paymentStatus === 'Lunas') {
      const newTrxs: Transaction[] = [
        { id: `T-INC-${Date.now()}`, type: 'DEBIT', description: `Penjualan: ${sale.id} (${sale.memberName})`, amount: sale.total, date: sale.date, category: 'Penjualan' },
        { id: `T-OP-${Date.now()}`, type: 'KREDIT', description: `Biaya Ops (20%): ${sale.id}`, amount: opCost, date: sale.date, category: 'Biaya Operasional' }
      ];
      setTransactions(prev => [...prev, ...newTrxs]);
      distributeSHU(netProfit, sale.memberId);
    }
  };

  const handleLogin = (user: UserProfile) => { setCurrentUser(user); setRole(user.role); setIsAuthenticated(true); setActiveTab('dashboard'); };
  const handleLogout = () => { setIsAuthenticated(false); setIsSidebarOpen(false); };

  const renderContent = () => {
    const common = { 
      role, members, setMembers, products, setProducts, transactions, 
      setTransactions, sales, setSales, notify: alert, user: currentUser, 
      shuPool, memberShu, setActiveTab, syncId, setSyncId, handlePushToCloud, isSyncing,
      onDistributeSavingsSHU: handleDistributeSavingsSHU,
      onWithdrawSHU: handleWithdrawSHU
    };
    switch (activeTab) {
      case 'dashboard': return <Dashboard {...common} />;
      case 'anggota': 
      case 'sahabat': return <AnggotaManager {...common} />;
      case 'simpanan':
      case 'simpanan-saya': return <SimpananView {...common} />;
      case 'store': return <StoreView {...common} onCheckout={(sale: Sale) => { setSales(prev => [...prev, sale]); recordFinancials(sale); }} />;
      case 'kas': return <KasView {...common} />;
      case 'keuangan': return <LaporanKeuangan {...common} />;
      case 'shu':
      case 'shu-saya': return <SHUView {...common} />;
      case 'hutang-saya': return <HutangView {...common} onPay={(saleId: string) => {
        const sale = sales.find(s => s.id === saleId);
        if (sale) {
           setSales(prev => prev.map(s => s.id === saleId ? { ...s, paymentStatus: 'Lunas' } : s));
           const profit = sale.total - sale.hpp;
           const opCost = Math.round(profit * 0.20);
           const netProfit = profit - opCost;
           setTransactions(prev => [...prev, { id: `T-PAY-${Date.now()}`, type: 'DEBIT', description: `Pelunasan Piutang: ${sale.id}`, amount: sale.total, date: new Date().toISOString().split('T')[0], category: 'Penjualan' }]);
           distributeSHU(netProfit, sale.memberId);
           alert("Pelunasan berhasil dicatat!");
        }
      }} />;
      case 'profil': return <ProfileEdit user={currentUser} onUpdate={(u: UserProfile) => { setCurrentUser(u); setMembers(members.map(m => m.id === u.id ? u : m)); }} />;
      default: return <div className="p-4 text-center text-slate-400 italic">Halaman Belum Tersedia</div>;
    }
  };

  if (!isAuthenticated) return <LoginScreen members={members} onLogin={handleLogin} onSync={handleFetchFromCloud} isSyncing={isSyncing} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64 text-slate-900 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 h-16 bg-emerald-700 text-white flex items-center justify-between px-4 z-40 md:hidden shadow-lg">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 active:scale-90 transition-transform"><Menu size={24} /></button>
        <h1 className="font-bold text-lg truncate">UB. Qurrotul 'Ibaad</h1>
        <div className="w-10"></div>
      </header>
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto hide-scrollbar shadow-xl md:shadow-none`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-emerald-700 text-white">
          <span className="font-bold text-xl">UB. Management</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden active:scale-90"><X size={24} /></button>
        </div>
        <div className="p-4 flex flex-col min-h-[calc(100%-4rem)]">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl mb-6 border border-emerald-100">
            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-emerald-200 shadow-sm" />
            <div className="overflow-hidden">
              <p className="font-bold text-slate-800 truncate text-sm">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{role}</p>
            </div>
          </div>
          <nav className="space-y-1 flex-1">
            {menu.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6 border-t border-slate-100">
            <button onClick={() => handleLogout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"><LogOut size={20} /> Keluar</button>
          </div>
        </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <main className="pt-20 px-4 pb-4 md:pt-8 md:px-10 max-w-5xl mx-auto">{renderContent()}</main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 md:hidden z-40 shadow-lg safe-bottom">
        {menu.slice(0, 4).map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 w-full transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}`}>
            {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
            <span className="text-[9px] font-bold uppercase">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// --- MODAL COMPONENT ---
const Modal: React.FC<{ title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-xl"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto hide-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- LOGIN SCREEN ---
const LoginScreen: React.FC<any> = ({ members, onLogin, onSync, isSyncing }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [syncCode, setSyncCode] = useState('');
  return (
    <div className="min-h-screen bg-emerald-700 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4 text-emerald-600"><Store size={32} /></div>
            <h2 className="text-2xl font-black text-slate-800">UB. Qurrotul 'Ibaad</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); const u = members.find((m:any) => m.email === email && m.password === password); if(u) onLogin(u); else alert('Email atau Password salah!'); }} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" required />
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">MASUK</button>
        </form>
        <div className="pt-4 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Punya Kode Sinkronisasi?</p>
            <div className="flex gap-2">
                <input placeholder="KODE" value={syncCode} onChange={e=>setSyncCode(e.target.value.toUpperCase())} className="flex-1 p-3 bg-slate-50 border rounded-xl text-center font-black uppercase" />
                <button onClick={() => onSync(syncCode)} disabled={isSyncing} className="bg-slate-800 text-white p-3 rounded-xl">
                    <RefreshCw className={isSyncing ? "animate-spin" : ""} size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard: React.FC<any> = ({ transactions, members, sales, role, user, products, setActiveTab, syncId, setSyncId, handlePushToCloud, isSyncing }) => {
  const isAdmin = role === UserRole.ADMIN;
  const [slideIndex, setSlideIndex] = useState(0);

  const cash = useMemo(() => transactions.filter(t => t.category !== 'HPP').reduce((acc: number, t: any) => t.type === 'DEBIT' ? acc + t.amount : acc - t.amount, 0), [transactions]);
  const receivables = useMemo(() => sales.filter(s => s.paymentStatus === 'Piutang').reduce((acc: number, s: any) => acc + s.total, 0), [sales]);
  const myDebt = useMemo(() => sales.filter((s: any) => s.memberId === user.id && s.paymentStatus === 'Piutang').reduce((acc: number, s: any) => acc + s.total, 0), [sales, user.id]);

  const topSellers = useMemo(() => {
    const counts: Record<string, { product: any, count: number }> = {};
    sales.forEach(s => {
      s.items.forEach(item => {
        if (!counts[item.productId]) {
          const p = products.find(p => p.id === item.productId);
          if (p) counts[item.productId] = { product: p, count: 0 };
        }
        if (counts[item.productId]) counts[item.productId].count += item.qty;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [sales, products]);

  useEffect(() => {
    if (!isAdmin && products.length > 0) {
      const timer = setInterval(() => { setSlideIndex(prev => (prev + 1) % Math.min(products.length, 5)); }, 4000);
      return () => clearInterval(timer);
    }
  }, [isAdmin, products.length]);

  if (isAdmin) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet2 size={120} /></div>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Saldo Kas Utama</p>
          <h2 className="text-4xl font-black mt-2 tracking-tighter">Rp {formatIDR(cash)}</h2>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${syncId ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}><CloudLightning size={24} /></div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sinkronisasi Awan</h3>
              {syncId ? <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{syncId}</span> : <button onClick={() => setSyncId(Math.random().toString(36).substring(7).toUpperCase())} className="text-[10px] text-emerald-600 font-black uppercase">BUAT KODE</button>}
            </div>
          </div>
          <button onClick={() => handlePushToCloud()} disabled={isSyncing || !syncId} className="bg-emerald-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"><RefreshCw className={isSyncing ? "animate-spin" : ""} size={16} /> SINKRONKAN DATA</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100"><Users className="text-blue-600 mb-3" size={20} /><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Anggota</p><p className="text-xl font-black text-slate-800">{members.length}</p></div>
          <div className="bg-white p-5 rounded-3xl border border-rose-100"><Receipt className="text-rose-600 mb-3" size={20} /><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Piutang Toko</p><p className="text-xl font-black text-rose-600">Rp {formatIDR(receivables)}</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 py-2">
        <img src={user.avatar} className="w-14 h-14 rounded-full border-2 border-emerald-500 shadow-lg object-cover" />
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Halo, {user.name.split(' ')[0]}!</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sahabat UB. Qurrotul 'Ibaad</p>
        </div>
      </div>
      {products.length > 0 && (
        <div className="relative h-44 rounded-[2.5rem] overflow-hidden shadow-xl border border-white">
          <div className="absolute inset-0 transition-transform duration-1000 ease-in-out">
            <img src={products[slideIndex]?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${products[slideIndex]?.name}`} className="w-full h-full object-cover" alt="Promo" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
              <p className="text-white font-black text-lg leading-tight truncate">{products[slideIndex]?.name}</p>
              <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Tersedia di UB. Store</p>
            </div>
          </div>
        </div>
      )}
      <div className="bg-emerald-700 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col gap-1 relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-4 opacity-10 rotate-12 group-hover:scale-125 transition-transform"><Zap size={100} /></div>
        <h3 className="text-lg font-black leading-tight">Ayo Belanja di UB. Store!</h3>
        <p className="text-[11px] text-emerald-100 font-medium leading-relaxed max-w-[80%]">Penuhi kebutuhan harian Anda dan dapatkan <span className="text-white font-black">20% SHU Transaksi</span> untuk setiap pembelian!</p>
        <button onClick={() => setActiveTab('store')} className="mt-4 bg-white text-emerald-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit active:scale-95 transition-all">BELANJA SEKARANG <ChevronRight size={14} /></button>
      </div>
      {topSellers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Produk Terlaris</h4>
            <button onClick={() => setActiveTab('store')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">LIHAT SEMUA</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {topSellers.map(({ product, count }) => (
              <div key={product.id} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <div className="aspect-square w-full bg-slate-50 rounded-[1.5rem] mb-3 overflow-hidden border">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                </div>
                <p className="font-bold text-slate-800 text-xs truncate w-full">{product.name}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600"><Star size={10} fill="currentColor" /><span className="text-[10px] font-black uppercase">{count} Terjual</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ANGGOTA MANAGER ---
const AnggotaManager: React.FC<any> = ({ members, setMembers, role }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isAdmin = role === UserRole.ADMIN;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-800">Anggota</h2>{isAdmin && <button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"><UserPlus size={18} /> TAMBAH</button>}</div>
      <div className="space-y-4">
        {members.map((m: any) => (
          <div key={m.id} className="bg-white p-5 rounded-[2rem] flex items-center gap-4 border border-slate-100 shadow-sm">
            <img src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`} className="w-12 h-12 rounded-full border object-cover shadow-sm" />
            <div className="flex-1 min-w-0 text-slate-800">
              <p className="font-bold truncate">{m.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{m.id} • {m.role} • {m.status}</p>
            </div>
          </div>
        ))}
      </div>
      <Modal title="Tambah Anggota Baru" isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setPreviewImage(null); }}>
        <form onSubmit={(e) => { 
            e.preventDefault(); 
            const fd = new FormData(e.currentTarget); 
            const nm: UserProfile = { 
                id: fd.get('id') as string, 
                name: fd.get('name') as string, 
                email: fd.get('email') as string, 
                phone: fd.get('phone') as string, 
                password: fd.get('password') as string, 
                role: fd.get('role') as UserRole, 
                status: fd.get('status') as string, 
                address: fd.get('address') as string, 
                joinedDate: new Date().toISOString().split('T')[0], 
                avatar: previewImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fd.get('id')}` 
            }; 
            setMembers([...members, nm]); 
            setIsAddModalOpen(false); 
            setPreviewImage(null); 
            alert('Anggota berhasil ditambahkan!');
        }} className="space-y-4 text-slate-800">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative">
              {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <div className="text-slate-400"><Camera size={24} /></div>}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase mt-2">Foto Profil</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <input name="id" placeholder="ID (Contoh: AG001)" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" required />
              <input name="name" placeholder="Nama Lengkap" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <input name="email" type="email" placeholder="Email" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" required />
              <input name="password" type="password" placeholder="Password" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" required />
          </div>
          <input name="phone" placeholder="Nomor WA (Contoh: 08...)" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" required />
          <div className="grid grid-cols-2 gap-4">
              <select name="role" className="w-full p-3 bg-slate-50 border rounded-xl font-bold"><option value={UserRole.ANGGOTA}>ANGGOTA</option><option value={UserRole.ADMIN}>ADMIN</option></select>
              <select name="status" className="w-full p-3 bg-slate-50 border rounded-xl font-bold"><option value="Aktif">Aktif</option><option value="Non-Aktif">Non-Aktif</option></select>
          </div>
          <textarea name="address" placeholder="Alamat" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" rows={2} required />
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg active:scale-95 transition-all">SIMPAN ANGGOTA</button>
        </form>
      </Modal>
    </div>
  );
};

// --- SIMPANAN VIEW ---
const SimpananView: React.FC<any> = ({ transactions, setTransactions, user, role, members }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const isAdmin = role === UserRole.ADMIN;
  const filtered = transactions.filter((t: any) => t.category === 'Simpanan');
  const displayData = isAdmin ? filtered : filtered.filter((t: any) => t.description.includes(user.name));
  const total = displayData.reduce((acc: number, t: any) => t.type === 'DEBIT' ? acc + t.amount : acc - t.amount, 0);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-800">Simpanan</h2>{isAdmin && <button onClick={() => setIsAddModalOpen(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg active:scale-95 transition-all"><Plus size={18} /> INPUT</button>}</div>
      <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={120} /></div>
          <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest">Total Simpanan</p><h3 className="text-4xl font-black mt-1">Rp {formatIDR(total)}</h3>
      </div>
      <div className="bg-white rounded-[2.5rem] border divide-y overflow-hidden shadow-sm">
        {displayData.slice().reverse().map((t: any) => (<div key={t.id} className="p-5 flex justify-between items-center text-xs text-slate-800"><div><p className="font-bold">{t.description}</p><p className="text-[9px] text-slate-400 uppercase">{t.date}</p></div><p className={`font-black ${t.type === 'DEBIT' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'DEBIT' ? '+' : '-'} Rp {formatIDR(t.amount)}</p></div>))}
        {displayData.length === 0 && <p className="text-center py-20 text-slate-300 italic text-xs">Belum ada catatan simpanan.</p>}
      </div>
      <Modal title="Input Simpanan" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={(e) => { 
            e.preventDefault(); 
            const fd = new FormData(e.currentTarget); 
            const mId = fd.get('mId'); 
            const mName = members.find((m:any)=>m.id === mId)?.name; 
            setTransactions([...transactions, { 
                id: `SAV-${Date.now()}`, 
                type: fd.get('type'), 
                category: 'Simpanan', 
                description: `[${fd.get('subType')}] ${mName}`, 
                amount: parseInt(fd.get('amount') as string), 
                date: fd.get('date') 
            }]); 
            setIsAddModalOpen(false); 
            alert("Simpanan berhasil diinput!");
        }} className="space-y-4 text-slate-800">
          <input type="date" name="date" className="w-full p-4 bg-slate-50 border rounded-xl" defaultValue={new Date().toISOString().split('T')[0]} />
          <select name="mId" className="w-full p-4 bg-slate-50 border rounded-xl font-bold">{members.map((m:any)=>(<option key={m.id} value={m.id}>{m.name}</option>))}</select>
          <div className="grid grid-cols-2 gap-4">
              <select name="type" className="w-full p-4 bg-slate-50 border rounded-xl font-bold"><option value="DEBIT">Setoran</option><option value="KREDIT">Penarikan</option></select>
              <select name="subType" className="w-full p-4 bg-slate-50 border rounded-xl font-bold"><option value="Wajib">Wajib</option><option value="Pokok">Pokok</option><option value="Sukarela">Sukarela</option></select>
          </div>
          <input name="amount" type="number" placeholder="Nominal" className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-lg" required />
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg">SIMPAN</button>
        </form>
      </Modal>
    </div>
  );
};

// --- UB STORE VIEW ---
const StoreView: React.FC<any> = ({ products, setProducts, members, onCheckout, role }) => {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cart, setCart] = useState<{ product: StoreProduct, qty: number }[]>([]);
  const [search, setSearch] = useState('');
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const isAdmin = role === UserRole.ADMIN;

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((acc, item) => acc + (item.product.sellPrice * item.qty), 0);
  const cartHPP = cart.reduce((acc, item) => acc + (item.product.buyPrice * item.qty), 0);
  
  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addToCart = (product: StoreProduct) => {
    if (product.stock <= 0) { alert('Stok Habis!'); return; }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, qty: Math.min(item.qty + 1, product.stock) } : item);
      return [...prev, { product, qty: 1 }];
    });
  };

  const contactAdmin = (productName?: string) => {
    const adminPhone = INITIAL_MEMBERS[0].phone;
    const message = productName ? `Halo Admin, saya ingin membeli: ${productName}. Apakah masih tersedia?` : `Halo Admin UB. Store, saya ingin bertanya perihal produk.`;
    window.open(`https://wa.me/62${adminPhone.substring(1)}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-800">UB. Store</h2><div className="flex gap-2 text-slate-800">{isAdmin ? (<><button onClick={() => { setProductPreview(null); setIsAddProductOpen(true); }} className="p-3 bg-white text-emerald-600 rounded-2xl border shadow-sm active:scale-95 transition-all"><Package size={20} /></button><button onClick={() => setIsCheckoutOpen(true)} className="relative bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"><ShoppingCart size={18} /> POS{cart.length > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cart.reduce((a,b)=>a+b.qty, 0)}</span>}</button></>) : (<button onClick={() => contactAdmin()} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center gap-2 active:scale-95 transition-all"><MessageCircle size={18} /> HUBUNGI ADMIN</button>)}</div></div>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input placeholder="Cari barang..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm outline-none focus:border-emerald-500 text-slate-800" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map((p: StoreProduct) => (
          <div key={p.id} className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
            {isAdmin && (<div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingProduct(p); setProductPreview(p.image); setIsEditProductOpen(true); }} className="p-2 bg-white text-blue-600 rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all"><Edit size={14} /></button><button onClick={() => { if(window.confirm('Hapus produk ini?')) setProducts(products.filter(item => item.id !== p.id)); }} className="p-2 bg-white text-rose-600 rounded-xl shadow-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={14} /></button></div>)}
            <div className="aspect-square bg-slate-50 rounded-[1.5rem] mb-3 flex items-center justify-center overflow-hidden border"><img src={p.image || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`} className="object-cover w-full h-full" alt={p.name} /></div>
            <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
            <p className="text-emerald-700 font-black text-xs">Rp {formatIDR(p.sellPrice)}</p>
            <div className="flex justify-between items-center mt-2 text-slate-800"><span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${p.stock > 5 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>STOK: {p.stock}</span>{isAdmin ? (<button onClick={() => addToCart(p)} className="p-2 text-emerald-600 active:scale-90 transition-transform"><Plus size={18} /></button>) : (<button onClick={() => contactAdmin(p.name)} className="p-2 text-emerald-600 bg-emerald-50 rounded-xl active:scale-90 transition-transform"><MessageCircle size={16} /></button>)}</div>
          </div>
        ))}
        {filteredProducts.length === 0 && <div className="col-span-2 py-20 text-center text-slate-300 italic text-xs">Produk tidak ditemukan atau belum ada barang di rak.</div>}
      </div>

      <Modal title="Tambah Produk Baru" isOpen={isAddProductOpen} onClose={() => { setIsAddProductOpen(false); setProductPreview(null); }}>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const np: StoreProduct = { id: `P-${Date.now()}`, name: fd.get('name') as string, buyPrice: parseInt(fd.get('buyPrice') as string), sellPrice: parseInt(fd.get('sellPrice') as string), stock: parseInt(fd.get('stock') as string), category: fd.get('category') as string, image: productPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${fd.get('name')}` }; setProducts([...products, np]); setIsAddProductOpen(false); setProductPreview(null); alert('Produk berhasil ditambahkan!'); }} className="space-y-4 text-slate-800">
          <div className="flex flex-col items-center mb-4">
            <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative">
              {productPreview ? <img src={productPreview} className="w-full h-full object-cover" /> : <div className="text-slate-400"><ImagePlus size={32} /></div>}
              <input type="file" accept="image/*" onChange={handleProductFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>
          <input name="name" placeholder="Nama Barang" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
          <div className="grid grid-cols-2 gap-4">
            <input name="buyPrice" type="number" placeholder="Harga Beli (Rp)" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
            <input name="sellPrice" type="number" placeholder="Harga Jual (Rp)" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="stock" type="number" placeholder="Stok Awal" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
            <input name="category" placeholder="Kategori" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg">SIMPAN PRODUK</button>
        </form>
      </Modal>

      <Modal title="Edit Produk" isOpen={isEditProductOpen} onClose={() => { setIsEditProductOpen(false); setEditingProduct(null); setProductPreview(null); }}>
        {editingProduct && (
          <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const updated: StoreProduct = { ...editingProduct, name: fd.get('name') as string, buyPrice: parseInt(fd.get('buyPrice') as string), sellPrice: parseInt(fd.get('sellPrice') as string), stock: parseInt(fd.get('stock') as string), category: fd.get('category') as string, image: productPreview || editingProduct.image }; setProducts(products.map(p => p.id === editingProduct.id ? updated : p)); setIsEditProductOpen(false); setEditingProduct(null); setProductPreview(null); alert('Produk diperbarui!'); }} className="space-y-4 text-slate-800">
            <div className="flex flex-col items-center mb-4"><div className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 relative">{productPreview ? <img src={productPreview} className="w-full h-full object-cover" /> : <div className="text-slate-400"><ImagePlus size={32} /></div>}<input type="file" accept="image/*" onChange={handleProductFileChange} className="absolute inset-0 opacity-0 cursor-pointer" /></div></div>
            <input name="name" defaultValue={editingProduct.name} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
            <div className="grid grid-cols-2 gap-4"><input name="buyPrice" type="number" defaultValue={editingProduct.buyPrice} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required /><input name="sellPrice" type="number" defaultValue={editingProduct.sellPrice} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required /></div>
            <div className="grid grid-cols-2 gap-4"><input name="stock" type="number" defaultValue={editingProduct.stock} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required /><input name="category" defaultValue={editingProduct.category} className="w-full p-4 bg-slate-50 border rounded-xl font-bold" /></div>
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black shadow-lg">SIMPAN PERUBAHAN</button>
          </form>
        )}
      </Modal>

      <Modal title="POS Checkout" isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}>
        <div className="space-y-4 text-slate-800">
          <div className="divide-y max-h-[30vh] overflow-y-auto">{cart.map((item, idx) => (<div key={idx} className="py-3 flex justify-between items-center"><div><p className="font-bold text-sm">{item.product.name}</p><p className="text-[10px] text-slate-400">{item.qty} x Rp {formatIDR(item.product.sellPrice)}</p></div><button onClick={() => setCart(cart.filter(c => c.product.id !== item.product.id))} className="text-rose-400 p-2"><Trash2 size={16} /></button></div>))}</div>
          <div className="bg-slate-50 p-5 rounded-2xl flex justify-between items-center"><p className="text-xs font-black text-slate-500 uppercase">Total Bayar</p><p className="text-xl font-black text-emerald-700">Rp {formatIDR(cartTotal)}</p></div>
          <form onSubmit={(e) => { e.preventDefault(); if (cart.length === 0) return; const fd = new FormData(e.currentTarget); const memberId = fd.get('memberId') as string; const member = members.find((m: any) => m.id === memberId); const sale: Sale = { id: `SALE-${Date.now()}`, memberId, memberName: member?.name || 'Umum', items: cart.map(c => ({ productId: c.product.id, name: c.product.name, qty: c.qty, price: c.product.sellPrice })), total: cartTotal, hpp: cartHPP, paymentStatus: fd.get('paymentStatus') as 'Lunas' | 'Piutang', date: new Date().toISOString().split('T')[0], isSHUDistributed: false }; onCheckout(sale); setCart([]); setIsCheckoutOpen(false); alert('Transaksi Berhasil!'); }} className="space-y-4">
            <select name="memberId" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold" required><option value="">-- Pilih Pembeli --</option>{members.map((m: any) => (<option key={m.id} value={m.id}>{m.name}</option>))}</select>
            <select name="paymentStatus" className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold" required><option value="Lunas">Tunai (Lunas)</option><option value="Piutang">Hutang (Piutang)</option></select>
            <button type="submit" disabled={cart.length === 0} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl disabled:opacity-50">PROSES TRANSAKSI</button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

// --- KAS VIEW ---
const KasView: React.FC<any> = ({ transactions, setTransactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = useMemo(() => {
    const cashTrx = transactions.filter((t: any) => t.category !== 'HPP');
    const inTotal = cashTrx.filter((t: any) => t.type === 'DEBIT').reduce((acc: number, t: any) => acc + t.amount, 0);
    const outTotal = cashTrx.filter((t: any) => t.type === 'KREDIT').reduce((acc: number, t: any) => acc + t.amount, 0);
    return { inTotal, outTotal, balance: inTotal - outTotal, data: cashTrx };
  }, [transactions]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-800">Kas Umum</h2><button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg active:scale-95 transition-all"><Plus size={18} /> INPUT</button></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-emerald-100 text-slate-800"><p className="text-[9px] text-emerald-600 font-black uppercase tracking-tight">Masuk</p><p className="text-sm font-black text-emerald-700 truncate">Rp {formatIDR(stats.inTotal)}</p></div>
        <div className="bg-white p-4 rounded-3xl border border-rose-100 text-slate-800"><p className="text-[9px] text-rose-600 font-black uppercase tracking-tight">Keluar</p><p className="text-sm font-black text-rose-700 truncate">Rp {formatIDR(stats.outTotal)}</p></div>
        <div className="bg-emerald-700 p-4 rounded-3xl text-white shadow-lg"><p className="text-[9px] font-black uppercase tracking-tight">Saldo</p><p className="text-sm font-black truncate">Rp {formatIDR(stats.balance)}</p></div>
      </div>
      <div className="bg-white rounded-[2.5rem] border divide-y overflow-hidden shadow-sm">
        {stats.data.slice().reverse().map((t: any) => (<div key={t.id} className="p-5 flex justify-between items-center text-xs text-slate-800"><div><p className="font-bold">{t.description}</p><p className="text-[9px] text-slate-400 uppercase">{t.category} • {t.date}</p></div><p className={`font-black ${t.type === 'DEBIT' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'DEBIT' ? '+' : '-'} Rp {formatIDR(t.amount)}</p></div>))}
        {stats.data.length === 0 && <p className="text-center py-20 text-slate-300 italic text-xs">Belum ada transaksi kas.</p>}
      </div>
      <Modal title="Input Transaksi Kas" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setTransactions([...transactions, { id: `T-${Date.now()}`, type: fd.get('type') as any, description: fd.get('description') as string, amount: parseInt(fd.get('amount') as string), date: new Date().toISOString().split('T')[0], category: 'Lainnya' }]); setIsModalOpen(false); alert('Transaksi kas berhasil disimpan!'); }} className="space-y-4 text-slate-800">
          <select name="type" className="w-full p-4 bg-slate-50 border rounded-xl font-bold"><option value="DEBIT">DANA MASUK</option><option value="KREDIT">DANA KELUAR</option></select>
          <input name="description" placeholder="Keterangan Transaksi" className="w-full p-4 bg-slate-50 border rounded-xl" required />
          <input name="amount" type="number" placeholder="Nominal (Rp)" className="w-full p-4 bg-slate-50 border rounded-xl font-bold text-lg" required />
          <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black shadow-lg">SIMPAN TRANSAKSI</button>
        </form>
      </Modal>
    </div>
  );
};

// --- LAPORAN KEUANGAN ---
const LaporanKeuangan: React.FC<any> = ({ transactions, products, sales, shuPool }) => {
  const [activeSubTab, setActiveSubTab] = useState<'neraca' | 'labarugi' | 'aruskas'>('labarugi');
  const stats = useMemo(() => {
    const totalPenjualan = sales.reduce((acc: number, s: any) => acc + s.total, 0);
    const totalHPP = sales.reduce((acc: number, s: any) => acc + s.hpp, 0);
    const totalBebanOps = transactions.filter((t: any) => t.category === 'Biaya Operasional').reduce((acc: number, t: any) => acc + t.amount, 0);
    const labaBersih = totalPenjualan - totalHPP - totalBebanOps;
    const kasUtama = transactions.filter(t => t.category !== 'HPP').reduce((acc: number, t: any) => t.type === 'DEBIT' ? acc + t.amount : acc - t.amount, 0);
    const piutangToko = sales.filter(s => s.paymentStatus === 'Piutang').reduce((acc: number, s: any) => acc + s.total, 0);
    const persediaanBarang = products.reduce((acc: number, p: any) => acc + (p.stock * p.buyPrice), 0);
    const totalAset = kasUtama + piutangToko + persediaanBarang;
    const totalSimpanan = transactions.filter(t => t.category === 'Simpanan').reduce((acc: number, t: any) => t.type === 'DEBIT' ? acc + t.amount : acc - t.amount, 0);
    const totalAlokasiSHU = (Object.values(shuPool) as number[]).reduce((a, b) => a + b, 0);
    const liabilitasEkuitas = totalSimpanan + totalAlokasiSHU;
    const masukSimpanan = transactions.filter(t => t.category === 'Simpanan' && t.type === 'DEBIT').reduce((a, b) => a + b.amount, 0);
    const keluarSimpanan = transactions.filter(t => t.category === 'Simpanan' && t.type === 'KREDIT').reduce((a, b) => a + b.amount, 0);
    const masukPenjualan = sales.filter(s => s.paymentStatus === 'Lunas').reduce((a, b) => a + b.total, 0);
    const keluarSHU = transactions.filter(t => t.category === 'SHU').reduce((a, b) => a + b.amount, 0);
    return { totalPenjualan, totalHPP, totalBebanOps, labaBersih, kasUtama, piutangToko, persediaanBarang, totalAset, totalSimpanan, totalAlokasiSHU, liabilitasEkuitas, masukSimpanan, keluarSimpanan, masukPenjualan, keluarSHU };
  }, [transactions, sales, products, shuPool]);
  const ReportRow = ({ label, value, isBold = false, isNegative = false }: any) => (<div className={`flex justify-between items-center py-2.5 text-xs ${isBold ? 'font-black text-slate-800' : 'text-slate-600'}`}><span>{label}</span><span className={isNegative ? 'text-rose-600' : ''}>{isNegative && '- '}Rp {formatIDR(value)}</span></div>);
  const SectionTitle = ({ icon, label }: any) => (<div className="flex items-center gap-2 mb-3 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">{icon} {label}</div>);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">Laporan Keuangan</h2>
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        {[{ id: 'neraca', label: 'Neraca', icon: <Scale size={14} /> }, { id: 'labarugi', label: 'Laba Rugi', icon: <Activity size={14} /> }, { id: 'aruskas', label: 'Arus Kas', icon: <ArrowDownUp size={14} /> }].map(tab => (<button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>{tab.icon} {tab.label}</button>))}
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        {activeSubTab === 'neraca' && (<div className="space-y-2"><SectionTitle icon={<TrendingUp size={14} />} label="Aset (Harta)" /><ReportRow label="Kas Utama" value={stats.kasUtama} /><ReportRow label="Piutang Toko" value={stats.piutangToko} /><ReportRow label="Persediaan Barang" value={stats.persediaanBarang} /><div className="pt-2 mt-2 border-t-2 border-emerald-50"><ReportRow label="TOTAL ASET" value={stats.totalAset} isBold /></div><SectionTitle icon={<ShieldCheck size={14} />} label="Liabilitas & Ekuitas" /><ReportRow label="Simpanan Anggota" value={stats.totalSimpanan} /><ReportRow label="Saldo SHU Tersedia" value={stats.totalAlokasiSHU} /><div className="pt-2 mt-2 border-t-2 border-emerald-50"><ReportRow label="TOTAL LIABILITAS & EKUITAS" value={stats.liabilitasEkuitas} isBold /></div></div>)}
        {activeSubTab === 'labarugi' && (<div className="space-y-2"><SectionTitle icon={<ArrowUpCircle size={14} />} label="Pendapatan" /><ReportRow label="Penjualan UB. Store" value={stats.totalPenjualan} /><SectionTitle icon={<ArrowDownCircle size={14} />} label="Beban Pokok & Operasional" /><ReportRow label="HPP (Modal Barang)" value={stats.totalHPP} isNegative /><ReportRow label="Biaya Operasional (20%)" value={stats.totalBebanOps} isNegative /><div className="pt-4 mt-4 border-t-2 border-emerald-100"><div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl"><span className="text-[10px] font-black text-emerald-800 uppercase">Laba Bersih</span><span className="text-xl font-black text-emerald-700">Rp {formatIDR(stats.labaBersih)}</span></div></div></div>)}
        {activeSubTab === 'aruskas' && (<div className="space-y-2"><SectionTitle icon={<PlusCircle size={14} />} label="Arus Kas Masuk" /><ReportRow label="Setoran Simpanan" value={stats.masukSimpanan} /><ReportRow label="Penjualan Tunai / Pelunasan" value={stats.masukPenjualan} /><SectionTitle icon={<MinusCircle size={14} />} label="Arus Kas Keluar" /><ReportRow label="Penarikan Simpanan" value={stats.keluarSimpanan} isNegative /><ReportRow label="Biaya Operasional" value={stats.totalBebanOps} isNegative /><ReportRow label="Penarikan SHU" value={stats.keluarSHU} isNegative /><div className="pt-4 mt-4 border-t-2 border-slate-100"><div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><span className="text-[10px] font-black text-slate-500 uppercase">Saldo Kas Akhir</span><span className="text-xl font-black text-slate-800">Rp {formatIDR(stats.kasUtama)}</span></div></div></div>)}
      </div>
      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shrink-0"><Info size={20} /></div><p className="text-[11px] text-blue-700 leading-relaxed font-medium text-slate-800">Laporan keuangan disusun secara otomatis berdasarkan data transaksi real-time.</p></div>
    </div>
  );
};

// --- SHU VIEW ---
const SHUView: React.FC<any> = ({ shuPool, memberShu, user, role, onDistributeSavingsSHU, onWithdrawSHU, members, transactions }) => {
  const isAdmin = role === UserRole.ADMIN;
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const totalSHU = (Object.values(shuPool) as number[]).reduce((a: number, b: number) => a + b, 0);
  const myEarning = memberShu.find((m: any) => m.memberId === user.id);
  const myShuHistory = useMemo(() => transactions.filter((t: any) => t.category === 'SHU' && t.description.includes(user.name)), [transactions, user.name]);
  const totalMyShu = (myEarning?.jasaModal || 0) + (myEarning?.jasaTransaksi || 0);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-slate-800">Sisa Hasil Usaha</h2>{isAdmin && <div className="flex gap-2"><button onClick={() => onDistributeSavingsSHU()} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-all"><Gift size={14} /> BAGIKAN</button><button onClick={() => setIsWithdrawModalOpen(true)} className="bg-rose-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-all"><Banknote size={14} /> TARIK</button></div>}</div>
      <div className="bg-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group"><div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div><p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Total Sisa Hasil Usaha (SHU)</p><h3 className="text-4xl font-black mt-1">Rp {formatIDR(isAdmin ? totalSHU : totalMyShu)}</h3></div>
      {!isAdmin && (<div className="space-y-6"><div className="grid grid-cols-2 gap-4"><div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SHU Simpanan</p><p className="text-lg font-black">Rp {formatIDR(myEarning?.jasaModal || 0)}</p></div><div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-slate-800"><p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SHU Transaksi</p><p className="text-lg font-black">Rp {formatIDR(myEarning?.jasaTransaksi || 0)}</p></div></div><div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm"><div className="p-5 border-b bg-slate-50/50 text-slate-800 font-black text-xs uppercase">Riwayat Penarikan</div><div className="divide-y">{myShuHistory.map((t:any) => (<div key={t.id} className="p-4 flex justify-between items-center text-xs text-slate-800"><div><p className="font-bold">{t.description}</p><p className="text-[10px] text-slate-400">{t.date}</p></div><p className="font-black text-rose-600">- Rp {formatIDR(t.amount)}</p></div>))}{myShuHistory.length === 0 && <p className="text-center py-10 text-slate-300 italic text-xs">Belum ada riwayat penarikan.</p>}</div></div></div>)}
      {isAdmin && (<div className="space-y-6 text-slate-800"><div className="bg-white p-6 rounded-3xl border space-y-3 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Rincian Pool SHU</p>{Object.entries(shuPool).map(([key, val]) => (<div key={key} className="flex justify-between text-xs"><span className="font-bold text-slate-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span><span className="font-black">Rp {formatIDR(val as number)}</span></div>))}</div><div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm"><div className="p-5 border-b bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase">Alokasi Anggota</div><div className="divide-y max-h-[40vh] overflow-y-auto">{memberShu.map(ms => { const m = members.find(mb => mb.id === ms.memberId); return (<div key={ms.memberId} className="p-4 flex justify-between items-center text-xs"><div><p className="font-bold text-slate-800">{m?.name || ms.memberId}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Modal: {formatIDR(ms.jasaModal)} • Trx: {formatIDR(ms.jasaTransaksi)}</p></div><p className="font-black text-indigo-700">Rp {formatIDR(ms.jasaModal + ms.jasaTransaksi)}</p></div>);})}{memberShu.length === 0 && <p className="text-center py-10 text-slate-300 italic text-xs">Belum ada alokasi.</p>}</div></div></div>)}
      <Modal title="Form Penarikan SHU" isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); onWithdrawSHU(fd.get('mId') as string, parseInt(fd.get('amount') as string), fd.get('type') as string); setIsWithdrawModalOpen(false); }} className="space-y-4 text-slate-800">
            <select name="mId" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required><option value="">-- Pilih Anggota --</option>{memberShu.map(ms => { const m = members.find(mb => mb.id === ms.memberId); if(ms.jasaModal + ms.jasaTransaksi <= 0) return null; return <option key={ms.memberId} value={ms.memberId}>{m?.name} (Saldo: Rp {formatIDR(ms.jasaModal + ms.jasaTransaksi)})</option> })}</select>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Jenis SHU</label><select name="type" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required><option value="BOTH">Total SHU (Keduanya)</option><option value="MODAL">SHU Simpanan (Jasa Modal)</option><option value="TRANSAKSI">SHU Transaksi (Jasa Transaksi)</option></select></div>
            <input name="amount" type="number" placeholder="Nominal Penarikan (Rp)" className="w-full p-4 bg-slate-50 border rounded-xl font-black text-lg text-rose-700" required />
            <button type="submit" className="w-full bg-rose-600 text-white py-4 rounded-xl font-black shadow-lg">PROSES PENARIKAN</button>
        </form>
      </Modal>
    </div>
  );
};

// --- HUTANG VIEW ---
const HutangView: React.FC<any> = ({ sales, user, role, onPay }) => {
  const isAdmin = role === UserRole.ADMIN;
  const list = isAdmin ? sales.filter((s:any)=>s.paymentStatus === 'Piutang') : sales.filter((s:any)=>s.memberId === user.id && s.paymentStatus === 'Piutang');
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-800">{isAdmin ? 'Semua Piutang Toko' : 'Hutang Toko Saya'}</h2>
      <div className="space-y-4 text-slate-800">
        {list.map((s:any)=>(
          <div key={s.id} className="bg-white p-5 rounded-[2rem] border shadow-sm flex justify-between items-center">
            <div><p className="font-bold">{s.memberName}</p><p className="text-[10px] text-slate-400">{s.id} • {s.date}</p><p className="text-rose-600 font-black">Rp {formatIDR(s.total)}</p></div>
            {isAdmin && <button onClick={()=>onPay(s.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold">BAYAR</button>}
          </div>
        ))}
        {list.length === 0 && <p className="text-center py-20 text-slate-300 italic text-xs">Semua hutang sudah lunas!</p>}
      </div>
    </div>
  );
};

// --- PROFILE EDIT ---
const ProfileEdit: React.FC<any> = ({ user, onUpdate }) => {
  const [profileData, setProfileData] = useState({ name: user.name, phone: user.phone, address: user.address, avatar: user.avatar, password: user.password });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setProfileData(prev => ({ ...prev, avatar: reader.result as string })); reader.readAsDataURL(file); } };
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col items-center">
        <div className="relative group"><img src={profileData.avatar} className="w-28 h-28 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover" /><label className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-2xl shadow-lg cursor-pointer active:scale-90 transition-transform"><Camera size={18} /><input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" /></label></div>
        <h2 className="text-xl font-black mt-4 text-slate-800">{user.name}</h2><p className="text-[10px] text-emerald-600 font-bold uppercase mt-1 tracking-widest">{user.role}</p>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 space-y-5 shadow-sm text-slate-800">
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Lengkap</label><input value={profileData.name} onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border outline-none" /></div>
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">WhatsApp</label><input value={profileData.phone} onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border outline-none" /></div>
        <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Alamat</label><textarea value={profileData.address} onChange={e => setProfileData(prev => ({ ...prev, address: e.target.value }))} rows={2} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border outline-none" /></div>
        <div className="pt-4 border-t border-slate-50"><button onClick={() => setIsChangingPassword(!isChangingPassword)} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Lock size={14} /> {isChangingPassword ? 'BATAL GANTI PASSWORD' : 'GANTI KATA SANDI'}</button>{isChangingPassword && (<div className="mt-4 space-y-1 animate-in slide-in-from-top-2"><label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password Baru</label><div className="relative"><input type={showPass ? "text" : "password"} value={profileData.password} onChange={e => setProfileData(prev => ({ ...prev, password: e.target.value }))} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border outline-none pr-12" /><button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>)}</div>
        <button onClick={() => { onUpdate({ ...user, ...profileData }); alert('Profil berhasil diperbarui!'); }} className="w-full bg-emerald-700 text-white py-5 rounded-[1.8rem] font-black shadow-xl uppercase active:scale-95 transition-all mt-4">SIMPAN PERUBAHAN</button>
      </div>
      <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 flex items-center justify-between"><div className="flex flex-col"><p className="text-[10px] text-rose-400 font-black uppercase">Waktu Bergabung</p><p className="font-bold text-rose-900">{new Date(user.joinedDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div><div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm"><Sparkles size={20} /></div></div>
    </div>
  );
};

export default App;
