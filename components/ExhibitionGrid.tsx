
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// FIX: Corrected import from saveExhibitions (plural) to saveExhibition (singular)
import { saveExhibition, getStaffMode } from '../services/data';
import { useMuseumData } from '../services/DataContext';
import { Share2, Settings, ImageIcon, Check } from 'lucide-react';

const ExhibitionGrid: React.FC = () => {
  const { exhibitions, refresh } = useMuseumData();
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [justSavedId, setJustSavedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getStaffMode().then(setIsStaffMode);
  }, []);

  const handleShare = (e: React.MouseEvent, title: string) => {
    e.preventDefault(); e.stopPropagation(); 
    const url = `${window.location.origin}/#/exhibitions`;
    if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url);
        alert('Copied!');
    }
  };

  const handleUpdateDescription = async (id: string, newDesc: string) => {
      const current = exhibitions.find(ex => ex.id === id);
      if (current && current.description !== newDesc) {
          // FIX: Updated to call saveExhibition with a single updated exhibition object
          const updatedItem = { ...current, description: newDesc };
          await saveExhibition(updatedItem);
          setJustSavedId(id);
          setTimeout(() => setJustSavedId(null), 2000);
      }
  };

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-black pb-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Current Exhibitions</h2>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <Link to="/admin" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black flex items-center gap-2">
            <Settings className="w-3 h-3" /> Manage Content
          </Link>
          <Link to="/exhibitions" className="text-sm font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4">See All</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {exhibitions.map((exhibition) => (
          <div key={exhibition.id} className="group cursor-pointer flex flex-col h-full relative" onClick={() => !isStaffMode && navigate('/exhibitions')}>
            <div className="flex flex-col h-full">
              <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 mb-6">
                <img src={exhibition.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider z-10">{exhibition.category}</div>
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button onClick={(e) => handleShare(e, exhibition.title)} className="bg-white/90 backdrop-blur p-2.5 rounded-full text-black hover:bg-black hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex-grow flex flex-col">
                  <span className="text-xs font-medium text-gray-500 mb-2 block">{exhibition.dateRange}</span>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-2xl font-black leading-tight group-hover:underline decoration-2 underline-offset-4 tracking-tight">{exhibition.title}</h3>
                    {justSavedId === exhibition.id && <div className="text-green-600 text-[9px] font-bold uppercase animate-pulse"><Check className="w-3 h-3" /></div>}
                  </div>
                  <p 
                    className={`text-gray-600 text-sm leading-relaxed ${!isStaffMode ? 'line-clamp-3' : 'bg-gray-50 p-3 -m-3 rounded-lg border border-dashed border-gray-200 focus:bg-white focus:border-black'}`}
                    contentEditable={isStaffMode}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => isStaffMode && handleUpdateDescription(exhibition.id, e.currentTarget.innerText)}
                  >
                    {exhibition.description}
                  </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExhibitionGrid;
