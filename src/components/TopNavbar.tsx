import React, { useState } from 'react';
import { 
  Menu, 
  ChevronDown, 
  Settings, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Check, 
  SlidersHorizontal,
  Users,
  Mail
} from 'lucide-react';
import { ViewportMode } from '../types';

interface TopNavbarProps {
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  isPublished: boolean;
  onTogglePublish: () => void;
  onOpenSettings: () => void;
  onToggleSidebar?: () => void;
  onOpenGuestList?: () => void;
  guestCount?: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  viewportMode,
  onViewportChange,
  isPublished,
  onTogglePublish,
  onOpenSettings,
  onToggleSidebar,
  onOpenGuestList,
  guestCount = 42,
}) => {
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('Schedule');

  const pages = ['Home', 'Our Story', 'Schedule', 'Travel & Stay', 'Registry', 'Q & A', 'RSVP'];

  return (
    <header className="h-14 bg-white border-b border-[#E4E2DC] px-4 flex items-center justify-between z-30 shrink-0">
      {/* Left: Menu, Logo, and Page Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button 
          onClick={onToggleSidebar}
          aria-label="Toggle menu" 
          className="text-gray-600 hover:text-gray-900 focus:outline-none p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Joy Brand Logo */}
        <div className="flex items-center space-x-0.5 select-none pr-1">
          <span className="font-normal font-sans text-xl text-gray-800 mr-0.5">with</span>
          <span className="font-serif italic text-2xl font-bold tracking-tight text-gray-900">joy</span>
        </div>

        {/* Current Page Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>{activePage}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isPageMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPageMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsPageMenuOpen(false)} 
              />
              <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Wedding Pages
                </div>
                {pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setActivePage(page);
                      setIsPageMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      page === activePage ? 'font-semibold text-gray-900 bg-gray-50/70' : 'text-gray-600'
                    }`}
                  >
                    <span>{page}</span>
                    {page === activePage && <Check className="w-3.5 h-3.5 text-gray-900" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Guest Directory Quick Action */}
        <button
          onClick={onOpenGuestList}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition"
          title="Open Guest List & Email Directory"
        >
          <Users className="w-3.5 h-3.5 text-stone-600" />
          <span>Guest List ({guestCount})</span>
        </button>

        {/* Page Settings Action */}
        <button 
          onClick={onOpenSettings}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium">Page Settings</span>
        </button>
      </div>

      {/* Center: Viewport Preview Switches */}
      <div className="flex items-center space-x-2 text-gray-500 bg-gray-50 p-1 rounded-xl border border-gray-100">
        <button 
          className="p-1.5 hover:text-gray-900 rounded-lg transition-colors hover:bg-white" 
          title="Page Sections & Layout"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-gray-200"></div>
        <button 
          onClick={() => onViewportChange('desktop')}
          className={`p-1.5 rounded-lg transition-colors ${
            viewportMode === 'desktop' 
              ? 'text-gray-900 bg-white shadow-xs font-semibold' 
              : 'hover:text-gray-900 hover:bg-white'
          }`} 
          title="Desktop View"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onViewportChange('tablet')}
          className={`p-1.5 rounded-lg transition-colors ${
            viewportMode === 'tablet' 
              ? 'text-gray-900 bg-white shadow-xs font-semibold' 
              : 'hover:text-gray-900 hover:bg-white'
          }`} 
          title="Tablet View"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onViewportChange('mobile')}
          className={`p-1.5 rounded-lg transition-colors ${
            viewportMode === 'mobile' 
              ? 'text-gray-900 bg-white shadow-xs font-semibold' 
              : 'hover:text-gray-900 hover:bg-white'
          }`} 
          title="Mobile View"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Publish Status & Live Site Link */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onTogglePublish}
          className="flex items-center space-x-2 bg-gray-100/90 hover:bg-gray-200/80 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-200 transition-colors cursor-pointer"
          title="Click to toggle publish status"
        >
          <span className={`w-2 h-2 rounded-full inline-block ${isPublished ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-500'}`} />
          <span>{isPublished ? 'Site Published' : 'Site Unpublished'}</span>
        </button>

        <a 
          href="#preview-fullscreen" 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors" 
          title="Open Live Preview"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
