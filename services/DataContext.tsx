
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
    getPageAssets, getExhibitions, getArtworks, 
    getEvents, getCollectables, getHomepageGallery 
} from './data';
import { Exhibition, Artwork, Collectable, PageAssets, Event } from '../types';

interface DataContextType {
    assets: PageAssets | null;
    exhibitions: Exhibition[];
    artworks: Artwork[];
    events: Event[];
    collectables: Collectable[];
    homepageGallery: any[];
    refresh: () => Promise<void>;
    loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [assets, setAssets] = useState<PageAssets | null>(null);
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [collectables, setCollectables] = useState<Collectable[]>([]);
    const [homepageGallery, setHomepageGallery] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const [a, ex, art, ev, col, gal] = await Promise.all([
                getPageAssets(),
                getExhibitions(),
                getArtworks(),
                getEvents(),
                getCollectables(),
                getHomepageGallery()
            ]);
            setAssets(a);
            setExhibitions(ex);
            setArtworks(art);
            setEvents(ev);
            setCollectables(col);
            setHomepageGallery(gal);
            setLoading(false);
        } catch (err) {
             console.error("DataContext: Sync Error", err);
         } finally {
             setLoading(false);
         }
     }, []);

    useEffect(() => {
        refresh();
        
        // Listen for internal DB update events
        const handleUpdate = (e: any) => {
            console.debug(`DataContext: Reactive Sync triggered by store update [${e.detail?.store || 'unknown'}]`);
            refresh();
        };
        
        window.addEventListener('MOCA_DB_UPDATE', handleUpdate);
        
        // Fallback polling for external window updates (every 30 seconds)
        const interval = setInterval(refresh, 30000);
        
        return () => {
            window.removeEventListener('MOCA_DB_UPDATE', handleUpdate);
            clearInterval(interval);
        };
    }, [refresh]);

    return (
        <DataContext.Provider value={{ assets, exhibitions, artworks, events, collectables, homepageGallery, refresh, loading }}>
            {children}
        </DataContext.Provider>
    );
};

export const useMuseumData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useMuseumData must be used within a DataProvider");
    return context;
};
