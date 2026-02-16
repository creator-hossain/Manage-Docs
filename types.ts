
export enum DocumentType {
  INVOICE = 'INVOICE',
  QUOTATION = 'QUOTATION',
  BILL = 'BILL',
  CHALLAN = 'CHALLAN',
  PRO_INVOICE = 'PRO_INVOICE'
}

export enum AssetType {
  LOGO = 'LOGO',
  ICON = 'ICON',
  SIGNATURE = 'SIGNATURE',
  PRODUCT = 'PRODUCT'
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  dataUrl: string;
  createdAt: number;
}

export interface PaymentEntry {
  id: string;
  date: string;
  amount: number;
  note: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  imageUrl?: string;
  imageSize: 'small' | 'medium' | 'large';
  quantity: number;
  unitPrice: number;
}

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  docNumber: string;
  date: string;
  logoUrl?: string;
  logoSize?: number;
  logoPosition?: number;
  clientName: string;
  clientDesignation?: string;
  clientOffice?: string;
  clientAddress: string;
  clientPhone?: string;
  acName?: string;
  vehicleTitle?: string;
  vehicleTitleSize?: number;
  // Added vehicleTitleAlign to fix type errors in components
  vehicleTitleAlign?: 'left' | 'center' | 'right' | 'justify';
  brand?: string;
  model?: string;
  yearModel?: string;
  color?: string;
  chassisNumber?: string;
  engineNumber?: string;
  auctionPoint?: string;
  cc?: string;
  fuel?: string;
  transmission?: string;
  vehiclePrice: number;
  priceInWords?: string;
  payments: PaymentEntry[];
  advancedPaidAmount?: number;
  bankPaymentAmount?: number;
  bankName?: string;
  quantity: number;
  taxRate: number;
  notes?: string;
  bankDetails?: string;
  validUntil?: string;
  createdAt: number;
  updatedAt?: number;
  hiddenFields?: string[];
  productImageUrl?: string;
  items?: InvoiceItem[];
}
