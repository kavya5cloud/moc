
import { Exhibition, Artwork, Collectable, PageAssets } from './types';

export const EXHIBITIONS: Exhibition[] = [
  {
    id: '1',
    title: 'Signals: How Video Transformed the World',
    dateRange: 'Now through July 08, 2024',
    description: 'Explore the vast influence of video art on global culture and politics. This retrospective features over 50 artists who pioneered the medium.',
    imageUrl: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800',
    category: 'Video & Media'
  },
  {
    id: '2',
    title: 'Modernism in Gujarat: 1950-1980',
    dateRange: 'Opens Sep 15, 2024',
    description: 'A deep dive into the architectural and artistic movements that defined post-independence Gujarat, curated from our permanent archives.',
    imageUrl: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?auto=format&fit=crop&q=80&w=800',
    category: 'Architecture'
  },
  {
    id: '3',
    title: 'Refik Anadol: Unsupervised',
    dateRange: 'Permanent Collection',
    description: 'Machine learning algorithms dream of modern art history in this immersive digital installation.',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800',
    category: 'Installation'
  },
  {
    id: '4',
    title: 'Design for Modern Life',
    dateRange: 'Now through Dec 31, 2024',
    description: 'Objects that defined the 20th century aesthetic, from Bauhaus furniture to contemporary industrial design.',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
    category: 'Design'
  }
];

export const ARTWORKS: Artwork[] = [
  {
    id: 'a1',
    title: 'The Geometric Void',
    artist: 'Gandhinagar Collective',
    year: '2023',
    medium: 'Acrylic on concrete',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a2',
    title: 'Echoes of the Sabarmati',
    artist: 'Priya Shah',
    year: '2021',
    medium: 'Digital Projection',
    imageUrl: 'https://images.unsplash.com/photo-1515405299443-f71bb768a1d5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'a3',
    title: 'Brutalist Whisper',
    artist: 'Vikram Mehta',
    year: '2019',
    medium: 'Reinforced Steel Sculpture',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800'
  }
];

export const COLLECTABLES: Collectable[] = [
    {
        id: 'c1',
        name: 'MOCA Tote Bag',
        price: 1200,
        category: 'Accessories',
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
        description: 'Heavyweight canvas tote featuring the MOCA logo.',
        inStock: true
    },
    {
        id: 'c2',
        name: 'Exhibition Catalogue: Signals',
        price: 3500,
        category: 'Books',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
        description: 'Full color hardcover book documenting the history of video art.',
        inStock: true
    }
];

export const DEFAULT_ASSETS: PageAssets = {
  about: {
    hero: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=1600',
    atrium: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?auto=format&fit=crop&q=80&w=1600',
    title: 'Our Story',
    introTitle: 'A Sanctuary for Modern Thought',
    introPara1: 'Founded in 2024, MOCA Gandhinagar serves as a vital bridge between Gujarat’s rich cultural heritage and the global avant-garde.',
    introPara2: 'Located within the serene Veer Residency, our museum offers 20,000 square feet of gallery space dedicated to the art of our time.',
    missionTitle: 'Our Mission',
    missionDesc: 'To inspire, challenge, and connect our community through the transformative power of modern and contemporary art.',
    globalTitle: 'Global Outlook',
    globalDesc: 'We bring international retrospectives to Gandhinagar while providing a platform for local artists to reach a world audience.',
    communityTitle: 'Community Heart',
    communityDesc: 'MOCA is a free institution, ensuring that art education and inspiration are accessible to everyone regardless of background.',
    archTitle: 'The Architecture of Silence',
    archPara1: 'Our building is a masterpiece of modern brutalism, designed to be a "neutral vessel" for the art it contains.',
    archPara2: 'Light and shadow play across the raw concrete walls, creating a meditative environment for viewing and reflection.',
    team: [
      { id: 't1', name: 'Dr. Aarav Patel', role: 'Chief Curator', imageUrl: 'https://i.pravatar.cc/300?u=aarav' },
      { id: 't2', name: 'Meera Shah', role: 'Director of Education', imageUrl: 'https://i.pravatar.cc/300?u=meera' },
      { id: 't3', name: 'Vikram Mehta', role: 'Head of Conservation', imageUrl: 'https://i.pravatar.cc/300?u=vikram' }
    ]
  },
  visit: {
    hero: 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=1600',
    hours: '10:30 AM – 6:00 PM',
    locationText: 'Veer Residency, Gandhinagar Mahudi Highway, Gujarat, India',
    googleMapsLink: 'https://www.google.com/maps/search/Veer+Residency+Gandhinagar',
    admissionInfo: 'General admission to MOCA Gandhinagar is currently FREE for all visitors. We believe art is a public right.',
    parkingInfo: 'Free secure parking is available on-site for all museum visitors.'
  },
  membership: {
    hero: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=1600'
  },
  home: {
    heroBg: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1600'
  }
};

export const SYSTEM_INSTRUCTION = `You are the AI Curator for MOCA Gandhinagar. Always refer to the museum as "MOCA Gandhinagar" or "MOCA" - never "Veer Residency" (that's just the building location).

Key facts:
- Location: Veer Residency, Gandhinagar Mahudi Highway, Gujarat, India
- Hours: Tue-Sun, 10:30 AM-6:00 PM (closed Mondays)
- Tickets: FREE, pre-registration recommended
- Parking: Free at Veer Residency
- Contact: mocagandhinagar@gmail.com

Keep responses brief (2-3 sentences max). Reply in Hindi/Gujarati if asked. Be helpful and welcoming.`;
