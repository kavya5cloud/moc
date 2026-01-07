
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm';
import { Collectable, ShopOrder, Booking, PageAssets, Exhibition, Artwork, Event, Review } from '../types';
import { COLLECTABLES, DEFAULT_ASSETS, EXHIBITIONS, ARTWORKS } from '../constants';

/**
 * MOCA HYBRID DATA ENGINE (v6.0)
 * Server: Supabase Cloud (Postgres)
 * Mirror: Browser LocalStorage (Persistence & Offline Support)
 */

const SUPABASE_URL = (process.env as any).SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (process.env as any).SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

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

const getLocal = <T>(key: string, fallback: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('MOCA_DB_UPDATE', { detail: { store: key } }));
};

export const checkDatabaseConnection = () => {
    return {
        isConnected: !!supabase,
        mode: supabase ? 'LIVE CLOUD' : 'LOCAL MIRROR',
        url: SUPABASE_URL || 'NOT CONFIGURED'
    };
};

// Initial data hydration
export const bootstrapMuseumData = async () => {
    if (!localStorage.getItem(STORAGE_KEYS.COLLECTABLES)) {
        localStorage.setItem(STORAGE_KEYS.COLLECTABLES, JSON.stringify(COLLECTABLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXHIBITIONS)) {
        localStorage.setItem(STORAGE_KEYS.EXHIBITIONS, JSON.stringify(EXHIBITIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ARTWORKS)) {
        localStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(ARTWORKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAGE_ASSETS)) {
        localStorage.setItem(STORAGE_KEYS.PAGE_ASSETS, JSON.stringify(DEFAULT_ASSETS));
    }
    return Promise.resolve();
};

// --- CRUD Utilities ---
const syncGet = async <T>(table: string, storageKey: string, fallback: T): Promise<T> => {
    if (supabase) {
        try {
            const { data, error } = await supabase.from(table).select('*');
            if (data && data.length > 0) {
                setLocal(storageKey, data);
                return data as unknown as T;
            }
            if (error) console.warn(`Supabase Read Error [${table}]:`, error);
        } catch (e) {
            console.error(`Network Error reading ${table}:`, e);
        }
    }
    return getLocal(storageKey, fallback);
};

const syncUpsert = async (table: string, storageKey: string, item: any, idField: string = 'id') => {
    const list = getLocal<any[]>(storageKey, []);
    const index = list.findIndex(i => i[idField] === item[idField]);
    if (index > -1) list[index] = item; else list.unshift(item);
    setLocal(storageKey, list);

    if (supabase) {
        try {
            const { error } = await supabase.from(table).upsert(item);
            if (error) console.error(`Supabase Sync Error [${table}]:`, error);
        } catch (e) {
            console.error(`Network Error syncing ${table}:`, e);
        }
    }
};

const syncDelete = async (table: string, storageKey: string, id: string) => {
    const list = getLocal<any[]>(storageKey, []).filter(i => i.id !== id);
    setLocal(storageKey, list);

    if (supabase) {
        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) console.error(`Supabase Delete Error [${table}]:`, error);
        } catch (e) {
            console.error(`Network Error deleting from ${table}:`, e);
        }
    }
};

// --- Public API ---
export const getExhibitions = () => syncGet<Exhibition[]>('exhibitions', STORAGE_KEYS.EXHIBITIONS, EXHIBITIONS);
export const saveExhibition = (ex: Exhibition) => syncUpsert('exhibitions', STORAGE_KEYS.EXHIBITIONS, ex);

export const getArtworks = () => syncGet<Artwork[]>('artworks', STORAGE_KEYS.ARTWORKS, ARTWORKS);

export const getCollectables = () => syncGet<Collectable[]>('collectables', STORAGE_KEYS.COLLECTABLES, COLLECTABLES);
export const saveCollectable = (col: Collectable) => syncUpsert('collectables', STORAGE_KEYS.COLLECTABLES, col);
export const deleteCollectable = (id: string) => syncDelete('collectables', STORAGE_KEYS.COLLECTABLES, id);

export const getEvents = () => syncGet<Event[]>('events', STORAGE_KEYS.EVENTS, []);

export const getReviews = async (itemId: string): Promise<Review[]> => {
    if (supabase) {
        const { data } = await supabase.from('reviews').select('*').eq('itemId', itemId).order('timestamp', { ascending: false });
        if (data) return data as Review[];
    }
    const all = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, []);
    return all.filter(r => r.itemId === itemId);
};
export const addReview = (review: Review) => syncUpsert('reviews', STORAGE_KEYS.REVIEWS, review);

export const getBookings = () => syncGet<Booking[]>('bookings', STORAGE_KEYS.BOOKINGS, []);
export const saveBooking = (booking: Booking) => syncUpsert('bookings', STORAGE_KEYS.BOOKINGS, booking);

export const getShopOrders = () => syncGet<ShopOrder[]>('shop_orders', STORAGE_KEYS.ORDERS, []);
export const saveShopOrder = (order: ShopOrder) => syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, order);
export const updateOrderStatus = async (orderId: string, status: 'Pending' | 'Fulfilled') => {
    const orders = await getShopOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        await syncUpsert('shop_orders', STORAGE_KEYS.ORDERS, order);
    }
};

export const getDashboardAnalytics = async () => {
    const [orders, bookings] = await Promise.all([getShopOrders(), getBookings()]);
    const shopRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const ticketRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = bookings.reduce((sum, b) => sum + (b.tickets.adult + b.tickets.student + b.tickets.child), 0);
    return {
        totalRevenue: shopRevenue + ticketRevenue,
        shopRevenue,
        ticketRevenue,
        totalTickets,
        orderCount: orders.length,
        bookingCount: bookings.length,
        recentActivity: [...orders, ...bookings].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
    };
};

export const getHomepageGallery = async () => syncGet<any[]>('homepage_gallery', 'MOCA_GALLERY_SCROLL', []);
export const getPageAssets = async (): Promise<PageAssets> => getLocal(STORAGE_KEYS.PAGE_ASSETS, DEFAULT_ASSETS);
export const savePageAssets = async (data: PageAssets) => setLocal(STORAGE_KEYS.PAGE_ASSETS, data);
export const getStaffMode = async () => localStorage.getItem('MOCA_STAFF_MODE') === 'true';
