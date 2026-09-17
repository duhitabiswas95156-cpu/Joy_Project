import React, { useState } from 'react';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  Sparkles, 
  Heart, 
  Send, 
  ChevronRight,
  Share2,
  Bookmark
} from 'lucide-react';
import { ScheduleItem, ViewportMode } from '../types';

interface CanvasPreviewProps {
  items: ScheduleItem[];
  viewportMode: ViewportMode;
  onEditItem: (item: ScheduleItem) => void;
  onOpenSupport: () => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  items,
  viewportMode,
  onEditItem,
  onOpenSupport,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'timeline'>('preview');

  // Frame width constraints based on viewport selection
  const getContainerStyles = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[400px] my-6 border-[8px] border-[#1C1C1C] rounded-[44px] shadow-2xl overflow-hidden min-h-[780px] ring-1 ring-black/10';
      case 'tablet':
        return 'max-w-[740px] my-6 border-[10px] border-[#2A2A2A] rounded-[32px] shadow-2xl overflow-hidden min-h-[820px] ring-1 ring-black/10';
      case 'desktop':
      default:
        return 'max-w-4xl w-full';
    }
  };

  return (
    <main className="flex-1 bg-[#ECEAE5] overflow-y-auto p-4 sm:p-8 flex justify-center items-start relative min-h-full">
      <div className={`transition-all duration-300 w-full flex flex-col items-center pt-4 pb-24 ${getContainerStyles()}`}>
        
        {/* Device Speaker Notch (Mobile view only) */}
        {viewportMode === 'mobile' && (
          <div className="w-full bg-[#1C1C1C] h-6 flex justify-center items-center shrink-0">
            <div className="w-20 h-3 bg-neutral-900 rounded-full flex items-center justify-end px-2">
              <div className="w-2 h-2 rounded-full bg-neutral-800" />
            </div>
          </div>
        )}

        <div className="w-full bg-[#ECEAE5] flex flex-col items-center px-4 sm:px-8 py-6">
          
          {/* Couple Heading Header */}
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase tracking-[0.25em] text-stone-500 font-semibold mb-1 block">
              The Wedding Celebration Of
            </span>
            <h1 className="font-serif italic text-3xl sm:text-4xl text-gray-900 font-bold tracking-tight">
              Elena &amp; Julian
            </h1>
            <p className="text-xs text-stone-600 mt-2 font-medium tracking-wide">
              September 16 – 18, 2027 • Kyoto &amp; Tokyo, Japan
            </p>
          </div>

          {/* Preview Q&A Segment from Mockup */}
          <div className="text-center max-w-xl mx-auto mb-8 bg-white/40 backdrop-blur-xs p-4 rounded-2xl border border-stone-200/60 shadow-xs">
            <p className="text-xs text-stone-700 font-medium tracking-wide">
              What’s the most memorable trip you’ve taken together?
            </p>
            <p className="text-xs text-stone-500 mt-1 italic font-serif">
              "Last April, we saw the Northern Lights in Norway. It was unforgettable!"
            </p>
          </div>

          {/* Featured Couple Image Card (Exact image from HTML hotlink) */}
          <div className="w-full max-w-2xl bg-white shadow-xl rounded-sm overflow-hidden p-2.5 bg-opacity-95 border border-stone-200/70 mb-12">
            <div className="relative overflow-hidden group">
              <img 
                alt="Japanese garden red bridge" 
                className="w-full h-auto max-h-[460px] object-cover rounded-sm shadow-inner transition duration-500 group-hover:scale-[1.01]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBhJPSHtlwDraKRoG_C5vuahRo5Wt_-g-cakhQmdC8UEPUDSuiKOGz0b5d8m7KN5Uhn5tLjDn6d1VDYFMZ_Omx7cyPjR6zPvvBUrJwsVZdxDDz8W66aSXOZs1AXT3TZZsH3ppvv4Ky5NRySh9HMo4KPQL06CbsGDdbJ7EVU6ufaFG5sFed4_oHbegnxMVkN12uInRpEfF7U3XrJfKT6VUk-60cz0ivQ1DUhtyDBz_0GkP4cOObeDIP3Mz1977Gh2PE-os"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-medium flex items-center space-x-1.5 opacity-90">
                <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
                <span>Kyoto Garden, 2026</span>
              </div>
            </div>
          </div>

          {/* Live Schedule Timeline Preview Section */}
          <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-[#E0DED7] shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  Guest Itinerary
                </span>
                <h2 className="text-xl font-serif italic font-bold text-gray-900">
                  Wedding Weekend Schedule
                </h2>
              </div>
              <span className="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full font-medium">
                {items.length} Events Scheduled
              </span>
            </div>

            {/* Vertical timeline renderer */}
            <div className="relative border-l-2 border-stone-200 ml-4 pl-6 space-y-8">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="relative group cursor-pointer"
                  onClick={() => onEditItem(item)}
                >
                  {/* Timeline dot indicator */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-stone-800 group-hover:scale-125 group-hover:bg-[#2D2D2D] transition-transform duration-150 shadow-xs" />

                  <div className="bg-stone-50/70 group-hover:bg-stone-50 border border-stone-200/80 group-hover:border-stone-400 p-4 rounded-2xl transition-all shadow-2xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                          {item.isDateTBA ? 'Date To Be Announced' : item.formattedDate}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mt-0.5 group-hover:text-black">
                          {item.name}
                        </h3>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditItem(item);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs text-stone-600 hover:text-black bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs transition-opacity"
                      >
                        Edit Item
                      </button>
                    </div>

                    {!item.isDateTBA && item.startTime && (
                      <div className="flex items-center space-x-2 text-xs text-stone-600 mt-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{item.startTime} {item.endTime ? `– ${item.endTime}` : ''}</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] text-stone-500">{item.timezone}</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-stone-200/40">
                      {item.venue && (
                        <div className="flex items-center space-x-1 text-[11px] text-stone-600 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span className="truncate max-w-[200px]">{item.venue}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-full font-medium">
                        {item.audience}
                      </div>
                      <div className="text-[11px] text-stone-500 capitalize bg-white px-2 py-0.5 rounded-full border border-stone-200">
                        {item.format.replace('_', ' ')}
                      </div>
                      {item.hasPendingNotification && (
                        <div className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                          ⚠️ Notification Pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Support Chat Bubble Button (From screenshot) */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={onOpenSupport}
          aria-label="Help and Support" 
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          id="chat-support-btn"
        >
          <MessageSquare className="w-6 h-6 fill-white stroke-none group-hover:rotate-6 transition-transform" />
        </button>
      </div>
    </main>
  );
};
