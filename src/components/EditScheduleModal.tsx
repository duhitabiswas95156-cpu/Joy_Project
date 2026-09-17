import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Info, 
  ChevronDown, 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  MapPin, 
  Trash2,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';
import { ScheduleItem, TimingMode, AttendanceFormat } from '../types';

interface EditScheduleModalProps {
  event: ScheduleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: ScheduleItem, triggerNotify: boolean) => void;
  onDelete: (id: string) => void;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<ScheduleItem>({ ...event });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if date or time was changed compared to the original event
  const isDateTimeModified =
    formData.formattedDate !== event.formattedDate ||
    formData.date !== event.date ||
    formData.startTime !== event.startTime ||
    formData.endTime !== event.endTime ||
    formData.timingMode !== event.timingMode ||
    formData.isDateTBA !== event.isDateTBA;

  // Formatting state simulation for rich text editor
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Preset venues for quick selection
  const venueSuggestions = [
    'The Waterfront Pavilion, Sunset Bay',
    'Grand Botanical Gardens & Ballroom',
    'Main Sanctuary & Historic Chapel',
    'The Glasshouse on Hudson',
  ];

  const handleTimingModeChange = (mode: TimingMode) => {
    setFormData((prev) => ({
      ...prev,
      timingMode: mode,
      isDateTBA: mode === 'tba',
    }));
  };

  const handleFormatChange = (format: AttendanceFormat) => {
    setFormData((prev) => ({ ...prev, format }));
  };

  const handleSaveClick = () => {
    // The popup of notifying guests will ONLY be triggered if the user wants to change the date or time of the event
    if (isDateTimeModified) {
      onSave(formData, true);
    } else {
      onSave(formData, false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] overflow-y-auto">
      <div 
        className="bg-white w-full max-w-[620px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200" 
        id="edit-schedule-modal"
      >
        {/* Modal Header */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between shrink-0 border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {event.id.startsWith('new-') ? 'Add Schedule Item' : 'Edit Schedule Item'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100" 
            id="close-edit-modal"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable form content) */}
        <div className="px-7 py-5 overflow-y-auto space-y-5 flex-1 text-sm">
          
          {/* Field: Event Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Name
            </label>
            <input 
              type="text" 
              value={formData.name}
              maxLength={120}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-gray-500 focus:ring-0 shadow-xs outline-none transition" 
              placeholder="e.g. Rehearsal Dinner"
            />
            <div className="text-right text-[11px] text-gray-400 mt-1 font-mono">
              {formData.name.length} / 120
            </div>
          </div>

          {/* Field: Description with formatting toolbar */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs focus-within:border-gray-400 transition">
              {/* Mini formatting bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/50 text-xs text-gray-600">
                <div className="flex items-center space-x-1 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  <span>Paragraph</span>
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
                </div>
                <div className="flex items-center space-x-3 text-gray-500">
                  <button 
                    type="button"
                    onClick={() => setIsBold(!isBold)} 
                    className={`p-1 rounded hover:text-black font-bold text-xs ${isBold ? 'bg-gray-200 text-black' : ''}`}
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsItalic(!isItalic)} 
                    className={`p-1 rounded hover:text-black italic text-xs ${isItalic ? 'bg-gray-200 text-black' : ''}`}
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsUnderline(!isUnderline)} 
                    className={`p-1 rounded hover:text-black underline text-xs ${isUnderline ? 'bg-gray-200 text-black' : ''}`}
                    title="Underline"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    className="p-1 rounded hover:text-black text-xs" 
                    title="Insert Link"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    className="p-1 rounded hover:text-black text-xs" 
                    title="Bulleted List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Rich text textarea */}
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full border-0 px-3.5 py-2.5 text-sm text-gray-800 focus:ring-0 resize-none outline-none ${
                  isBold ? 'font-bold' : ''
                } ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`}
                placeholder="Share details, dress code, or special instructions for guests..."
              />
              <div className="flex justify-center pb-1.5">
                <span className="w-8 h-1 bg-gray-200 rounded-full cursor-grab"></span>
              </div>
            </div>
          </div>

          {/* Tabs: Timing Mode */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium text-gray-700">
            <button 
              type="button"
              onClick={() => handleTimingModeChange('start_only')}
              className={`flex-1 py-2 rounded-lg text-center transition ${
                formData.timingMode === 'start_only' 
                  ? 'bg-white shadow-xs font-semibold text-gray-900' 
                  : 'hover:text-gray-900'
              }`}
            >
              Start Only
            </button>
            <button 
              type="button"
              onClick={() => handleTimingModeChange('start_end')}
              className={`flex-1 py-2 rounded-lg text-center transition ${
                formData.timingMode === 'start_end' 
                  ? 'bg-white shadow-xs font-semibold text-gray-900' 
                  : 'hover:text-gray-900'
              }`}
            >
              Start + End
            </button>
            <button 
              type="button"
              onClick={() => handleTimingModeChange('tba')}
              className={`flex-1 py-2 rounded-lg text-center transition ${
                formData.timingMode === 'tba' 
                  ? 'bg-white shadow-xs font-semibold text-gray-900' 
                  : 'hover:text-gray-900'
              }`}
            >
              TBA
            </button>
          </div>

          {/* Date & Time Row */}
          {formData.timingMode !== 'tba' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Start Date &amp; Time
                </label>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-7 relative">
                    <input 
                      type="text" 
                      value={formData.formattedDate === 'Date To Be Announced' ? 'Thursday, September 16, 2027' : formData.formattedDate}
                      onChange={(e) => setFormData({ ...formData, formattedDate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 pr-10 focus:border-gray-500 focus:ring-0 shadow-xs font-medium outline-none" 
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="col-span-5 relative">
                    <input 
                      type="text" 
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 pr-10 focus:border-gray-500 focus:ring-0 shadow-xs font-medium outline-none" 
                      placeholder="4:00pm"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* End Date & Time (if Start + End selected) */}
              {formData.timingMode === 'start_end' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    End Date &amp; Time
                  </label>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-7 relative">
                      <input 
                        type="text" 
                        defaultValue="Thursday, September 16, 2027"
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 pr-10 focus:border-gray-500 focus:ring-0 shadow-xs font-medium outline-none" 
                      />
                      <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="col-span-5 relative">
                      <input 
                        type="text" 
                        value={formData.endTime || '8:00 PM'}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 pr-10 focus:border-gray-500 focus:ring-0 shadow-xs font-medium outline-none" 
                        placeholder="8:00pm"
                      />
                      <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Notification Trigger Helper Banner */}
              {isDateTimeModified ? (
                <div className="flex items-center space-x-2 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200 px-3 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Date/time changed:</strong> Saving will open the guest notification prompt.
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-[11px] text-stone-600 bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Date &amp; time unchanged:</strong> Saving will update details directly without alerting guests.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Timezone Selector */}
          <div>
            <div className="flex items-center space-x-1 mb-1.5">
              <label className="text-xs font-semibold text-gray-700">Event Time Zone</label>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 p-0.5" 
                title="All guests will see times converted or in this selected wedding zone."
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative">
              <select 
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 appearance-none bg-white focus:border-gray-500 focus:ring-0 shadow-xs pr-10 outline-none cursor-pointer"
              >
                <option value="GMT+05:30 Kolkata">GMT+05:30 Kolkata</option>
                <option value="GMT-04:00 Eastern Time (US & Canada)">GMT-04:00 Eastern Time (US & Canada)</option>
                <option value="GMT-07:00 Pacific Time (US & Canada)">GMT-07:00 Pacific Time (US & Canada)</option>
                <option value="GMT+00:00 UTC / London">GMT+00:00 UTC / London</option>
                <option value="GMT+09:00 Tokyo / Osaka">GMT+09:00 Tokyo / Osaka</option>
              </select>
              <div className="absolute right-3.5 top-3 pointer-events-none text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Attendance Format Tabs */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Attendance Format
            </label>
            <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium text-gray-700">
              <button 
                type="button"
                onClick={() => handleFormatChange('in_person')}
                className={`flex-1 py-2 rounded-lg text-center transition ${
                  formData.format === 'in_person' 
                    ? 'bg-white shadow-xs font-semibold text-gray-900' 
                    : 'hover:text-gray-900'
                }`}
              >
                In Person
              </button>
              <button 
                type="button"
                onClick={() => handleFormatChange('virtual')}
                className={`flex-1 py-2 rounded-lg text-center transition ${
                  formData.format === 'virtual' 
                    ? 'bg-white shadow-xs font-semibold text-gray-900' 
                    : 'hover:text-gray-900'
                }`}
              >
                Virtual
              </button>
              <button 
                type="button"
                onClick={() => handleFormatChange('both')}
                className={`flex-1 py-2 rounded-lg text-center transition ${
                  formData.format === 'both' 
                    ? 'bg-white shadow-xs font-semibold text-gray-900' 
                    : 'hover:text-gray-900'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          {/* Venue Search & Quick suggestions */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Venue name or Address
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-0 shadow-xs outline-none pl-9" 
                placeholder="Search for a location" 
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-gray-400">Popular:</span>
              {venueSuggestions.map((venue) => (
                <button
                  key={venue}
                  type="button"
                  onClick={() => setFormData({ ...formData, venue })}
                  className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md transition-colors truncate max-w-[180px]"
                  title={venue}
                >
                  {venue}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience / Guest Access */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Guest Visibility
            </label>
            <div className="flex items-center space-x-2">
              {['All Guests', 'Bridal Party Only', 'Family Only'].map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setFormData({ ...formData, audience: aud })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    formData.audience === aud
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="mx-7 mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 text-xs text-red-700 font-medium">
              <Trash2 className="w-4 h-4" />
              <span>Are you sure you want to delete this event?</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-xs text-gray-600 hover:text-black px-2 py-1"
              >
                Keep Event
              </button>
              <button
                type="button"
                onClick={() => onDelete(formData.id)}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-semibold hover:bg-red-700 shadow-2xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer Action Buttons */}
        <div className="px-7 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          <button 
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 border border-[#D9383A] text-[#D9383A] hover:bg-red-50 text-xs font-semibold rounded-full transition-colors active:scale-95"
          >
            Delete Event
          </button>
          
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors rounded-full"
            >
              Cancel
            </button>
            
            {/* Clicking Save opens the guest notification confirmation popup */}
            <button 
              type="button"
              onClick={handleSaveClick}
              className="px-7 py-2.5 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95" 
              id="trigger-notify-btn"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
