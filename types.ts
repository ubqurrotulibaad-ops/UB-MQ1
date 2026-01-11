
export enum UserRole {
  ADMIN = 'ADMIN',
  ANGGOTA = 'ANGGOTA'
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  password?: string;
  status?: string;
  address: string;
  joinedDate: string;
  avatar?: string;
}

export interface StoreProduct {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  image: string;
  category: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Sale {
  id: string;
  memberId: string;
  memberName: string;
  items: SaleItem[];
  total: number;
  paymentStatus: 'Lunas' | 'Piutang';
  date: string;
  isSHUDistributed: boolean;
  hpp: number;
}

export interface Transaction {
  id: string;
  type: 'DEBIT' | 'KREDIT';
  description: string;
  amount: number;
  date: string;
  category: 'Simpanan' | 'Penjualan' | 'HPP' | 'Biaya Operasional' | 'SHU' | 'Lainnya';
}

export interface SHUPool {
  jasaModal: number;
  jasaTransaksi: number;
  pengurus: number;
  cadanganModal: number;
  infaqMQI: number;
}

export interface MemberSHU {
  memberId: string;
  jasaModal: number;
  jasaTransaksi: number;
}
