import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Artifact } from '../types';
import { MapPin, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface ArtifactRendererProps {
  artifact: Artifact;
}

export const ArtifactRenderer = ({ artifact }: ArtifactRendererProps) => {
  if (artifact.type === 'map') {
    if (!GOOGLE_MAPS_API_KEY) {
      return (
        <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-8 h-8 text-accent-gold" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Google Maps Key Required</h4>
            <p className="text-xs text-white/40">Please add GOOGLE_MAPS_PLATFORM_KEY to your Secrets.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/5 bg-black/20 mt-4 shadow-2xl">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={{ lat: 48.8566, lng: 2.3522 }} // Default to Paris if needed
            defaultZoom={artifact.data.zoom || 12}
            mapId="DEMO_MAP_ID"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            className="w-full h-full"
          >
            {/* We could geocode the location here, but for now we'll just show the map */}
            <div className="absolute top-4 left-4 z-10 bg-surface-dark border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
              <MapPin className="w-3 h-3 text-accent-gold" />
              <span className="text-[10px] font-mono text-white/80">{artifact.data.location}</span>
            </div>
          </Map>
        </APIProvider>
      </div>
    );
  }

  if (artifact.type === 'image') {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/20 mt-4 relative group">
        <img 
          src={`https://picsum.photos/seed/${encodeURIComponent(artifact.data.prompt)}/1200/675`}
          alt={artifact.data.prompt}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-4 h-4 text-accent-gold" />
            <p className="text-xs text-white italic font-light line-clamp-2">{artifact.data.prompt}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-accent-gold text-bg-dark text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
          AI Generated
        </div>
      </div>
    );
  }

  return null;
};
