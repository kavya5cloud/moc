import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { getPressReleases } from '../services/data';
import type { PressRelease } from '../types';

const PressPage: React.FC = () => {
  const [items, setItems] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const data = await getPressReleases();
      if (!mounted) return;
      setItems(
        [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
      setLoading(false);
    };

    load();

    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ store: string }>;
      if (custom.detail?.store === 'MOCA_PRESS_RELEASES') {
        load();
      }
    };

    window.addEventListener('MOCA_DB_UPDATE', handler as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('MOCA_DB_UPDATE', handler as EventListener);
    };
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            Press &amp; Media
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Official announcements, exhibition news, and institutional updates from the Museum of
            Contemporary Art Gandhinagar.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
            Loading press releases…
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
            No press releases published yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((press) => (
              <article
                key={press.id}
                className="border border-gray-200 rounded-2xl p-5 md:p-6 hover:border-black hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                        {new Date(press.date).toLocaleDateString()}
                      </p>
                      <h2 className="text-lg md:text-xl font-bold tracking-tight">
                        {press.title}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <span>Press Release</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{press.summary}</p>
                {press.url && (
                  <a
                    href={press.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:underline"
                  >
                    View Full Release
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PressPage;

