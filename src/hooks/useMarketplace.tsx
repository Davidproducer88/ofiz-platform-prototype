import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MarketplaceProduct {
  id: string;
  business_id: string;
  category_id: string | null;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  sku: string | null;
  images: string[];
  specifications: Record<string, any>;
  shipping_info: Record<string, any>;
  status: 'draft' | 'active' | 'out_of_stock' | 'archived';
  views_count: number;
  favorites_count: number;
  sales_count: number;
  rating: number;
  reviews_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
  business_profiles?: {
    company_name: string;
  };
  marketplace_categories?: {
    name: string;
    icon: string;
  };
}

export interface MarketplaceOrder {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  platform_fee: number;
  seller_amount: number;
  shipping_cost: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: any;
  created_at: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

export function useMarketplace(userId?: string) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total_earnings: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchMarketplaceData();
      subscribeToRealtime();
    }
  }, [userId]);

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel('marketplace-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_products',
        },
        () => {
          fetchProducts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_orders',
          filter: `buyer_id=eq.${userId}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchFavorites(),
        fetchSellerBalance(),
      ]);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          marketplace_categories(name, icon)
        `)
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mappedProducts = await Promise.all((data || []).map(async (p) => {
        const { data: businessData } = await supabase
          .from('business_profiles')
          .select('company_name')
          .eq('id', p.business_id)
          .maybeSingle();
        
        return {
          ...p,
          images: Array.isArray(p.images) ? p.images as string[] : [],
          business_profiles: businessData ? { company_name: businessData.company_name } : undefined,
        } as MarketplaceProduct;
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as MarketplaceOrder[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchFavorites = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select('product_id')
        .eq('user_id', userId);

      if (error) throw error;
      setFavorites(data?.map(f => f.product_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchSellerBalance = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_seller_balance')
        .select('*')
        .eq('seller_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setBalance({
          available: Number(data.available_balance),
          pending: Number(data.pending_balance),
          total_earnings: Number(data.total_earnings),
        });
      }
    } catch (error) {
      console.error('Error fetching seller balance:', error);
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!userId) return;

    try {
      const isFavorite = favorites.includes(productId);

      if (isFavorite) {
        const { error } = await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== productId));
      } else {
        const { error } = await supabase
          .from('marketplace_favorites')
          .insert({
            user_id: userId,
            product_id: productId,
          });

        if (error) throw error;
        setFavorites(prev => [...prev, productId]);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createProduct = async (productData: Partial<MarketplaceProduct> & { title: string; description: string; price: number }) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .insert({
          business_id: userId,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category_id: productData.category_id || null,
          compare_at_price: productData.compare_at_price || null,
          stock_quantity: productData.stock_quantity || 0,
          sku: productData.sku || null,
          images: productData.images || [],
          specifications: productData.specifications || {},
          shipping_info: productData.shipping_info || {},
          status: productData.status || 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ Producto creado',
        description: 'Tu producto ha sido publicado exitosamente',
      });

      fetchProducts();
      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const createOrder = async (orderData: {
    product_id: string;
    quantity: number;
    unit_price: number;
    shipping_address: any;
    shipping_cost?: number;
  }) => {
    if (!userId) return null;

    try {
      // Get product and seller info
      const { data: product, error: productError } = await supabase
        .from('marketplace_products')
        .select('business_id, price')
        .eq('id', orderData.product_id)
        .single();

      if (productError) throw productError;

      // Generate order number
      const { data: orderNumber, error: orderNumError } = await supabase
        .rpc('generate_order_number');

      if (orderNumError) throw orderNumError;

      // Create order (amounts will be calculated by trigger)
      const { data: order, error: orderError } = await supabase
        .from('marketplace_orders')
        .insert({
          order_number: orderNumber,
          buyer_id: userId,
          seller_id: product.business_id,
          product_id: orderData.product_id,
          quantity: orderData.quantity,
          unit_price: orderData.unit_price,
          shipping_cost: orderData.shipping_cost || 0,
          shipping_address: orderData.shipping_address,
          subtotal: 0, // Will be calculated by trigger
          platform_fee: 0, // Will be calculated by trigger
          seller_amount: 0, // Will be calculated by trigger
          total_amount: 0, // Will be calculated by trigger
        })
        .select()
        .single();

      if (orderError) throw orderError;

      toast({
        title: '🎉 Orden creada',
        description: `Orden #${orderNumber} creada. Total: $${order.total_amount.toLocaleString()}`,
      });

      fetchOrders();
      return order;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: MarketplaceOrder['status']
  ) => {
    try {
      const { error } = await supabase
        .from('marketplace_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Estado actualizado',
        description: 'El estado de la orden ha sido actualizado',
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    products,
    orders,
    categories,
    favorites,
    balance,
    loading,
    toggleFavorite,
    createProduct,
    createOrder,
    updateOrderStatus,
    refresh: fetchMarketplaceData,
  };
}
