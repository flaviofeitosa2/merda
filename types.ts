export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  promotional_price?: number;
  cost?: number;
  unit?: string;
  description?: string;
  image: string;
  stock?: number;
  min_stock?: number;
  manage_stock?: boolean;
  is_catalog?: boolean;
  is_favorite?: boolean;
  company_id?: string;
  is_subscription_trigger?: boolean;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
  subscriptionReconciliationId?: string;
  period_name?: string;
}

export interface Category {
  id: string;
  name: string;
  company_id?: string;
}

export type PaymentMethod = 'money' | 'debit' | 'credit' | 'others' | 'pix' | 'credit_tab' | 'link';

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
  wallet_id?: string;
}

export interface Sale {
  id: string;
  code: string;
  date: string;
  clientName: string;
  customerId?: string;
  clientCpf?: string;
  sellerName: string;
  items: CartItem[];
  subtotal?: number;
  discount?: number;
  total: number;
  paymentMethod: PaymentMethod;
  payments?: PaymentDetail[];
  change?: number;
  status: 'completed' | 'cancelled' | 'pending';
  notes?: string;
  company_id?: string;
  is_subscription_payment?: boolean;
  reconciled_subscription_id?: string;
}

export interface Customer {
  id: string;
  avatarText: string;
  name: string;
  fantasyName?: string;
  socialReason?: string;
  phone: string;
  email: string;
  balance: number;
  cpf?: string;
  cnpj?: string;
  notes?: string;
  address?: string;
  complement?: string;
  allowTab?: boolean;
  createdAt?: string;
  company_id?: string;
  isSubscriber?: boolean;
  isPartner?: boolean;
  digital_certificate_url?: string;
  first_password?: string;
}

export type UserRole = 'owner' | 'admin' | 'operator' | 'master' | 'customer';

export interface OperatorPermissions {
  dashboard: boolean;
  goals: boolean;
  pos: boolean;
  orders: boolean;
  products: boolean;
  stock: boolean;
  customers: boolean;
  finance: boolean;
  history: boolean;
  users: boolean;
  settings: boolean;
  subscriptions: boolean;
  stats: boolean;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  company_id: string;
  email?: string;
  customer_id?: string;
}

export interface Company {
  id: string;
  name: string;
  owner_id?: string;
  social_reason?: string;
  cnpj?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  address?: string;
  complement?: string;
  currency?: string;
  show_decimals?: boolean;
  logo_url?: string;
  cancelled_sales_visibility?: 'strike' | 'hide';
  wallet_settings?: Record<string, string | string[]>;
  permissions?: {
    operator: OperatorPermissions;
  };
  subscription_status?: 'active' | 'inactive' | 'blocked';
  subscription_plan?: string;
  next_due_date?: string | null;
  created_at?: string;
  type: 'client' | 'reseller';
  parent_company_id?: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  id_da_empresa: string;
}

export interface ResellerSettings {
  id?: string;
  company_id: string;
  custom_logo_url?: string;
  custom_primary_color?: string;
  custom_domain?: string;
  support_email?: string;
  support_phone?: string;
  custom_branding_enabled?: boolean;
  max_clients_allowed?: number;
  commission_percentage?: number;
}

export interface Subscription {
  id: string;
  customer_id: string;
  status: 'active' | 'cancelled';
  start_date: string;
  end_date: string;
  payment_date?: string | null;
  value: number;
  provider: string;
  frequency: string;
  commission_payment_date?: string | null;
  referral?: string;
  commission_value?: number;
  company_id?: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  company_id: string;
  initial_balance?: number;
  brand?: string;
  closing_day?: number;
  due_day?: number;
  bank_account_id?: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  company_id: string;
  color?: string;
  icon?: string;
  parent_id?: string | null;
  created_at?: string;
  description?: string;
}

export interface FinanceTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  wallet_id: string;
  target_wallet_id?: string | null;
  category_id?: string | null;
  date: string;
  status: 'paid' | 'pending' | 'cancelled';
  company_id: string;
  notes?: string;
  is_fixed?: boolean;
  installments_count?: number;
  tags?: string[];
  origin?: 'manual' | 'pos' | 'transfer';
}

export interface UserGoal {
  id: string;
  user_id: string | null;
  target_value: number;
  commission_percentage?: number;
  month: number;
  year: number;
  company_id: string;
}