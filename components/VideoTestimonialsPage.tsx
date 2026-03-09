import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle } from 'lucide-react';

type Video = {
  id: string;
  title: string;
  speaker: string;
  role?: string;
  url: string; // YouTube/Vimeo/embed URL
};

// You can edit this list to add/change videos.
const VIDEOS: Video[] = [
  // Example:
  // {
  //   id: 'example-1',
  //   title: 'Why MOCA Matters',
  //   speaker: 'Visitor Name',
  //   role: 'Museum Visitor',
  //   url: 'https://www.youtube.com/embed/your_video_id',
  // },
];

const VideoTestimonialsPage: React.FC = () => {
  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">
            Video Testimonies
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
            Stories and reflections from visitors, artists, and partners of the
            Museum of Contemporary Art Gandhinagar.
          </p>
        </div>

        {VIDEOS.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400 font-bold uppercase tracking-widest">
            No video testimonies added yet. Add embed links in{' '}
            <code>VideoTestimonialsPage.tsx</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {VIDEOS.map((video) => (
              <article
                key={video.id}
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative bg-black aspect-video">
                  <iframe
                    src={video.url}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                    <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">
                    Testimony
                  </p>
                  <h2 className="text-lg font-bold mb-1 tracking-tight">
                    {video.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {video.speaker}
                    {video.role ? ` · ${video.role}` : ''}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTestimonialsPage;

