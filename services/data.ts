import { createClient } from '@supabase/supabase-js';
import {
  Collectable,
  ShopOrder,
  Booking,
  PageAssets,
  Exhibition,
  Artwork,
  Event,
  Review,
} from '../types';
import {
  COLLECTABLES,
  DEFAULT_ASSETS,
  EXHIBITIONS,
  ARTWORKS,
} from '../constants';

/**
 * MOCA HYBRID DATA ENGINE (v7.1)
 * Server: Supabase Cloud (Postgres)
 * Mirror: Browser LocalStorage (Offline + Persistence)
 */

/* ================================
   ENV (VITE ONLY)
================================ */
const SUPABASE_URL = 'https://wfympkifjwdinxpiagbw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Debug once (remove after verification)
console.log('[MOCA] Supabase URL:', SUPABASE_URL);

/* ================================
   SUPABASE CLIENT
================================ */
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

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
   CONNECTION STATUS
================================ */
export const checkDatabaseConnection = () => ({
  isConnected: !!supabase,
  mode: supabase ? 'LIVE CLOUD' : 'LOCAL MIRROR',
  url: SUPABASE_URL ?? 'NOT_CONFIGURED',
  timestamp: Date.now(),
});

/* ================================
   INITIAL BOOTSTRAP
================================ */
export const bootstrapMuseumData = async () => {
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTABLES)) {
    setLocal(STORAGE_KEYS.COLLECTABLES, COLLECTABLES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS)) {
    setLocal(STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS)) {
    setLocal(STORAGE_KEYS.ARTWORKS, ARTWORKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS)) {
    setLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);
  }
};

/* ================================
   SYNC HELPERS
================================ */
const syncGet = async <T>(
  table: string,
  storageKey: string,
  fallback: T
): Promise<T> => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (data && data.length) {
        setLocal(storageKey, data);
        return data as T;
      }
      if (error) console.warn(`[DB READ] ${table}`, error);
    } catch (err) {
      console.error(`[NETWORK READ] ${table}`, err);
    }
  }
  return getLocal(storageKey, fallback);
};

const syncUpsert = async (
  table: string,
  storageKey: string,
  item: any,
  idField: string = 'id'
) => {
  const list = getLocal<any[]>(storageKey, []);
  const index = list.findIndex((i) => i[idField] === item[idField]);

  if (index > -1) list[index] = item;
  else list.unshift(item);

  setLocal(storageKey, list);

  if (supabase) {
    try {
      const { error } = await supabase.from(table).upsert(item);
      if (error) console.error(`[DB WRITE] ${table}`, error);
    } catch (err) {
      console.error(`[NETWORK WRITE] ${table}`, err);
    }
  }
};

const syncDelete = async (
  table: string,
  storageKey: string,
  id: string
) => {
  const list = getLocal<any[]>(storageKey, []).filter((i) => i.id !== id);
  setLocal(storageKey, list);

  if (supabase) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) console.error(`[DB DELETE] ${table}`, error);
    } catch (err) {
      console.error(`[NETWORK DELETE] ${table}`, err);
    }
  }
};

/* ================================
   API
================================ */
export const getExhibitions = () =>
  syncGet<Exhibition[]>(
    'exhibitions',
    STORAGE_KEYS.EXHIBITIONS,
    EXHIBITIONS
  );

export const saveExhibition = (ex: Exhibition) =>
  syncUpsert('exhibitions', STORAGE_KEYS.EXHIBITIONS, ex);

export const getArtworks = () =>
  syncGet<Artwork[]>(
    'artworks',
    STORAGE_KEYS.ARTWORKS,
    ARTWORKS
  );

export const getCollectables = () =>
  syncGet<Collectable[]>(
    'collectables',
    STORAGE_KEYS.COLLECTABLES,
    COLLECTABLES
  );

export const saveCollectable = (col: Collectable) =>
  syncUpsert('collectables', STORAGE_KEYS.COLLECTABLES, col);

export const deleteCollectable = (id: string) =>
  syncDelete('collectables', STORAGE_KEYS.COLLECTABLES, id);

export const getEvents = () =>
  syncGet<Event[]>('events', STORAGE_KEYS.EVENTS, []);

export const getReviews = async (itemId: string): Promise<Review[]> => {
  if (supabase) {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('itemId', itemId)
      .order('timestamp', { ascending: false });

    if (data) return data as Review[];
  }

  const all = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
  return all.filter((r) => r.itemId === itemId);
};

export const addReview = (review: Review) =>
  syncUpsert('reviews', STORAGE_KEYS.REVIEWS, review);

export const getBookings = () =>
  syncGet<Booking[]>('bookings', STORAGE_KEYS.BOOKINGS, []);

export const saveBooking = (booking: Booking) =>
  syncUpsert('bookings', STORAGE_KEYS.BOOKINGS, booking);

export const getShopOrders = () =>
  syncGet<ShopOrder[]>('shop_orders', STORAGE_KEYS.ORDERS, []);

export const saveShopOrder = (order: ShopOrder) =>
  syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, order);

export const updateOrderStatus = async (
  orderId: string,
  status: 'Pending' | 'Fulfilled'
) => {
  const orders = await getShopOrders();
  const order = orders.find((o) => o.id === orderId);

  if (order) {
    order.status = status;
    await syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, order);
  }
};

export const getDashboardAnalytics = async () => {
  const [orders, bookings] = await Promise.all([
    getShopOrders(),
    getBookings(),
  ]);

  const shopRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const ticketRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalTickets = bookings.reduce(
    (s, b) =>
      s + b.tickets.adult + b.tickets.student + b.tickets.child,
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

export const getHomepageGallery = () =>
  syncGet<any[]>('homepage_gallery', 'MOCA_GALLERY_SCROLL', []);

export const getPageAssets = async (): Promise<PageAssets> =>
  getLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);

export const savePageAssets = async (data: PageAssets) =>
  setLocal(STORAGE_KEYS.PAGE_ASSETS, data);

export const getStaffMode = async () =>
  localStorage.getItem('MOCA_STAFF_MODE') === 'true';


