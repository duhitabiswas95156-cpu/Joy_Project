import React, { useState } from 'react';
import { X, Check, Globe, Eye, Clock, MapPin, Calendar } from 'lucide-react';

interface PageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
}

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [pageTitle, setPageTitle] = useState('Schedule');
  const [pageSlug, setPageSlug] = useState('schedule');
  const [isVisibleInNav, setIsVisibleInNav] = useState(true);
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [showAddToCal, setShowAddToCal] = useState(true);
  const [showMaps, setShowMaps] = useState(true);

  const handleSave = () => {
    onSave({ pageTitle, pageSlug, isVisibleInNav, timeFormat, showAddToCal, showMaps });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Schedule Page Settings</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Page Title</label>
            <input 
              type="text" 
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 outline-none focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Page URL</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-gray-500 bg-gray-50">
              <span>withjoy.com/elena-and-david/</span>
              <input 
                type="text" 
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                className="bg-transparent text-gray-900 font-medium outline-none ml-0.5 flex-1"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <Eye className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-semibold text-gray-800">Visible in Website Navigation</div>
                  <div className="text-[11px] text-gray-500">Show this page on your wedding menu</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={isVisibleInNav} 
                onChange={(e) => setIsVisibleInNav(e.target.checked)}
                className="rounded text-[#2D2D2D] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-semibold text-gray-800">"Add to Calendar" Buttons</div>
                  <div className="text-[11px] text-gray-500">Enable Google, Apple, and Outlook cal sync for guests</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={showAddToCal} 
                onChange={(e) => setShowAddToCal(e.target.checked)}
                className="rounded text-[#2D2D2D] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
              <div className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-semibold text-gray-800">Interactive Location Maps</div>
                  <div className="text-[11px] text-gray-500">Provide direct navigation maps for venues</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={showMaps} 
                onChange={(e) => setShowMaps(e.target.checked)}
                className="rounded text-[#2D2D2D] focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-full"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="px-5 py-2 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
