
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, supabaseUrl } from './supabaseClient';
import { 
  Product, 
  Category, 
  CartItem, 
  Customer, 
  Sale, 
  PaymentDetail, 
  UserProfile,
  Company,
  FinanceTransaction,
  Subscription,
  Wallet,
  FinanceCategory
} from './types';

import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import PaymentScreen from './components/PaymentScreen';
import OrdersScreen from './components/OrdersScreen';
import ProductsScreen from './components/ProductsScreen';
import CustomersScreen from './components/CustomersScreen';
import PartnersScreen from './components/PartnersScreen';
import SubscriptionList from './components/SubscriptionList';
import HistoryScreen from './components/HistoryScreen';
import FinanceScreen from './components/FinanceScreen';
import UsersScreen from './components/UsersScreen';
import SettingsScreen from './components/SettingsScreen';
import AdminMasterScreen from './components/AdminMasterScreen';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import SaleSuccessNotification from './components/SaleSuccessNotification';
import SubscriberPortal from './components/SubscriberPortal';
import AISalesIntelligence from './components/AISalesIntelligence';
import StatsScreen from './components/StatsScreen';
import GoalsScreen from './components/GoalsScreen';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const isInitialAuth = useRef(true);
  const sessionRef = useRef<any>(null);
  const userProfileRef = useRef<UserProfile | null>(null);
  const lastFetchedUserIdRef = useRef<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('userProfile');
    const profile = saved ? JSON.parse(saved) : null;
    return profile;
  });

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);
  const [companyData, setCompanyData] = useState<Company | null>(() => {
    const saved = localStorage.getItem('companyData');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
    else localStorage.removeItem('userProfile');
  }, [userProfile]);

  useEffect(() => {
    if (companyData) localStorage.setItem('companyData', JSON.stringify(companyData));
    else localStorage.removeItem('companyData');
  }, [companyData]);
  const [view, setView] = useState(() => localStorage.getItem('last_view') || 'pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'update-password'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as any) || 'light');
  const [authError, setAuthError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : [];
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);



  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('customers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing customers from localStorage", e);
      return [];
    }
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('sales');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing sales from localStorage", e);
      return [];
    }
  });

  useEffect(() => {
    try {
        // Cache only the last 200 sales to avoid LocalStorage quota limits
        const salesToCache = sales.slice(0, 200); 
        localStorage.setItem('sales', JSON.stringify(salesToCache));
    } catch (e) {
        console.warn('LocalStorage quota exceeded for sales cache');
    }
  }, [sales]);

  useEffect(() => {
    try {
        // Cache only the last 200 customers
        const customersToCache = customers.slice(0, 200);
        localStorage.setItem('customers', JSON.stringify(customersToCache));
    } catch (e) {
        console.warn('LocalStorage quota exceeded for customers cache');
    }
  }, [customers]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [financeWallets, setFinanceWallets] = useState<Wallet[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]); 
  const [portalUserIds, setPortalUserIds] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(() => {
    const saved = localStorage.getItem('selectedCustomer');
    return saved ? JSON.parse(saved) : null;
  });
  const [discount, setDiscount] = useState(() => {
    const saved = localStorage.getItem('discount');
    return saved ? Number(saved) : 0;
  });
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [activeSaleId, setActiveSaleId] = useState<string | null>(() => localStorage.getItem('activeSaleId'));
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (activeSaleId) localStorage.setItem('activeSaleId', activeSaleId);
    else localStorage.removeItem('activeSaleId');
  }, [activeSaleId]);
  const [isCartOpen, setIsCartOpen] = useState(() => {
    const saved = localStorage.getItem('isCartOpen');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('selectedCustomer', JSON.stringify(selectedCustomer));
  }, [selectedCustomer]);

  useEffect(() => {
    localStorage.setItem('discount', discount.toString());
  }, [discount]);

  useEffect(() => {
    localStorage.setItem('isCartOpen', isCartOpen.toString());
  }, [isCartOpen]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    localStorage.setItem('last_view', view);
  }, [view]);

  // Validação de acesso à visualização atual baseada no perfil do usuário
  useEffect(() => {
    if (userProfile && session) {
      const isMaster = userProfile.role === 'master' || userProfile.role === 'mestre';
      const isOwner = userProfile.role === 'owner';
      const isReseller = companyData?.type === 'reseller';
      const isOperator = userProfile.role === 'operator' || userProfile.role === 'operador';

      // Se estiver em uma visualização restrita sem permissão, redireciona para o dashboard ou PDV
      if (view === 'admin_master' && !isMaster) {
        setView('dashboard');
      } else if (view === 'reseller_panel' && !isMaster && !(isOwner && isReseller)) {
        setView('dashboard');
      } else if (isOperator && (view === 'users' || view === 'settings' || view === 'finance' || view === 'admin_master' || view === 'reseller_panel')) {
        setView('pos');
      }
    }
  }, [userProfile, companyData, view, session]);

  useEffect(() => {
    // Verificar erros na URL (ex: link de recuperação expirado)
    const hash = window.location.hash;
    
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errorDescription = params.get('error_description');
      if (errorDescription) {
        setAuthError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
        setAuthView('login');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // Detectar explicitamente o início da recuperação de senha pelo hash
    if (hash && hash.includes('type=recovery')) {
      console.log("Recovery hash detected");
      setAuthView('update-password');
    }

    // Tratar o redirecionamento do callback do Supabase
    if (window.location.pathname === '/auth/callback') {
      // Mantemos o hash se existir para o processamento posterior
      window.history.replaceState(null, '', '/' + window.location.hash);
    }

    const initializeAuth = async () => {
      try {
        console.log("Supabase URL used:", supabaseUrl);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found during init:", session.user.id);
        }
        
        // Se houver sessão e for um fluxo de recovery, garante a view correta
        if (session && window.location.hash.includes('type=recovery')) {
          setAuthView('update-password');
        }

        if (error) {
          console.error("Auth session error:", error);
          // Se o token de atualização for inválido ou não encontrado, força o logout para limpar o estado
          if (error.message.includes("Refresh Token Not Found") || error.message.includes("invalid refresh token")) {
            console.warn("Sessão expirada ou inválida, limpando dados locais...");
            try {
              await supabase.auth.signOut();
            } catch (e) {
              console.warn("Error during signOut:", e);
            }
            
            // Limpeza agressiva de possíveis tokens residuais
            Object.keys(localStorage).forEach(key => {
              if (key.includes('supabase.auth.token') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });
            
            setSession(null);
            setUserProfile(null);
            setCompanyData(null);
            return;
          }
        }
        setSession(session);
        sessionRef.current = session;
        if (session) await fetchUserProfile(session.user.id);
      } catch (err: any) {
        console.error("Auth initialization failed:", err);
        if (err && err.message && (err.message.includes("Refresh Token Not Found") || err.message.includes("invalid refresh token"))) {
          console.warn("Sessão expirada ou inválida (catch), limpando dados locais...");
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.warn("Error during signOut (catch):", e);
          }
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase.auth.token') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
          setSession(null);
          setUserProfile(null);
          setCompanyData(null);
        }
      }
    };
    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session:", !!session);
      const prevSession = sessionRef.current;
      sessionRef.current = session;
      
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update-password');
        // Limpar a URL apenas após confirmar o evento
        window.history.replaceState(null, '', '/');
        return;
      }

      if (event === 'SIGNED_IN' && window.location.hash.includes('type=recovery')) {
        setAuthView('update-password');
        window.history.replaceState(null, '', '/');
        return;
      }

      setSession(session);
      if (session) {
          // Redirecionar para 'pos' apenas se for um login real (transição de sem sessão para com sessão)
          // E não for a verificação inicial de montagem
          if (event === 'SIGNED_IN' && !prevSession && !isInitialAuth.current) {
            setView('pos');
          }
          
          // Só busca o perfil se o ID do usuário mudou ou se não temos o perfil em memória
          if (!userProfileRef.current || userProfileRef.current.id !== session.user.id) {
            fetchUserProfile(session.user.id);
          }
      } else {
          setUserProfile(null);
          // Não reseta para landing se estivermos em recovery
          setAuthView(prev => prev === 'update-password' ? 'update-password' : 'landing');
          
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('userProfile');
            localStorage.removeItem('companyData');
            lastFetchedUserIdRef.current = null;
          }
      }
      isInitialAuth.current = false;
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
      if (lastFetchedUserIdRef.current === userId) return;
      lastFetchedUserIdRef.current = userId;

      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
          const profile = data as UserProfile;
          console.log("UserProfile fetched:", profile);
          setUserProfile(profile);
          if (profile.company_id) {
              console.log("Fetching company and data for:", profile.company_id);
              fetchCompanyData(profile.company_id);
              fetchData(profile.company_id, products.length > 0);
          } else {
              console.warn("User has no company_id!");
          }
      } else {
          console.error("No profile found for user:", userId);
      }
  };

  const fetchCompanyData = async (companyId: string) => {
      const { data } = await supabase.from('companies').select('*').eq('id', companyId).maybeSingle();
      if (data) setCompanyData(data as Company);
  };

  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`LocalStorage quota exceeded for key: ${key}. Data not cached.`);
    }
  };

  const fetchData = useCallback(async (companyId: string, silent = false, options?: { only?: ('products' | 'customers' | 'sales' | 'finance' | 'users' | 'wallets' | 'product_categories' | 'finance_categories' | 'subscriptions')[] }) => {
      console.log("Iniciando busca de dados para a empresa:", companyId, options?.only ? `(Apenas: ${options.only.join(', ')})` : '(Tudo)');
      try {
        const fetchAll = options?.only || ['products', 'customers', 'sales', 'finance', 'users', 'wallets', 'product_categories', 'finance_categories', 'subscriptions'];
        
        if (!silent) setLoadingProducts(true);
        
        const tasks: Promise<any>[] = [];

        // 1. Produtos e Categorias de Produtos
        if (fetchAll.includes('products') || fetchAll.includes('product_categories')) {
          const p1 = supabase.from('products').select('*').eq('company_id', companyId).order('name').range(0, 1000);
          const p2 = supabase.from('categories').select('*').eq('company_id', companyId).order('name');
          
          const criticalTask = Promise.all([p1, p2]).then(([prodRes, catRes]) => {
            if (prodRes.data) {
                setProducts(prodRes.data);
                safeSetItem('products', JSON.stringify(prodRes.data.slice(0, 500)));
            }
            if (catRes.data) setCategories(catRes.data);
            if (!silent) setLoadingProducts(false);
          });
          tasks.push(criticalTask);
        } else {
          if (!silent) setLoadingProducts(false);
        }

        // 2. Auxiliares (Clientes, Financeiro, Usuários)
        if (fetchAll.includes('customers') || fetchAll.includes('subscriptions') || fetchAll.includes('users') || fetchAll.includes('wallets') || fetchAll.includes('finance_categories')) {
          const fetchCustomers = supabase.from('customers').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).range(0, 2000);
          const fetchSubs = supabase.from('subscriptions').select('*').eq('company_id', companyId).order('end_date', { ascending: true });
          const fetchProfs = supabase.from('profiles').select('*').eq('company_id', companyId).neq('role', 'customer').order('full_name');
          const fetchPortal = supabase.from('profiles').select('customer_id').eq('company_id', companyId).eq('role', 'customer');
          const fetchWallets = supabase.from('wallets').select('*').eq('company_id', companyId).order('name');
          const fetchFinCat = supabase.from('finance_categories').select('*').eq('company_id', companyId).order('name');

          tasks.push(Promise.allSettled([fetchCustomers, fetchSubs, fetchProfs, fetchPortal, fetchWallets, fetchFinCat]).then(results => {
            const [custRes, subRes, profRes, portalRes, wallRes, catRes] = results;

            if (custRes.status === 'fulfilled' && custRes.value.data) {
                setCustomers(custRes.value.data.map((c: any) => ({ 
                    ...c, 
                    balance: Number(c.balance || 0), 
                    isSubscriber: c.is_subscriber, 
                    isPartner: c.is_partner, 
                    createdAt: c.created_at,
                    fantasyName: c.fantasy_name,
                    socialReason: c.social_reason,
                    allowTab: c.allow_tab,
                    digital_certificate_url: c.digital_certificate_url,
                    first_password: c.first_password
                })));
            }
            if (subRes.status === 'fulfilled' && subRes.value.data) setSubscriptions(subRes.value.data);
            if (profRes.status === 'fulfilled' && profRes.value.data) setUsers(profRes.value.data as UserProfile[]);
            if (portalRes.status === 'fulfilled' && portalRes.value.data) {
              const ids = new Set(portalRes.value.data.map((p: any) => p.customer_id).filter(Boolean) as string[]);
              setPortalUserIds(ids);
            }
            if (wallRes.status === 'fulfilled' && wallRes.value.data) {
                setFinanceWallets(wallRes.value.data.map((w: any) => ({ ...w, balance: Number(w.balance || 0) })));
            }
            if (catRes.status === 'fulfilled' && catRes.value.data) {
                setFinanceCategories(catRes.value.data as FinanceCategory[]);
            }
          }));
        }

        // 3. Histórico (Paginação)
        const fetchPaginated = async (table: string, orderCol: string, ascending: boolean = false, maxRecords: number = 5000) => {
            let allData: any[] = [];
            let from = 0;
            const pageSize = 1000;
            let hasMore = true;
            while (hasMore) {
                const { data, error } = await supabase.from(table).select('*').eq('company_id', companyId).order(orderCol, { ascending }).range(from, from + pageSize - 1);
                if (error || !data || data.length === 0) { hasMore = false; break; }
                allData = [...allData, ...data];
                if (data.length < pageSize || allData.length >= maxRecords) hasMore = false;
                else from += pageSize;
            }
            return allData;
        };

        if (fetchAll.includes('sales')) {
            tasks.push(fetchPaginated('sales', 'date', false, 10000).then(salesData => {
                const mappedSales = salesData.map((s: any) => ({
                    ...s, 
                    total: Number(s.total || 0),
                    clientName: s.client_name, 
                    sellerName: s.seller_name, 
                    customerId: s.customer_id,
                    paymentMethod: s.payment_method,
                    items: typeof s.items === 'string' ? JSON.parse(s.items) : (s.items || []),
                    payments: typeof s.payments === 'string' ? JSON.parse(s.payments) : (s.payments || [])
                }));
                setSales(mappedSales);
                safeSetItem('sales', JSON.stringify(mappedSales.slice(0, 300)));
            }));
        }

        if (fetchAll.includes('finance')) {
            tasks.push(fetchPaginated('finance_transactions', 'date', false, 10000).then(financeData => {
                setFinanceTransactions(financeData as any);
                safeSetItem('finance_transactions', JSON.stringify(financeData.slice(0, 300)));
            }));
        }

        await Promise.all(tasks);
      } catch (err) {
          console.error("Erro crítico na sincronização de dados:", err);
      } finally { 
          setLoadingProducts(false); 
      }
  }, []);

  const pendingOrdersCount = useMemo(() => {
    const isOperator = userProfile?.role === 'operator' || userProfile?.role === 'operador';
    const currentUserName = (userProfile?.full_name || '').trim().toLowerCase();

    return sales.filter(s => {
      if (s.status !== 'pending') return false;
      if (isOperator) {
        const sellerName = (s.sellerName || '').trim().toLowerCase();
        return sellerName === currentUserName;
      }
      return true;
    }).length;
  }, [sales, userProfile]);

  const handleAddCustomer = async (customer: Customer) => {
    console.log("Iniciando handleAddCustomer para:", customer.name);
    if (!userProfile?.company_id) {
      console.error("Erro: userProfile.company_id não encontrado em handleAddCustomer");
      return null;
    }
    
    const payload = {
      name: customer.name.toUpperCase(),
      fantasy_name: customer.fantasyName?.toUpperCase(),
      social_reason: customer.socialReason?.toUpperCase(),
      phone: customer.phone,
      email: customer.email?.toLowerCase(),
      cpf: customer.cpf,
      cnpj: customer.cnpj,
      address: customer.address?.toUpperCase(),
      complement: customer.complement?.toUpperCase(),
      notes: customer.notes,
      allow_tab: customer.allowTab || false,
      is_subscriber: customer.isSubscriber || false,
      is_partner: customer.isPartner || false,
      company_id: userProfile.company_id,
      balance: customer.balance || 0,
      digital_certificate_url: customer.digital_certificate_url,
      first_password: customer.first_password,
      created_at: customer.createdAt || new Date().toISOString()
    };

    console.log("Payload de inserção:", payload);

    const { data, error } = await supabase.from('customers').insert([payload]).select().single();
    
    if (error) {
      console.error("Erro ao adicionar cliente no Supabase:", error);
      console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
      throw error;
    }
    if (data) {
      const mapped = { 
        ...data, 
        isSubscriber: data.is_subscriber, 
        isPartner: data.is_partner, 
        createdAt: data.created_at, 
        fantasyName: data.fantasy_name, 
        socialReason: data.social_reason, 
        allowTab: data.allow_tab, 
        balance: Number(data.balance || 0),
        first_password: data.first_password
      };
      setCustomers(prev => [mapped as any, ...prev]);
      return mapped as any;
    }
    return null;
  };

  const handleUpdateCustomer = async (customer: Customer, silent = false) => {
    if (!userProfile?.company_id) return false;
    const { error } = await supabase.from('customers').update({
        name: customer.name.toUpperCase(), fantasy_name: customer.fantasyName?.toUpperCase(), social_reason: customer.socialReason?.toUpperCase(),
        phone: customer.phone, email: customer.email?.toLowerCase(), cpf: customer.cpf, cnpj: customer.cnpj, address: customer.address?.toUpperCase(),
        complement: customer.complement?.toUpperCase(),
        notes: customer.notes, allow_tab: customer.allowTab, is_subscriber: customer.isSubscriber, is_partner: customer.isPartner, balance: customer.balance,
        digital_certificate_url: customer.digital_certificate_url,
        first_password: customer.first_password,
        created_at: customer.createdAt
      }).eq('id', customer.id);
    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
    fetchData(userProfile.company_id, true, { only: ['customers'] }); 
    return true; 
  };

  const handleImportCustomers = async (customersToImport: Customer[]) => {
    if (!userProfile?.company_id) return;
    
    const formatted = customersToImport.map(c => ({
      name: c.name.toUpperCase(),
      fantasy_name: c.fantasyName?.toUpperCase(),
      social_reason: c.socialReason?.toUpperCase(),
      phone: c.phone,
      email: c.email?.toLowerCase(),
      cpf: c.cpf,
      cnpj: c.cnpj,
      address: c.address?.toUpperCase(),
      complement: c.complement?.toUpperCase(),
      notes: c.notes,
      allow_tab: c.allowTab || false,
      is_subscriber: c.isSubscriber || false,
      is_partner: c.isPartner || false,
      company_id: userProfile.company_id,
      balance: c.balance || 0,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('customers').insert(formatted);
    if (error) {
      console.error("Erro ao importar clientes:", error);
      alert("Erro ao importar alguns clientes. Verifique o console.");
    }
    fetchData(userProfile.company_id, true, { only: ['customers'] });
  };

  const handleDeleteCustomer = async (customerId: string) => {
      if (!userProfile?.company_id) return;

      // Verificar se existem vendas vinculadas
      const { count: salesCount } = await supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customerId);

      if (salesCount && salesCount > 0) {
          throw new Error('ACTIVE_SALES_EXIST');
      }

      // Verificar se existem assinaturas vinculadas
      const { count: subsCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customerId);

      if (subsCount && subsCount > 0) {
          throw new Error('ACTIVE_SUBS_EXIST');
      }

      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) throw error;
      
      fetchData(userProfile.company_id, true, { only: ['customers'] });
  };

  const handleBulkDeleteByDate = async (startDate: string, endDate: string) => {
    if (!userProfile?.company_id) {
      console.error("Erro: company_id não encontrado no perfil do usuário.");
      return { success: false, count: 0 };
    }
    
    try {
      console.log(`Iniciando exclusão em massa para empresa ${userProfile.company_id}`);
      console.log(`Query Supabase: gte(${startDate}) lte(${endDate})`);
      
      // 1. Buscar clientes no período
      // Tentamos uma busca mais flexível caso o formato ISO estrito falhe
      const { data: customersInRange, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, created_at')
        .eq('company_id', userProfile.company_id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (fetchError) {
        console.error("Erro ao buscar clientes no período:", fetchError);
        throw fetchError;
      }
      
      console.log(`Clientes encontrados via query: ${customersInRange?.length || 0}`);
      
      // Se a query retornou 0, vamos tentar buscar todos e filtrar no JS como fallback/debug
      let finalCustomers = customersInRange || [];
      if (finalCustomers.length === 0) {
        console.log("Nenhum cliente encontrado via query. Tentando busca geral para depuração...");
        const { data: allCustomers } = await supabase
          .from('customers')
          .select('id, name, created_at')
          .eq('company_id', userProfile.company_id);
        
        if (allCustomers) {
          console.log(`Total de clientes da empresa: ${allCustomers.length}`);
          
          // Debug: Mostrar as datas dos primeiros e últimos clientes
          console.log("Exemplos de datas de criação (primeiros 5):", allCustomers.slice(0, 5).map(c => c.created_at));
          console.log("Exemplos de datas de criação (últimos 5):", allCustomers.slice(-5).map(c => c.created_at));
          
          // Debug: Mostrar o intervalo real de datas
          const dates = allCustomers.map(c => c.created_at).filter(Boolean).sort();
          if (dates.length > 0) {
            console.log(`Intervalo real de datas na base: ${dates[0]} até ${dates[dates.length - 1]}`);
            
            // Resumo por Ano/Mês
            const distribution: Record<string, number> = {};
            allCustomers.forEach(c => {
              if (c.created_at) {
                const monthYear = c.created_at.substring(0, 7); // YYYY-MM
                distribution[monthYear] = (distribution[monthYear] || 0) + 1;
              }
            });
            console.log("Distribuição de clientes por Mês/Ano:", distribution);
          }

          const filtered = allCustomers.filter(c => {
            if (!c.created_at) return false;
            const cDate = new Date(c.created_at);
            const sDate = new Date(startDate);
            const eDate = new Date(endDate);
            return cDate >= sDate && cDate <= eDate;
          });
          console.log(`Clientes que passariam no filtro de data (Date objects): ${filtered.length}`);
          
          if (filtered.length > 0) {
            console.log("Usando resultados do filtro simplificado.");
            finalCustomers = filtered;
          }
        }
      }
      
      if (finalCustomers.length === 0) {
        console.log("Realmente nenhum cliente encontrado no período.");
        return { success: true, count: 0 };
      }

      let deletedCount = 0;
      let skippedCount = 0;

      console.log(`Processando ${finalCustomers.length} clientes para exclusão...`);

      // Para cada cliente, tentamos deletar
      for (const customer of finalCustomers) {
        try {
          // Verificar vendas
          const { count: salesCount, error: sErr } = await supabase
              .from('sales')
              .select('*', { count: 'exact', head: true })
              .eq('customer_id', customer.id);
          
          if (sErr) console.error(`Erro ao verificar vendas do cliente ${customer.id}:`, sErr);
          if (salesCount && salesCount > 0) throw new Error('ACTIVE_SALES_EXIST');

          // Verificar assinaturas
          const { count: subsCount, error: subErr } = await supabase
              .from('subscriptions')
              .select('*', { count: 'exact', head: true })
              .eq('customer_id', customer.id);

          if (subErr) console.error(`Erro ao verificar assinaturas do cliente ${customer.id}:`, subErr);
          if (subsCount && subsCount > 0) throw new Error('ACTIVE_SUBS_EXIST');

          const { error: deleteError } = await supabase.from('customers').delete().eq('id', customer.id);
          if (deleteError) throw deleteError;
          
          deletedCount++;
        } catch (e: any) {
          console.warn(`Cliente ${customer.name} (${customer.id}) ignorado: ${e.message}`);
          skippedCount++;
        }
      }

      await fetchData(userProfile.company_id, true);
      console.log(`Exclusão finalizada: ${deletedCount} removidos, ${skippedCount} ignorados.`);
      return { success: true, count: deletedCount, skipped: skippedCount };
    } catch (error) {
      console.error("Erro crítico na exclusão em massa:", error);
      return { success: false, count: 0 };
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (!userProfile?.company_id) return false;
    
    // Remover o ID para garantir que o Supabase gere um novo
    const { id, ...productData } = product as any;
    
    const { error } = await supabase.from('products').insert([{
        ...productData,
        company_id: userProfile.company_id
    }]);
    
    if (error) {
        console.error("Erro ao adicionar produto:", error);
        alert("Erro ao adicionar produto: " + error.message);
        return false;
    }
    
    fetchData(userProfile.company_id, true, { only: ['products', 'categories'] });
    return true;
  };

  const handleUpdateProduct = async (product: Product) => {
    if (!userProfile?.company_id) return false;
    
    // Remover o ID do corpo do update para evitar erros de chave primária
    const { id, company_id, created_at, ...productData } = product as any;
    
    const { error } = await supabase.from('products').update({
        ...productData
    }).eq('id', id);
    
    if (error) {
        console.error("Erro ao atualizar produto:", error);
        alert("Erro ao atualizar produto: " + error.message);
        return false;
    }
    
    fetchData(userProfile.company_id, true, { only: ['products', 'categories'] });
    return true;
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!userProfile?.company_id) return;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) fetchData(userProfile.company_id, true, { only: ['products'] });
  };

  const handleAddCategory = async (name: string) => {
    if (!userProfile?.company_id) return;
    const { error } = await supabase.from('categories').insert([{
        name: name.toUpperCase(),
        company_id: userProfile.company_id
    }]);
    if (!error) fetchData(userProfile.company_id, true, { only: ['categories'] });
  };

  const handleEditCategory = async (id: string, name: string) => {
    if (!userProfile?.company_id) return;
    const { error } = await supabase.from('categories').update({
        name: name.toUpperCase()
    }).eq('id', id);
    if (!error) fetchData(userProfile.company_id, true, { only: ['categories'] });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!userProfile?.company_id) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) fetchData(userProfile.company_id, true, { only: ['categories'] });
  };

  const handleAddToCart = (product: Product, meta?: any) => {
    const qtyToAdd = meta?.quantity || 1;
    
    // Verificar estoque se for produto físico
    if (product.manage_stock) {
        const currentInCart = cart.filter(i => i.id === product.id).reduce((acc, i) => acc + i.quantity, 0);
        if (currentInCart + qtyToAdd > (product.stock || 0)) {
            alert(`Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`);
            return;
        }
    }

    setCart(prev => {
        if (meta?.subscriptionReconciliationId) {
            if (prev.find(i => i.subscriptionReconciliationId === meta.subscriptionReconciliationId)) return prev;
            return [...prev, { ...product, quantity: 1, ...meta }];
        }
        const existing = prev.find(i => i.id === product.id && !i.subscriptionReconciliationId);
        if (existing) return prev.map(i => (i.id === product.id && !i.subscriptionReconciliationId) ? { ...i, quantity: i.quantity + qtyToAdd } : i);
        return [...prev, { ...product, quantity: qtyToAdd, ...meta }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;

        const newQty = item.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== id);

        // Verificar estoque
        if (item.manage_stock && delta > 0) {
            const product = products.find(p => p.id === id);
            if (product && newQty > (product.stock || 0)) {
                alert(`Estoque insuficiente para ${item.name}. Disponível: ${product.stock}`);
                return prev;
            }
        }

        return prev.map(i => i.id === id ? { ...i, quantity: newQty } : i);
    });
  };

  const handleSetQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
        setCart(prev => prev.filter(i => i.id !== id));
        return;
    }

    setCart(prev => {
        const item = prev.find(i => i.id === id);
        if (!item) return prev;

        // Verificar estoque
        if (item.manage_stock) {
            const product = products.find(p => p.id === id);
            if (product && quantity > (product.stock || 0)) {
                alert(`Estoque insuficiente para ${item.name}. Disponível: ${product.stock}`);
                return prev;
            }
        }

        return prev.map(i => i.id === id ? { ...i, quantity } : i);
    });
  };

  const handleSaveOrder = async (notes: string) => {
      if (!userProfile?.company_id) return;
      const subtotal = cart.reduce((a, b) => a + (Number(b.price) * Number(b.quantity)), 0);
      const total = subtotal - discount;
      const now = new Date().toISOString();
      
      const orderData: any = {
          client_name: selectedCustomer ? selectedCustomer.name : 'Cliente Balcão',
          customer_id: selectedCustomer?.id,
          seller_name: userProfile.full_name,
          items: JSON.stringify(cart),
          subtotal,
          discount,
          total,
          payment_method: 'pending',
          payments: JSON.stringify([]),
          change: 0,
          status: 'pending',
          notes,
          company_id: userProfile.company_id
      };

      let error;
      if (activeSaleId) {
          const { error: updateError } = await supabase.from('sales').update(orderData).eq('id', activeSaleId);
          error = updateError;
      } else {
          orderData.code = Math.random().toString(36).substr(2, 6).toUpperCase();
          orderData.date = now;
          const { error: insertError } = await supabase.from('sales').insert([orderData]);
          error = insertError;
      }
      
      if (!error) {
          await fetchData(userProfile.company_id, true);
          setCart([]);
          setSelectedCustomer(null);
          setDiscount(0);
          setIsCartOpen(false);
          setActiveSaleId(null);
          setView('orders');
          alert("Pedido salvo com sucesso!");
      } else {
          console.error("Erro ao salvar pedido:", error);
          alert("Erro ao salvar pedido.");
      }
  };

  const handleCompleteSale = async (payments: PaymentDetail[], change: number, notes: string) => {
      if (!userProfile?.company_id) return;
      const subtotal = cart.reduce((a, b) => a + (Number(b.price) * Number(b.quantity)), 0);
      const total = subtotal - discount;
      const now = new Date().toISOString();
      
      const saleData: any = {
          client_name: selectedCustomer ? selectedCustomer.name : 'Cliente Balcão',
          customer_id: selectedCustomer?.id,
          seller_name: userProfile.full_name,
          items: JSON.stringify(cart),
          subtotal,
          discount,
          total,
          payment_method: payments[0].method,
          payments: JSON.stringify(payments),
          change,
          status: 'completed',
          notes,
          company_id: userProfile.company_id,
          date: now
      };

      let savedSale = null;
      let saleCode = '';

      if (activeSaleId) {
          const { data: existingSale } = await supabase.from('sales').select('code').eq('id', activeSaleId).single();
          saleCode = existingSale?.code || '???';
          const { data, error } = await supabase.from('sales').update(saleData).eq('id', activeSaleId).select().single();
          if (!error) savedSale = data;
      } else {
          saleCode = Math.random().toString(36).substr(2, 6).toUpperCase();
          saleData.code = saleCode;
          const { data, error } = await supabase.from('sales').insert([saleData]).select().single();
          if (!error) savedSale = data;
      }

      if (savedSale) {
          // Decrementar estoque
          for (const item of cart) {
              if (item.manage_stock) {
                  const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
                  if (product) {
                      await supabase.from('products').update({ stock: (product.stock || 0) - item.quantity }).eq('id', item.id);
                  }
              }
          }

          const financeEntries = payments.map(p => ({ description: `VENDA PDV #${saleCode} - ${saleData.client_name}`.toUpperCase(), amount: p.amount, type: 'income', wallet_id: p.wallet_id, date: now, status: 'paid', company_id: userProfile.company_id, origin: 'pos', notes: `Venda Ref: ${saleCode}` }));
          await supabase.from('finance_transactions').insert(financeEntries);

          // Atualizar assinaturas se houver itens de reconciliação no carrinho
          for (const item of cart) {
              if (item.subscriptionReconciliationId) {
                  console.log(`Atualizando pagamento da assinatura: ${item.subscriptionReconciliationId}`);
                  await supabase.from('subscriptions')
                      .update({ 
                          payment_date: now,
                          status: 'active' // Garantir que o status mude para ativo
                      })
                      .eq('id', item.subscriptionReconciliationId);
              }
          }

          setLastCompletedSale({ ...saleData, code: saleCode, clientName: saleData.client_name, sellerName: saleData.seller_name, items: cart, payments } as any);
          setCart([]); setSelectedCustomer(null); setDiscount(0); setIsCartOpen(false); setActiveSaleId(null);
          setView('pos');
          setShowSuccessNotification(true); 
          setRefreshTrigger(prev => prev + 1);
          // Atualização seletiva: após uma venda, precisamos de Vendas e Finanças atualizadas
          fetchData(userProfile.company_id, true, { only: ['sales', 'finance', 'products', 'wallets'] });
      } else {
          alert("Erro ao finalizar venda no banco de dados.");
      }
  };

  const handleCancelOrder = async (saleId: string, reason: string) => {
      if (!userProfile?.company_id) return;
      const { error } = await supabase.from('sales').delete().eq('id', saleId);
      if (!error) {
          if (activeSaleId === saleId) {
              setActiveSaleId(null);
              setCart([]);
              setSelectedCustomer(null);
              setDiscount(0);
          }
          await fetchData(userProfile.company_id, true);
      } else {
          console.error("Erro ao excluir pedido:", error);
          alert("Erro ao excluir pedido.");
      }
  };

  const handleCancelSale = async (saleId: string, reason: string) => {
      if (!userProfile?.company_id) return;
      
      // 1. Buscar a venda original para saber o valor e pagamentos
      const { data: sale } = await supabase.from('sales').select('*').eq('id', saleId).single();
      if (!sale || sale.status === 'cancelled') return;

      // 2. Atualizar status da venda
      const { error: updateError } = await supabase.from('sales').update({ 
          status: 'cancelled',
          notes: (sale.notes ? sale.notes + ' | ' : '') + `MOTIVO CANCELAMENTO: ${reason}`
      }).eq('id', saleId);

      if (updateError) {
          alert("Erro ao cancelar venda.");
          return;
      }

      // Reverter estoque
      const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : (sale.items || []);
      for (const item of items) {
          if (item.manage_stock) {
              const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
              if (product) {
                  await supabase.from('products').update({ stock: (product.stock || 0) + item.quantity }).eq('id', item.id);
              }
          }
      }

      // 3. Reverter impacto financeiro
      const payments = typeof sale.payments === 'string' ? JSON.parse(sale.payments) : (sale.payments || []);
      
      // Criar lançamentos de saída para cada pagamento da venda
      const now = new Date().toISOString();
      const reversalEntries = payments.map((p: any) => ({
          description: `ESTORNO VENDA #${sale.code} - ${sale.client_name}`.toUpperCase(),
          amount: p.amount,
          type: 'expense', // Saída para anular a entrada anterior
          wallet_id: p.wallet_id,
          date: now,
          status: 'paid',
          company_id: userProfile.company_id,
          origin: 'pos',
          notes: `Estorno Ref Venda: ${sale.code}`
      }));

      if (reversalEntries.length > 0) {
          await supabase.from('finance_transactions').insert(reversalEntries);
      }

      await fetchData(userProfile.company_id, true);
      alert("Venda cancelada com sucesso!");
  };

  const handleUpdateSale = async (saleId: string, data: any) => {
    if (!userProfile?.company_id) return;
    
    const updateData: any = {};
    if (data.date) updateData.date = data.date;
    if (data.sellerName) updateData.seller_name = data.sellerName;
    if (data.paymentMethod) updateData.payment_method = data.paymentMethod;
    
    // Atualiza a venda
    const { error: saleError } = await supabase.from('sales').update(updateData).eq('id', saleId);
    
    if (saleError) {
      console.error("Erro ao atualizar venda:", saleError);
      alert("Erro ao atualizar venda: " + saleError.message);
      return;
    }

    // Atualiza a transação financeira vinculada usando o código da venda
    const sale = sales.find(s => s.id === saleId);
    if (sale && sale.code && data.date) {
        const { error: financeError } = await supabase
            .from('finance_transactions')
            .update({ date: data.date })
            .eq('company_id', userProfile.company_id)
            .ilike('notes', `%${sale.code}%`);
            
        if (financeError) {
            console.error("Erro ao atualizar transação financeira vinculada:", financeError);
        }
    }
    
    await fetchData(userProfile.company_id, true);
  };

  const handleDeleteSale = async (saleId: string) => {
      if (!userProfile?.company_id) return;
      const { error } = await supabase.from('sales').delete().eq('id', saleId);
      if (!error) {
          await fetchData(userProfile.company_id, true);
      } else {
          console.error("Erro ao excluir venda:", error);
          alert("Erro ao excluir venda.");
      }
  };

  // Prioridade para tela de atualização de senha (mesmo com sessão ativa do link de recovery)
  const handleRefresh = useCallback((options?: any) => {
    if (userProfile?.company_id) {
      fetchData(userProfile.company_id, true, options);
    }
  }, [userProfile?.company_id, fetchData]);

  if (authView === 'update-password') {
    return (
      <AuthPage 
        initialView="update-password" 
        onBack={() => setAuthView('landing')} 
        externalError={authError}
      />
    );
  }

  if (!session) {
      if (authView === 'landing') return <LandingPage onLogin={() => setAuthView('login')} onRegister={() => setAuthView('register')} />;
      return <AuthPage 
        initialView={authView === 'login' ? 'login' : authView === 'register' ? 'register' : 'update-password'} 
        onBack={() => setAuthView('landing')} 
        externalError={authError}
      />;
  }

  if (!userProfile) {
    return <AuthPage 
        initialView={authView === 'register' ? 'register' : 'login'} 
        onBack={() => setAuthView('landing')} 
        externalError={authError}
      />;
  }
  if (userProfile.role === 'customer') return <SubscriberPortal userProfile={userProfile} />;

  return (
    <div className="flex h-screen bg-[#EEF2F6] dark:bg-[#1a1b2e] overflow-hidden font-sans transition-colors">
      <Sidebar 
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} currentView={view} onNavigate={setView} 
        companyData={companyData} userRole={userProfile.role} permissions={companyData?.permissions?.operator}
        theme={theme} toggleTheme={toggleTheme} pendingOrdersCount={pendingOrdersCount}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {view === 'admin_master' && <AdminMasterScreen toggleSidebar={() => setIsSidebarOpen(true)} />}
        {view === 'dashboard' && (
          <DashboardScreen 
            sales={sales} 
            products={products} 
            customers={customers} 
            toggleSidebar={() => setIsSidebarOpen(true)} 
            userProfile={userProfile} 
            onNavigate={setView} 
            users={users} 
            portalUserIds={portalUserIds} 
            permissions={companyData?.permissions?.operator}
          />
        )}
        {view === 'goals' && <GoalsScreen sales={sales} toggleSidebar={() => setIsSidebarOpen(true)} userProfile={userProfile} />}
        {view === 'pos' && (
            <div className="flex h-full">
                <ProductList 
                  products={products} 
                  categories={categories} 
                  addToCart={handleAddToCart} 
                  cartItems={cart} 
                  toggleSidebar={() => setIsSidebarOpen(true)} 
                  onOpenCart={() => setIsCartOpen(true)} 
                  isLoading={loadingProducts}
                  editingOrderId={activeSaleId}
                  onCancelEdit={() => { setActiveSaleId(null); setCart([]); setSelectedCustomer(null); setDiscount(0); }}
                />
                <Cart 
                  items={cart} 
                  updateQuantity={handleUpdateQuantity} 
                  setQuantity={handleSetQuantity} 
                  removeFromCart={(id) => setCart(c => c.filter(i => i.id !== id))} 
                  clearCart={() => { setCart([]); setActiveSaleId(null); setSelectedCustomer(null); setDiscount(0); }} 
                  isOpen={isCartOpen} 
                  onClose={() => setIsCartOpen(false)} 
                  onCheckout={() => setView('payment')} 
                  customers={customers} 
                  selectedCustomer={selectedCustomer} 
                  onSelectCustomer={setSelectedCustomer} 
                  discount={discount} 
                  onApplyDiscount={setDiscount} 
                  addToCart={handleAddToCart} 
                  onRegisterCustomer={handleAddCustomer} 
                  allProducts={products} 
                  portalUserIds={portalUserIds}
                />
            </div>
        )}
        {view === 'payment' && <PaymentScreen cartItems={cart} subtotal={cart.reduce((a,b)=>a+(b.price*b.quantity),0)} discount={discount} customer={selectedCustomer} onBack={() => setView('pos')} onComplete={handleCompleteSale} onSaveOrder={handleSaveOrder} onDiscard={() => {}} onEditDiscount={setDiscount} onSelectCustomer={setSelectedCustomer} allCustomers={customers} onRegisterCustomer={handleAddCustomer} portalUserIds={portalUserIds} />}
        {view === 'orders' && <OrdersScreen sales={sales} userProfile={userProfile} toggleSidebar={() => setIsSidebarOpen(true)} onLoadOrder={(s) => { setCart(s.items); setSelectedCustomer(customers.find(c=>c.id===s.customerId)||null); setDiscount(s.discount || 0); setActiveSaleId(s.id); setView('pos'); }} onCreateNew={() => { setView('pos'); setActiveSaleId(null); setCart([]); setSelectedCustomer(null); setDiscount(0); }} onCancelOrder={handleCancelOrder} portalUserIds={portalUserIds} />}
        {view === 'products' && <ProductsScreen products={products} categories={categories} toggleSidebar={() => setIsSidebarOpen(true)} onAddCategory={handleAddCategory} onEditCategory={handleEditCategory} onDeleteCategory={handleDeleteCategory} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} userRole={userProfile.role} />}
        {view === 'customers' && <CustomersScreen customers={customers} subscriptions={subscriptions} onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} onImportCustomers={handleImportCustomers} onDeleteCustomer={handleDeleteCustomer} onBulkDeleteByDate={handleBulkDeleteByDate} toggleSidebar={() => setIsSidebarOpen(true)} companyId={userProfile.company_id} refreshData={() => handleRefresh({ only: ['customers'] })} portalUserIds={portalUserIds} />}
        {view === 'partners' && <PartnersScreen customers={customers} subscriptions={subscriptions} toggleSidebar={() => setIsSidebarOpen(true)} companyId={userProfile.company_id} onRefreshData={() => handleRefresh({ only: ['customers', 'subscriptions'] })} portalUserIds={portalUserIds} />}
        {view === 'finance' && <FinanceScreen toggleSidebar={() => setIsSidebarOpen(true)} userProfile={userProfile} sales={sales} onNavigate={setView} initialTransactions={financeTransactions} initialWallets={financeWallets} initialCategories={financeCategories} onRefresh={handleRefresh} />}
        {view === 'stats' && <StatsScreen sales={sales} products={products} customers={customers} financeTransactions={financeTransactions} toggleSidebar={() => setIsSidebarOpen(true)} userProfile={userProfile} />}
        {view === 'ai_intelligence' && <AISalesIntelligence sales={sales} products={products} transactions={financeTransactions} companyData={companyData} />}
        {view === 'history' && <HistoryScreen sales={sales} financeTransactions={financeTransactions} customers={customers} users={users} userProfile={userProfile} toggleSidebar={() => setIsSidebarOpen(true)} onCancelSale={handleCancelSale} onUpdateSale={handleUpdateSale} onDeleteSale={handleDeleteSale} onNavigateToPOS={() => setView('pos')} portalUserIds={portalUserIds} permissions={companyData?.permissions?.operator} />}
        {view === 'subscriptions' && <SubscriptionList customers={customers} companyId={userProfile.company_id} toggleSidebar={() => setIsSidebarOpen(true)} refreshTrigger={refreshTrigger} onRefreshData={() => handleRefresh({ only: ['subscriptions'] })} portalUserIds={portalUserIds} />}
        {view === 'users' && <UsersScreen toggleSidebar={() => setIsSidebarOpen(true)} userProfile={userProfile} sales={sales} />}
        {view === 'settings' && <SettingsScreen toggleSidebar={() => setIsSidebarOpen(true)} userProfile={userProfile} onCompanyUpdate={(n)=>setCompanyData(prev=>prev?({...prev, name:n}):null)} />}
        <SaleSuccessNotification isVisible={showSuccessNotification} sale={lastCompletedSale} onClose={() => setShowSuccessNotification(false)} onViewReceipt={() => {}} />
      </main>
    </div>
  );
}
