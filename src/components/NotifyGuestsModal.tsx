import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Send, 
  Check, 
  Users, 
  Filter,
  Mail,
  Eye,
  Plus,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ScheduleItem, RecipientType, Guest, SentEmailRecord } from '../types';

interface NotifyGuestsModalProps {
  event: ScheduleItem;
  guests: Guest[];
  onClose: () => void; // Keep Editing
  onConfirmSend: (details: {
    recipients: RecipientType;
    channels: { whatsapp: boolean; email: boolean; sms: boolean };
    personalNote: string;
    targetGuests: Guest[];
    extraEmails: string[];
  }) => void;
  onSilentUpdate: () => void;
  onOpenGuestList?: () => void;
  onOpenEmailPreview?: () => void;
  onSendTestEmail?: (email: string, guestName: string) => void;
}

export const NotifyGuestsModal: React.FC<NotifyGuestsModalProps> = ({
  event,
  guests,
  onClose,
  onConfirmSend,
  onSilentUpdate,
  onOpenGuestList,
  onOpenEmailPreview,
  onSendTestEmail,
}) => {
  const [recipient, setRecipient] = useState<RecipientType>('all');
  const [channels, setChannels] = useState({
    whatsapp: true,
    email: true,
    sms: false,
  });
  const [personalNote, setPersonalNote] = useState('');
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [newExtraEmail, setNewExtraEmail] = useState('');
  const [testEmailAddress, setTestEmailAddress] = useState('duhitabiswas95156@gmail.com');
  const [testEmailSentSuccess, setTestEmailSentSuccess] = useState(false);
  const [showEmailDetails, setShowEmailDetails] = useState(false);

  const toggleChannel = (channel: 'whatsapp' | 'email' | 'sms') => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  // Compute recipient counts from real guests
  const totalGuestsCount = guests.length;
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending');
  const bridalPartyGuests = guests.filter((g) => g.group === 'bridal_party');

  const activeTargetGuests =
    recipient === 'all'
      ? guests
      : recipient === 'attending'
        ? attendingGuests
        : bridalPartyGuests;

  const validEmailsCount = activeTargetGuests.filter((g) => g.email && g.email.includes('@')).length + extraEmails.length;

  const handleAddExtraEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExtraEmail.trim() || !newExtraEmail.includes('@')) return;
    const clean = newExtraEmail.trim().toLowerCase();
    if (!extraEmails.includes(clean)) {
      setExtraEmails([...extraEmails, clean]);
    }
    setNewExtraEmail('');
  };

  const handleRemoveExtraEmail = (emailToRemove: string) => {
    setExtraEmails(extraEmails.filter((e) => e !== emailToRemove));
  };

  const handleTriggerTestEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) return;
    onSendTestEmail?.(testEmailAddress.trim(), 'Honored Guest');
    setTestEmailSentSuccess(true);
    setTimeout(() => setTestEmailSentSuccess(false), 4000);
  };

  const formattedDateTimeString = event.isDateTBA
    ? 'Date To Be Announced'
    : `${event.formattedDate} at ${event.startTime || '4:00 PM'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-[560px] rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-7 flex flex-col z-50 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200" 
        id="notify-guest-modal"
      >
        {/* Notice Header */}
        <div className="flex items-start justify-between pb-2">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
              <Bell className="w-5 h-5 fill-amber-500/20 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                Notify Guests of Schedule Update?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Date/time modified for <strong className="text-gray-800 font-semibold">{event.name}</strong>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
            id="close-notify-modal"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Change summary card */}
        <div className="bg-[#F8F7F4] border border-[#EBE8E1] rounded-2xl p-3.5 my-2.5 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
            <div>
              <span className="text-gray-500">New Schedule:</span>
              <span className="font-semibold text-gray-900 ml-1.5">{formattedDateTimeString}</span>
            </div>
          </div>
          <span className="text-[11px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-700 font-medium whitespace-nowrap">
            {(event?.timezone || 'GMT+05:30').split(' ')[0]}
          </span>
        </div>

        {/* Recipient Audience Selector */}
        <div className="my-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700">Recipients</label>
            <button 
              type="button"
              onClick={onOpenGuestList}
              className="text-xs text-[#2D2D2D] hover:underline font-medium flex items-center space-x-1"
            >
              <Users className="w-3 h-3" />
              <span>Manage Guest Directory ({totalGuestsCount})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button"
              onClick={() => setRecipient('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                recipient === 'all'
                  ? 'bg-[#2D2D2D] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>All Invited Guests ({totalGuestsCount})</span>
              {recipient === 'all' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>

            <button 
              type="button"
              onClick={() => setRecipient('attending')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                recipient === 'attending'
                  ? 'bg-[#2D2D2D] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>Attending Only ({attendingGuests.length})</span>
              {recipient === 'attending' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>

            <button 
              type="button"
              onClick={() => setRecipient('bridal_party')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center space-x-1.5 transition-all ${
                recipient === 'bridal_party'
                  ? 'bg-[#2D2D2D] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>Bridal Party Only ({bridalPartyGuests.length})</span>
              {recipient === 'bridal_party' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>
          </div>
        </div>

        {/* Channel Delivery Options */}
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700 block">Notification Channels</label>
            {channels.email && (
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {validEmailsCount} Email Addresses Targeted
              </span>
            )}
          </div>
          
          {/* Option 1: WhatsApp */}
          <label 
            onClick={() => toggleChannel('whatsapp')}
            className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
              channels.whatsapp ? 'border-gray-300 bg-white shadow-2xs' : 'border-gray-200 bg-gray-50/50 opacity-75'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox"
                checked={channels.whatsapp} 
                onChange={() => {}}
                className="rounded text-[#2D2D2D] focus:ring-0 w-4 h-4 border-gray-300 cursor-pointer" 
              />
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-800">WhatsApp Instant Message</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Recommended
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-400 font-medium">98% Open Rate</span>
          </label>

          {/* Option 2: Email (FUNCTIONAL) */}
          <div className={`rounded-2xl border transition ${
            channels.email ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 bg-gray-50/50 opacity-75'
          }`}>
            <div 
              onClick={() => toggleChannel('email')}
              className="flex items-center justify-between p-3 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  checked={channels.email} 
                  onChange={() => {}}
                  className="rounded text-indigo-600 focus:ring-0 w-4 h-4 border-gray-300 cursor-pointer" 
                />
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-gray-900">Email Notification</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                    Functional Branded Template
                  </span>
                </div>
              </div>
              <span className="text-xs text-indigo-600 font-semibold">Active</span>
            </div>

            {/* Functional Email Management Drawer */}
            {channels.email && (
              <div className="px-3.5 pb-3 pt-1 border-t border-indigo-100 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-600 font-medium">
                    Emails will be delivered to <strong>{validEmailsCount}</strong> guest addresses.
                  </span>
                  <button
                    type="button"
                    onClick={onOpenEmailPreview}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 hover:underline"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview Branded Email</span>
                  </button>
                </div>

                {/* Direct quick-add email */}
                <form onSubmit={handleAddExtraEmail} className="flex items-center space-x-1.5">
                  <input
                    type="email"
                    value={newExtraEmail}
                    onChange={(e) => setNewExtraEmail(e.target.value)}
                    placeholder="Input additional email to notify (e.g. planner@wedding.com)..."
                    className="flex-1 bg-white border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 transition"
                  >
                    + Add
                  </button>
                </form>

                {extraEmails.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {extraEmails.map((em) => (
                      <span
                        key={em}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 bg-white border border-indigo-200 rounded-lg text-[11px] text-indigo-900"
                      >
                        <span>{em}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExtraEmail(em)}
                          className="text-stone-400 hover:text-stone-700 ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Instant Send Test Email Feature */}
                <div className="bg-white border border-indigo-100 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 w-full sm:w-auto flex-1">
                    <span className="text-[11px] text-stone-500 font-medium whitespace-nowrap">Test email:</span>
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800 outline-none focus:border-indigo-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerTestEmail}
                    className="px-3 py-1 bg-stone-800 hover:bg-black text-white text-[11px] font-semibold rounded-lg shrink-0 transition flex items-center space-x-1 cursor-pointer"
                  >
                    {testEmailSentSuccess ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Test Dispatched!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Send Test</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Option 3: SMS */}
          <label 
            onClick={() => toggleChannel('sms')}
            className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
              channels.sms ? 'border-gray-300 bg-white shadow-2xs' : 'border-gray-200 bg-gray-50/50 opacity-75'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox"
                checked={channels.sms} 
                onChange={() => {}}
                className="rounded text-[#2D2D2D] focus:ring-0 w-4 h-4 border-gray-300 cursor-pointer" 
              />
              <span className="text-xs font-semibold text-gray-800">SMS / Text Message</span>
            </div>
            <span className="text-xs text-gray-400 font-medium">Standard carrier rates</span>
          </label>
        </div>

        {/* Optional Custom Message Box */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Add personal note to email &amp; messages (Optional)
          </label>
          <textarea 
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 focus:ring-0 focus:border-gray-400 placeholder-gray-400 p-2.5 outline-none transition-colors" 
            placeholder="e.g., We moved our rehearsal earlier so we can enjoy sunset drinks together!" 
            rows={2}
          />
        </div>

        {/* Modal Footer / Primary Execution Buttons */}
        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
          <button 
            type="button"
            onClick={onSilentUpdate}
            className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors" 
            id="silent-save-btn"
          >
            Update Silently (Don’t Notify)
          </button>
          
          <div className="flex items-center space-x-2.5">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors rounded-full" 
              id="cancel-notify-btn"
            >
              Keep Editing
            </button>
            <button 
              type="button"
              onClick={() => onConfirmSend({
                recipients: recipient,
                channels,
                personalNote,
                targetGuests: activeTargetGuests,
                extraEmails,
              })}
              className="px-5 py-2.5 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-full shadow-sm transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer" 
              id="send-notify-btn"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm &amp; Send Updates ({activeTargetGuests.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

