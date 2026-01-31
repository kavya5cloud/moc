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
    year: "2024",
    medium: "Mixed Media",
    imageUrl: "https://images.unsplash.com/photo-1544961371-500e5a2d3142?w=800",
  },
  // Add more if needed
];

export const DEFAULT_ASSETS: PageAssets = {
  visit: {
    hero: "https://images.unsplash.com/photo-1517487881513-cf6776b6b7a9?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    hours: "10:00 AM - 5:00 PM (Tues-Sun)",
    locationText: "Veer Residency, Gandhinagar Mahudi Highway, Gujarat, India",
    googleMapsLink: "https://maps.app.goo.gl/example",
    admissionInfo: "Adults: ₹200, Students: ₹100, Children: Free",
    parkingInfo: "Limited street parking and nearby paid lots.",
  },
  about: {
    hero: "https://images.unsplash.com/photo-1518091043374-122756d11b3b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    atrium: "https://images.unsplash.com/photo-1533174072545-ea78a8731175?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Discover MOCA Gandhinagar",
    introTitle: "A Sanctuary of Contemporary Expression",
    introPara1: "MOCA Gandhinagar stands as a beacon of modern art in India, providing a dynamic space for artists and visitors alike. Our collections span diverse mediums and themes, reflecting the evolving landscape of contemporary thought and creativity.",
    introPara2: "We are committed to fostering a vibrant cultural dialogue, showcasing both established masters and emerging talents. Through innovative exhibitions and educational programs, MOCA aims to inspire, provoke, and connect individuals with the transformative power of art.",
    missionTitle: "Our Mission",
    missionDesc: "To cultivate a deep appreciation for contemporary art, serving as a platform for critical discourse and community engagement. We strive to be an accessible institution that champions artistic freedom and intellectual curiosity.",
    globalTitle: "Global Perspectives, Local Roots",
    globalDesc: "While celebrating Indian artistry, MOCA Gandhinagar also embraces global art movements, fostering cross-cultural understanding. Our exhibitions often feature collaborations with international artists and institutions, bringing a world of art to our local community.",
    communityTitle: "Art for Everyone",
    communityDesc: "We believe art should be accessible to all. MOCA offers various outreach programs, workshops, and free admission days to ensure that art enriches every segment of society. We are a space for learning, inspiration, and shared experiences.",
    archTitle: "Architectural Harmony: A Dialogue with Design",
    archPara1: "The building itself is a masterpiece of contemporary architecture, designed to blend seamlessly with the natural landscape while standing as a bold statement of modern design. Its minimalist aesthetic and thoughtful use of space create an ideal environment for artistic contemplation.",
    archPara2: "Natural light floods our galleries, illuminating the artworks and creating an ever-changing dialogue between the art and its environment. Every corner of MOCA Gandhinagar is designed to enhance the visitor's journey through the world of contemporary art.",
    team: [
      { id: "team-1", name: "Dr. Anya Sharma", role: "Chief Curator", imageUrl: "https://i.pravatar.cc/150?img=1" },
      { id: "team-2", name: "Mr. Rohan Patel", role: "Gallery Director", imageUrl: "https://i.pravatar.cc/150?img=2" },
    ],
  },
  membership: {
    hero: "https://plus.unsplash.com/banners/1594396013327-77569103986a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  home: {
    heroBg: "https://images.unsplash.com/photo-1549887552-cb1071dff61e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};
