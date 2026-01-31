import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Collectable,
  Exhibition,
  Artwork,
  Event,
  Booking,
  ShopOrder,
  PageAssets,
  GalleryImage,
} from '../types';
import {
  EXHIBITIONS,
  ARTWORKS,
  DEFAULT_ASSETS,
} from './mockData';
import { COLLECTABLES } from '../constants';
/* ================================
   ENV (VITE ONLY)
================== */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
  GALLERY_IMAGES: 'MOCA_GALLERY_IMAGES',
};

/* ================================
   LOCAL STORAGE HELPERS
================================ */
const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setLocal = (key: string, data: any, dispatchEvent: boolean = true) => {
  localStorage.setItem(key, JSON.stringify(data));
  if (dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent('MOCA_DB_UPDATE', { detail: { store: key } })
    );
  }
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
    setLocal(STORAGE_KEYS.COLLECTABLES, COLLECTABLES, false);

  if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS))
    setLocal(STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS, false);

  if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS))
    setLocal(STORAGE_KEYS.ARTWORKS, ARTWORKS, false);

  if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS))
    setLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS, false);

  // Initialize gallery images if not present
  if (!localStorage.getItem(STORAGE_KEYS.GALLERY_IMAGES))
    setLocal(STORAGE_KEYS.GALLERY_IMAGES, [], false);
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
        setLocal(storageKey, result.data, false);
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
  const originalList = getLocal<any[]>(storageKey, []);
  const list = [...originalList];
  const index = list.findIndex((i) => i[idField] === item[idField]);
  index > -1 ? (list[index] = item) : list.unshift(item);
  setLocal(storageKey, list);

  if (supabase) {
    try {
      const { error } = await supabase.from(table).upsert(item);
      if (error) {
        console.error(`[DB WRITE] ${table}`, error);
        setLocal(storageKey, originalList); // Rollback local state
        // TODO: Show a toast or other user feedback for DB write failure
      }
    } catch (err) {
      console.error(`[NETWORK WRITE] ${table}`, err);
      setLocal(storageKey, originalList); // Rollback local state
      // TODO: Show a toast or other user feedback for network error
    } finally {
      // Ensure loading states are cleared if implemented in UI
    }
  }
};

const syncDelete = async (
  table: string,
  storageKey: string,
  id: string
) => {
  const originalList = getLocal<any[]>(storageKey, []);
  setLocal(
    storageKey,
    originalList.filter((i) => i.id !== id)
  );

  if (supabase) {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error(`[DB DELETE] ${table}`, error);
        setLocal(storageKey, originalList); // Rollback local state
        // TODO: Show a toast or other user feedback for DB delete failure
      }
    } catch (err) {
      console.error(`[NETWORK DELETE] ${table}`, err);
      setLocal(storageKey, originalList); // Rollback local state
      // TODO: Show a toast or other user feedback for network error
    } finally {
      // Ensure loading states are cleared if implemented in UI
    }
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
  const orders = getLocal<any[]>(STORAGE_KEYS.ORDERS, []);
  const orderToUpdate = orders.find(o => o.id === orderId);

  if (orderToUpdate) {
    const updatedOrder = { ...orderToUpdate, status };
    await syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, updatedOrder);
  }
};

export const getShopOrders = () =>
  syncGet<ShopOrder[]>('shop_orders', STORAGE_KEYS.ORDERS, []);

export const saveShopOrder = async (o: ShopOrder) => {
  await syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, o);

  // Attempt to send order confirmation email via serverless function
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: o }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send order email:', errorData.message);
    } else {
      console.log('Order email triggered successfully!');
    }
  } catch (error) {
    console.error('Error triggering order email:', error);
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

export const getPageAssets = async (): Promise<PageAssets> => {
  const assets = getLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);
  console.log("getPageAssets returning:", assets);
  return assets;
};

export const savePageAssets = async (data: PageAssets) =>
  setLocal(STORAGE_KEYS.PAGE_ASSETS, data, false);

export const getStaffMode = async () =>
  localStorage.getItem('MOCA_STAFF_MODE') === 'true';

export const getGalleryImages = () =>
  syncGet<GalleryImage[]>('gallery_images', STORAGE_KEYS.GALLERY_IMAGES, []);

export const saveGalleryImage = (image: GalleryImage) =>
  syncUpsert('gallery_images', STORAGE_KEYS.GALLERY_IMAGES, image);

export const deleteGalleryImage = (id: string) =>
  syncDelete('gallery_images', STORAGE_KEYS.GALLERY_IMAGES, id);

export const getHomepageGallery = async () => {
  const galleryImages = await getGalleryImages();

  // Group images into tracks (example logic, adjust as needed)
  // For simplicity, let's create 3 tracks and distribute images evenly
  const tracks: { speed: number; direction: number; images: GalleryImage[] }[] = [
    { speed: 0.05, direction: 1, images: [] },
    { speed: 0.03, direction: -1, images: [] },
    { speed: 0.07, direction: 1, images: [] },
  ];

  galleryImages.forEach((image, index) => {
    tracks[index % tracks.length].images.push(image);
  });

  return tracks;
};

