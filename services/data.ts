import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  COLLECTABLES,
  EXHIBITIONS,
  ARTWORKS,
  DEFAULT_ASSETS,
} from './mockData';
/* ================================
   ENV (VITE ONLY)
================================ */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const bootstrapMuseumData = async () => {
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTABLES))
    setLocal(STORAGE_KEYS.COLLECTABLES, COLLECTABLES);

  if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS))
    setLocal(STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS);

  if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS))
    setLocal(STORAGE_KEYS.ARTWORKS, ARTWORKS);

  if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS))
    setLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);
};

/* ================================
   SUPABASE CLIENT
================================ */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;


console.log("Supabase init check:");
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "present (hidden)" : "MISSING");
console.log("supabase client:", supabase ? "CREATED" : "NULL - local mode active");
/* ================================
   STORAGE KEYS
================================ */
const STORAGE_KEYS = {
  COLLECTABLES: 'MOCA_COLLECTABLES',
  EXHIBITIONS: 'MOCA_EXHIBITIONS',
  ARTWORKS: 'MOCA_ARTWORKS',
  EVENTS: 'MOCA_EVENTS',
  REVIEWS: 'MOCA_REVIEWS',
  PAGE_ASSETS: 'MOCA_ASSETS',
  BOOKINGS: 'MOCA_BOOKINGS',
  ORDERS: 'MOCA_ORDERS',
};

/* ================================
   LOCAL STORAGE HELPERS
================================ */
const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(
    new CustomEvent('MOCA_DB_UPDATE', { detail: { store: key } })
  );
};

/* ================================
   CONNECTION STATUS (USED BY UI)
================================ */
export const checkDatabaseConnection = () => ({
  isConnected: !!supabase,
  mode: supabase ? 'LIVE CLOUD' : 'LOCAL MIRROR',
  url: supabase ? 'CONNECTED' : 'NOT_CONFIGURED',
  timestamp: Date.now(),
});


/* ================================
   INITIAL BOOTSTRAP
================================ */
export const bootstrapMuseumData = async () => {
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTABLES))
    setLocal(STORAGE_KEYS.COLLECTABLES, COLLECTABLES);

  if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS))
    setLocal(STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS);

  if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS))
    setLocal(STORAGE_KEYS.ARTWORKS, ARTWORKS);

  if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS))
    setLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);
};

/* ================================
   SYNC HELPERS
================================ */
const syncGet = async <T>(
  table: string,
  storageKey: string,
  fallback: T
): Promise<T> => {
  // ⏱ timeout protection
  const timeout = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 3000)
  );

  if (supabase) {
    try {
      const query = supabase.from(table).select('*');
      const result = await Promise.race([query, timeout]);

      if (result && 'data' in result && result.data) {
        setLocal(storageKey, result.data);
        return result.data as T;
      }
    } catch (err) {
      console.warn(`[SYNC FALLBACK] ${table}`, err);
    }
  }

  // ✅ ALWAYS FALL BACK
  return getLocal(storageKey, fallback);
};


const syncUpsert = async (
  table: string,
  storageKey: string,
  item: any,
  idField = 'id'
) => {
  const list = getLocal<any[]>(storageKey, []);
  const index = list.findIndex((i) => i[idField] === item[idField]);
  index > -1 ? (list[index] = item) : list.unshift(item);
  setLocal(storageKey, list);

  if (supabase) {
    const { error } = await supabase.from(table).upsert(item);
    if (error) console.error(`[DB WRITE] ${table}`, error);
  }
};

const syncDelete = async (
  table: string,
  storageKey: string,
  id: string
) => {
  setLocal(
    storageKey,
    getLocal<any[]>(storageKey, []).filter((i) => i.id !== id)
  );

  if (supabase) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error(`[DB DELETE] ${table}`, error);
  }
};

/* ================================
   API
================================ */

export const getExhibitions = () =>
  syncGet<Exhibition[]>('exhibitions', STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS);

export const saveExhibition = (ex: Exhibition) =>
  syncUpsert('exhibitions', STORAGE_KEYS.EXHIBITIONS, ex);

export const getArtworks = () =>
  syncGet<Artwork[]>('artworks', STORAGE_KEYS.ARTWORKS, ARTWORKS);

export const getCollectables = () =>
  syncGet<Collectable[]>('collectables', STORAGE_KEYS.COLLECTABLES, COLLECTABLES);

export const saveCollectable = (c: Collectable) =>
  syncUpsert('collectables', STORAGE_KEYS.COLLECTABLES, c);

export const deleteCollectable = (id: string) =>
  syncDelete('collectables', STORAGE_KEYS.COLLECTABLES, id);

export const getEvents = () =>
  syncGet<Event[]>('events', STORAGE_KEYS.EVENTS, []);

export const getBookings = () =>
  syncGet<Booking[]>('bookings', STORAGE_KEYS.BOOKINGS, []);

export const saveBooking = (b: Booking) =>
  syncUpsert('bookings', STORAGE_KEYS.BOOKINGS, b);

export const updateOrderStatus = async (
  orderId: string,
  status: 'Pending' | 'Fulfilled'
) => {
  const orders = getLocal<any[]>('MOCA_ORDERS', []);
  const index = orders.findIndex(o => o.id === orderId);

  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      status,
    };
    setLocal('MOCA_ORDERS', orders);
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('shop_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('[DB WRITE] shop_orders', error);
      }
    } catch (err) {
      console.error('[NETWORK WRITE] shop_orders', err);
    }
  }
};


export const getShopOrders = () =>
  syncGet<ShopOrder[]>('shop_orders', STORAGE_KEYS.ORDERS, []);

export const saveShopOrder = (o: ShopOrder) =>
  syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, o);

export const getDashboardAnalytics = async () => {
  const [orders, bookings] = await Promise.all([
    getShopOrders(),
    getBookings(),
  ]);

  const shopRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const ticketRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalTickets = bookings.reduce(
    (s, b) => s + b.tickets.adult + b.tickets.student + b.tickets.child,
    0
  );

  return {
    totalRevenue: shopRevenue + ticketRevenue,
    shopRevenue,
    ticketRevenue,
    totalTickets,
    orderCount: orders.length,
    bookingCount: bookings.length,
    recentActivity: [...orders, ...bookings]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10),
  };
};


export const getPageAssets = async (): Promise<PageAssets> =>
  getLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);

export const savePageAssets = async (data: PageAssets) =>
  setLocal(STORAGE_KEYS.PAGE_ASSETS, data);

export const getStaffMode = async () =>
  localStorage.getItem('MOCA_STAFF_MODE') === 'true';

export const getHomepageGallery = async () => {
  return getLocal<any[]>('MOCA_GALLERY_SCROLL', []);
};

