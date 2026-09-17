import React, { useState } from 'react';
import { 
  Sliders, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  CheckSquare, 
  Square, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScheduleSidebarProps {
  items: ScheduleItem[];
  selectedItemId: string | null;
  onSelectItem: (item: ScheduleItem) => void;
  onAddNew: () => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onPromptNotify?: (item: ScheduleItem) => void;
}

export const ScheduleSidebar: React.FC<ScheduleSidebarProps> = ({
  items,
  selectedItemId,
  onSelectItem,
  onAddNew,
  onDeleteMultiple,
  onPromptNotify,
}) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layoutStyle, setLayoutStyle] = useState<'timeline' | 'list' | 'cards'>('timeline');
  const [isLayoutDropdownOpen, setIsLayoutDropdownOpen] = useState(false);

  // Group events by formatted date
  const groupedItems: Record<string, ScheduleItem[]> = {};
  for (const item of items) {
    const key = item.isDateTBA ? 'Date To Be Announced' : item.formattedDate;
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  }

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (onDeleteMultiple && selectedIds.length > 0) {
      if (confirm(`Delete ${selectedIds.length} event(s)?`)) {
        onDeleteMultiple(selectedIds);
        setSelectedIds([]);
        setIsSelectMode(false);
      }
    }
  };

  return (
    <aside className="w-full lg:w-[430px] bg-white border-r border-[#E0DED7] flex flex-col shrink-0 h-full overflow-y-auto z-10 shadow-xs">
      <div className="p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-gray-500 font-medium flex items-center space-x-1.5">
          <span className="hover:text-gray-800 cursor-pointer transition-colors">Website</span>
          <span className="text-gray-400">/</span>
          <span className="hover:text-gray-800 cursor-pointer transition-colors">Pages</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Schedule</span>
        </nav>

        {/* Component Layout Selector Box */}
        <div className="relative">
          <div 
            onClick={() => setIsLayoutDropdownOpen(!isLayoutDropdownOpen)}
            className="border border-gray-200 rounded-xl p-3.5 flex items-center justify-between hover:border-gray-300 hover:shadow-xs transition cursor-pointer bg-white"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-700">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 capitalize">
                  {layoutStyle}
                </div>
                <div className="text-xs text-gray-500">
                  {layoutStyle === 'timeline' 
                    ? 'Events on a vertical timeline indicator' 
                    : layoutStyle === 'list' 
                      ? 'Compact sequential agenda view' 
                      : 'Editorial multi-card aesthetic'}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isLayoutDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isLayoutDropdownOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsLayoutDropdownOpen(false)} />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-30 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {[
                  { id: 'timeline', title: 'Timeline', desc: 'Events on a vertical timeline indicator' },
                  { id: 'list', title: 'Compact List', desc: 'Single-column minimalist agenda' },
                  { id: 'cards', title: 'Story Cards', desc: 'Photo-forward event presentation' },
                ].map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => {
                      setLayoutStyle(layout.id as any);
                      setIsLayoutDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition flex flex-col ${
                      layoutStyle === layout.id ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-semibold text-gray-900">{layout.title}</span>
                    <span className="text-gray-500 text-[11px]">{layout.desc}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons: Select & Add New Event */}
        <div className="flex items-center justify-between pt-1">
          {isSelectMode ? (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  if (selectedIds.length === items.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(items.map((i) => i.id));
                  }
                }}
                className="text-xs font-semibold text-gray-700 hover:text-black"
              >
                {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => setIsSelectMode(false)}
                className="text-xs text-gray-500 hover:text-black"
              >
                Done
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-medium ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.length})</span>
                </button>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsSelectMode(true)}
              className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors"
            >
              Select...
            </button>
          )}

          <button 
            onClick={onAddNew}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#2D2D2D] hover:bg-black text-white rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95"
            id="add-new-event-btn"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add New</span>
          </button>
        </div>

        {/* Timeline Events List Grouped by Date */}
        <div className="space-y-6 pt-1">
          {Object.entries(groupedItems).map(([dateGroup, groupEvents]) => (
            <div key={dateGroup}>
              <h3 className="text-base font-bold text-gray-900 tracking-tight mb-3">
                {dateGroup}
              </h3>
              <div className="space-y-2">
                {groupEvents.map((event) => {
                  const isSelected = selectedIds.includes(event.id);
                  const isCurrentActive = selectedItemId === event.id;

                  return (
                    <div
                      key={event.id}
                      onClick={() => onSelectItem(event)}
                      className={`group border-b border-gray-100 pb-3 flex items-center justify-between -mx-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isCurrentActive 
                          ? 'bg-amber-50/50 ring-1 ring-amber-300/60' 
                          : 'hover:bg-gray-50/90'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {isSelectMode && (
                          <div 
                            onClick={(e) => toggleSelectId(event.id, e)} 
                            className="mt-1 text-gray-500 hover:text-black cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#2D2D2D]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-black flex items-center space-x-1.5">
                            <span>{event.name}</span>
                          </div>
                          {!event.isDateTBA && event.startTime && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {event.startTime}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <div className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                              {event.audience}
                            </div>
                            {event.hasPendingNotification && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPromptNotify?.(event);
                                }}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded-full text-[10px] font-semibold transition"
                                title="Click to notify guests now"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Notify Guests</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-2xl">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No events scheduled yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "+ Add New" to create your first event.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
