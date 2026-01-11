// src/services/mockData.ts
import type { Collectable, Exhibition, Artwork, PageAssets } from '../types';

export const COLLECTABLES: Collectable[] = [
  {
    id: "col-001",
    name: "Minimalist Ceramic Vase",
    price: 2499,
    category: "Home",
    imageUrl: "https://images.unsplash.com/photo-1578500491406-8a3d4e3e9e0e?w=800",
    description: "Handcrafted ceramic vase with modern minimalist design",
    inStock: true,
  },
  {
    id: "col-002",
    name: "Abstract Geometric Print",
    price: 1299,
    category: "Prints",
    imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7eb9688?w=800",
    description: "Limited edition abstract geometric art print",
    inStock: true,
  },
  {
    id: "col-003",
    name: "Brass Bookend Set",
    price: 1899,
    category: "Accessories",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d5f5a3f7f?w=800",
    description: "Elegant brass bookends for your collection",
    inStock: false,
  },
];

export const EXHIBITIONS: Exhibition[] = [
  {
    id: "exh-001",
    title: "Echoes of Tradition",
    dateRange: "February – May 2026",
    description: "Contemporary reinterpretations of classical Indian art forms",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3db7ef5e0d8?w=800",
    category: "Painting",
  },
  {
    id: "exh-002",
    title: "Digital Futures",
    dateRange: "June – September 2026",
    description: "Exploring the intersection of technology and contemporary art",
    imageUrl: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800",
    category: "Digital",
  },
];

export const ARTWORKS: Artwork[] = [
  {
    id: "art-001",
    title: "Urban Reflections",
    artist: "Anonymous Collective",
    year: 2024,
    medium: "Mixed Media",
    imageUrl: "https://images.unsplash.com/photo-1544961371-500e5a2d3142?w=800",
  },
  // Add more if needed
];

export const DEFAULT_ASSETS: PageAssets = {
  heroImage: "https://images.unsplash.com/photo-1580130718646-9f694209b207?w=1600",
  aboutText: "MOCA Gandhinagar is a dynamic space dedicated to contemporary art, culture, and creative expression.",
  welcomeMessage: "Welcome to the Museum of Contemporary Art",
  curatorQuote: "Art is not what you see, but what you make others see.",
};