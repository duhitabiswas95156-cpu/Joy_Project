import React, { useState } from 'react';
import { 
  Users, 
  X, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Check, 
  Trash2, 
  Edit2, 
  Send, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Guest, ScheduleItem } from '../types';

interface GuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
  onBulkAddGuests: (emails: string[]) => void;
  onSendDirectEmail?: (email: string, guestName: string) => void;
  activeEvent?: ScheduleItem | null;
}

export const GuestListModal: React.FC<GuestListModalProps> = ({
  isOpen,
  onClose,
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  onBulkAddGuests,
  onSendDirectEmail,
  activeEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'attending' | 'bridal_party' | 'has_email'>('all');
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestGroup, setNewGuestGroup] = useState<'all' | 'attending' | 'bridal_party'>('attending');
  const [newGuestRsvp, setNewGuestRsvp] = useState<'attending' | 'declined' | 'pending'>('attending');
  const [newGuestPartyTag, setNewGuestPartyTag] = useState('');
  const [formError, setFormError] = useState('');

  // Bulk input state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Individual test send feedback
  const [sentRecipientEmail, setSentRecipientEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filtered list
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.partyTag && g.partyTag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'attending') return g.rsvpStatus === 'attending';
    if (activeTab === 'bridal_party') return g.group === 'bridal_party';
    if (activeTab === 'has_email') return Boolean(g.email && g.email.includes('@'));
    return true;
  });

  const totalCount = guests.length;
  const attendingCount = guests.filter((g) => g.rsvpStatus === 'attending').length;
  const bridalPartyCount = guests.filter((g) => g.group === 'bridal_party').length;
  const withEmailCount = guests.filter((g) => g.email && g.email.includes('@')).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) {
      setFormError('Guest name is required.');
      return;
    }
    if (!newGuestEmail.trim() || !newGuestEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    onAddGuest({
      name: newGuestName.trim(),
      email: newGuestEmail.trim().toLowerCase(),
      phone: newGuestPhone.trim() || undefined,
      group: newGuestGroup,
      rsvpStatus: newGuestRsvp,
      partyTag: newGuestPartyTag.trim() || undefined,
      plusOnes: 0,
    });

    // Reset
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('');
    setNewGuestPartyTag('');
    setFormError('');
    setIsAddingGuest(false);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkInput.trim()) return;

    // Parse emails from comma, semicolon, space, or newline
    const matches = bulkInput.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    if (!matches || matches.length === 0) {
      setFormError('No valid email addresses found in text.');
      return;
    }

    const uniqueEmails = Array.from(new Set(matches.map((e) => e.toLowerCase())));
    onBulkAddGuests(uniqueEmails);
    setBulkInput('');
    setIsBulkAdding(false);
    setBulkSuccessMsg(`Successfully imported ${uniqueEmails.length} guest email(s)!`);
    setTimeout(() => setBulkSuccessMsg(''), 4000);
  };

  const handleSendSingleEmail = (guest: Guest) => {
    if (!guest.email) return;
    onSendDirectEmail?.(guest.email, guest.name);
    setSentRecipientEmail(guest.email);
    setTimeout(() => setSentRecipientEmail(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-[840px] rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-[#FAF9F6]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-stone-900">Guest List &amp; Email Directory</h2>
                <span className="text-[11px] font-bold bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded-full">
                  {totalCount} Total
                </span>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>{withEmailCount} With Valid Emails</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage guest contact details, recipient groups, and dispatch email updates
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsBulkAdding(!isBulkAdding);
                setIsAddingGuest(false);
              }}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import / Paste Emails</span>
            </button>
            <button
              onClick={() => {
                setIsAddingGuest(!isAddingGuest);
                setIsBulkAdding(false);
              }}
              className="px-3.5 py-1.5 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition"
              title="Close Guest Directory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {bulkSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 flex items-center space-x-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bulkSuccessMsg}</span>
          </div>
        )}

        {/* Bulk Import Drawer */}
        {isBulkAdding && (
          <form onSubmit={handleBulkSubmit} className="p-5 bg-stone-50 border-b border-stone-200 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-stone-600" />
                <span>Quick Batch Add Guests by Email Address</span>
              </span>
              <button
                type="button"
                onClick={() => setIsBulkAdding(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Cancel
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              Paste email addresses separated by commas, semicolons, or newlines. We will automatically create guest records for each valid email.
            </p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="e.g. friend1@gmail.com, family@yahoo.com, cousin@outlook.com"
              rows={3}
              className="w-full text-xs rounded-xl border border-stone-300 p-3 bg-white outline-none focus:border-stone-500"
            />
            {formError && <p className="text-xs text-red-600 mt-1">{formError}</p>}
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Import Addresses
              </button>
            </div>
          </form>
        )}

        {/* Add Guest Drawer */}
        {isAddingGuest && (
          <form onSubmit={handleAddSubmit} className="p-5 bg-stone-50 border-b border-stone-200 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-stone-600" />
                <span>Add New Guest with Email Address</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingGuest(false)}
                className="text-stone-400 hover:text-stone-700 text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  placeholder="e.g. maya.lin@gmail.com"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Group Classification</label>
                <select
                  value={newGuestGroup}
                  onChange={(e) => setNewGuestGroup(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500"
                >
                  <option value="attending">General Guest (Attending)</option>
                  <option value="bridal_party">Bridal Party / VIP</option>
                  <option value="all">General Invited</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">RSVP Status</label>
                <select
                  value={newGuestRsvp}
                  onChange={(e) => setNewGuestRsvp(e.target.value as any)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500"
                >
                  <option value="attending">Attending</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Custom Tag / Role</label>
                <input
                  type="text"
                  value={newGuestPartyTag}
                  onChange={(e) => setNewGuestPartyTag(e.target.value)}
                  placeholder="e.g. Bridesmaid, Cousin, College Friend"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-stone-500"
                />
              </div>
            </div>

            {formError && <p className="text-xs text-red-600 mt-2">{formError}</p>}

            <div className="flex justify-end space-x-2 mt-3 pt-2 border-t border-stone-200/60">
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Save Guest to Directory
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          {/* Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Guests ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('attending')}
              className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                activeTab === 'attending'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Attending ({attendingCount})
            </button>
            <button
              onClick={() => setActiveTab('bridal_party')}
              className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                activeTab === 'bridal_party'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Bridal Party ({bridalPartyCount})
            </button>
            <button
              onClick={() => setActiveTab('has_email')}
              className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                activeTab === 'has_email'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Has Email ({withEmailCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs placeholder-stone-400 outline-none focus:border-stone-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Guest Table */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {filteredGuests.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-xs">
              <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-700">No matching guests found</p>
              <p className="mt-1">Try adjusting your search query or add a new guest with an email above.</p>
            </div>
          ) : (
            filteredGuests.map((guest) => {
              const isEditingThis = editingGuestId === guest.id;
              return (
                <div
                  key={guest.id}
                  className="px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50/70 transition"
                >
                  {/* Guest Info */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 font-bold text-xs shrink-0 mt-0.5">
                      {(guest.name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-stone-900 text-xs truncate">{guest.name}</span>
                        {guest.partyTag && (
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium border border-stone-200">
                            {guest.partyTag}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded-full font-semibold capitalize ${
                            guest.rsvpStatus === 'attending'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : guest.rsvpStatus === 'declined'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {guest.rsvpStatus}
                        </span>
                      </div>

                      {/* Email and Phone */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-stone-500">
                        {isEditingThis ? (
                          <div className="flex items-center space-x-1 w-full max-w-sm mt-1">
                            <input
                              type="email"
                              defaultValue={guest.email}
                              id={`edit-email-${guest.id}`}
                              className="bg-white border border-stone-300 rounded px-2 py-1 text-xs text-stone-900 flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`edit-email-${guest.id}`) as HTMLInputElement;
                                if (input && input.value.includes('@')) {
                                  onUpdateGuest({ ...guest, email: input.value.trim().toLowerCase() });
                                  setEditingGuestId(null);
                                }
                              }}
                              className="px-2 py-1 bg-stone-800 text-white rounded text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGuestId(null)}
                              className="px-2 py-1 text-stone-500 hover:text-stone-800 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 font-mono text-stone-700">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            <span className="font-sans font-medium">{guest.email}</span>
                          </div>
                        )}

                        {guest.phone && (
                          <div className="flex items-center space-x-1 text-stone-500">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{guest.phone}</span>
                          </div>
                        )}

                        {guest.dietary && (
                          <span className="bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded text-[10px]">
                            {guest.dietary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                    {/* Quick send test email to this specific guest */}
                    <button
                      type="button"
                      onClick={() => handleSendSingleEmail(guest)}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                      title={`Send schedule update email directly to ${guest.email}`}
                    >
                      {sentRecipientEmail === guest.email ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold text-[11px]">Dispatched!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-stone-500" />
                          <span className="text-[11px]">Send Update</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingGuestId(isEditingThis ? null : guest.id)}
                      className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
                      title="Edit email address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove ${guest.name} from the guest directory?`)) {
                          onDeleteGuest(guest.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove guest"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-[#FAF9F6] flex items-center justify-between shrink-0 text-xs">
          <div className="text-stone-500">
            Showing <strong className="text-stone-800">{filteredGuests.length}</strong> of{' '}
            <strong className="text-stone-800">{totalCount}</strong> guests
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition"
            >
              Done Managing Guests
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
