
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { getEvents } from '../services/data';
import { Event } from '../types';

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState('All');

  // FIX: Added async wrapper to handle Promise returned by getEvents
  useEffect(() => {
    const fetchData = async () => {
        const data = await getEvents();
        setEvents(data);
    };
    fetchData();
  }, []);

  const filteredEvents = filter === 'All' 
    ? events 
    : events.filter(ev => ev.type === filter);

  return (
    <div className="pt-10 min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 mb-20">
         <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-6xl font-black mb-6 tracking-tighter">What's On</h1>
            <div className="flex gap-4 border-b border-gray-300 pb-4 overflow-x-auto">
                {['All', 'Talk', 'Workshop', 'Film', 'Tour'].map(f => (
                    <button 
                        key={f} 
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors whitespace-nowrap ${filter === f ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-4">
            {filteredEvents.map((event) => (
                <div key={event.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 group cursor-pointer">
                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">{event.type}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-gray-700">{event.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{event.date}</span>
                            </div>
                             <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <Link to="/booking" className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                            Book Now
                        </Link>
                    </div>
                </div>
            ))}
            {filteredEvents.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
                    <p className="text-gray-400 font-bold uppercase tracking-widest">No scheduled events for this category</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
