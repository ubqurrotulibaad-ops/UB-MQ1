
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Store, 
  BarChart3, 
  PieChart, 
  FileText, 
  UserCircle,
  Users2,
  ShoppingCart,
  ClipboardList,
  HandCoins,
  History
} from 'lucide-react';

export const ADMIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'anggota', label: 'Anggota', icon: <Users size={20} /> },
  { id: 'simpanan', label: 'Simpanan', icon: <Wallet size={20} /> },
  { id: 'store', label: 'UB. Store', icon: <Store size={20} /> },
  { id: 'kas', label: 'Kas Umum', icon: <BarChart3 size={20} /> },
  { id: 'keuangan', label: 'Laporan Keuangan', icon: <FileText size={20} /> },
  { id: 'shu', label: 'Laporan SHU', icon: <PieChart size={20} /> },
];

export const MEMBER_MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'sahabat', label: 'Sahabat UB', icon: <Users2 size={20} /> },
  { id: 'simpanan-saya', label: 'Simpanan Saya', icon: <Wallet size={20} /> },
  { id: 'store', label: 'UB. Store', icon: <Store size={20} /> },
  { id: 'hutang-saya', label: 'Hutang Saya', icon: <History size={20} /> },
  { id: 'shu-saya', label: 'SHU Saya', icon: <PieChart size={20} /> },
  { id: 'profil', label: 'Profil Saya', icon: <UserCircle size={20} /> },
];
