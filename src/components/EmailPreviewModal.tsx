import React, { useState } from 'react';
import { X, Send, Mail, CheckCircle2, Monitor, Smartphone, Calendar, MapPin, Clock, ArrowRight, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { ScheduleItem, Guest } from '../types';
import { sendScheduleEmail, SendEmailResult } from '../services/emailService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ScheduleItem;
  personalNote?: string;
  guests?: Guest[];
  onSendTestEmail?: (targetEmail: string, guestName: string) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  event,
  personalNote,
  guests = [],
  onSendTestEmail,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedGuestId, setSelectedGuestId] = useState<string>(guests?.[0]?.id || '');
  const [testEmailInput, setTestEmailInput] = useState('duhitabiswas95156@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendEmailResult | null>(null);

  if (!isOpen || !event) return null;

  const currentGuest = (guests && guests.length > 0)
    ? (guests.find((g) => g.id === selectedGuestId) || guests[0])
    : {
        id: 'default-guest',
        name: 'Honored Guest',
        email: 'guest@example.com',
      };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.trim()) return;

    setIsSending(true);
    setSendResult(null);

    try {
      const result = await sendScheduleEmail({
        to: testEmailInput.trim(),
        event,
        guestName: currentGuest.name,
        personalNote,
      });

      setSendResult(result);
      onSendTestEmail?.(testEmailInput.trim(), currentGuest.name);
    } catch (err: any) {
      setSendResult({
        success: false,
        configured: false,
        provider: 'none',
        error: err.message || 'Failed to connect to email service',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formattedDateTime = event.isDateTBA
    ? 'Date To Be Announced'
    : `${event.formattedDate} at ${event.startTime || '4:00 PM'}`;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8F7F4] w-full max-w-[640px] rounded-3xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-6 py-3.5 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 leading-tight">Branded Email Template Preview</h3>
              <p className="text-[11px] text-stone-500">Live rendering of the email sent to guests</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Viewport switch */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1 rounded-md text-xs transition ${
                  deviceMode === 'desktop' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Desktop Email Client View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1 rounded-md text-xs transition ${
                  deviceMode === 'mobile' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Mobile Email Client View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recipient Picker Toolbar */}
        <div className="px-6 py-2.5 bg-stone-100/80 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-medium">Previewing for recipient:</span>
            <select
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 font-medium focus:ring-1 focus:ring-stone-400 outline-none"
            >
              {(guests && guests.length > 0) ? (
                guests.slice(0, 15).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.email})
                  </option>
                ))
              ) : (
                <option value="">Honored Guest (guest@example.com)</option>
              )}
            </select>
          </div>

          <div className="text-[11px] text-stone-500">
            Subject: <strong className="text-stone-800 font-semibold">Schedule Update: {event.name}</strong>
          </div>
        </div>

        {/* Email Body Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-[#EFECE6]">
          <div
            className={`bg-white rounded-2xl shadow-md border border-stone-200/90 overflow-hidden transition-all duration-200 ${
              deviceMode === 'mobile' ? 'max-w-[360px] w-full' : 'max-w-[500px] w-full'
            }`}
          >
            {/* Joy Email Header */}
            <div className="bg-[#2D2D2D] text-white px-6 pt-7 pb-6 text-center">
              <div className="inline-block tracking-widest text-[10px] uppercase font-serif text-stone-300 mb-1">
                withjoy wedding announcement
              </div>
              <h2 className="font-serif italic text-2xl font-bold tracking-tight text-white">
                Elena &amp; Julian
              </h2>
              <div className="text-[11px] text-stone-300 mt-1 font-sans">
                September 16–18, 2027 • San Francisco, California
              </div>
            </div>

            {/* Email Message Content */}
            <div className="p-6 sm:p-7 space-y-4 text-stone-800">
              <div className="text-center pb-2 border-b border-stone-100">
                <span className="inline-block px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-[11px] font-semibold tracking-wide uppercase">
                  Schedule Update Notice
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-2">
                  Dear {currentGuest.name},
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  We have updated the date and time for the <strong>{event.name}</strong> on our wedding itinerary. Please review the new timing below:
                </p>
              </div>

              {/* Event Details Highlight Card */}
              <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-stone-900">{event.name}</span>
                  <span className="text-[10px] bg-stone-200/70 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start space-x-2.5 text-stone-700">
                    <Calendar className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-stone-900">{formattedDateTime}</div>
                      <div className="text-[11px] text-stone-500">{event.timezone}</div>
                    </div>
                  </div>

                  {event.venue && (
                    <div className="flex items-start space-x-2.5 text-stone-700 pt-1">
                      <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-stone-900">{event.venue}</div>
                        <div className="text-[11px] text-stone-500">San Francisco, CA</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal Note if present */}
                {personalNote && (
                  <div className="mt-3 pt-3 border-t border-stone-200/70">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">
                      A Note From Elena &amp; Julian
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-stone-200/80 text-xs italic text-stone-700 leading-relaxed">
                      "{personalNote}"
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => alert(`Simulated RSVP action for ${currentGuest.name}`)}
                  className="inline-block w-full py-3 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  View Full Itinerary &amp; RSVP
                </button>
                <p className="text-[10px] text-stone-400 mt-2">
                  Delivered to {currentGuest.email} via withjoy.com
                </p>
              </div>
            </div>

            {/* Email Footer */}
            <div className="bg-stone-50 border-t border-stone-200/60 p-4 text-center text-[10px] text-stone-400 space-y-1">
              <p>You received this because you are an invited guest for Elena &amp; Julian’s Wedding.</p>
              <p>© 2027 Joy Wedding Services Inc. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Interactive Test Dispatch Bar */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0 space-y-2.5">
          <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
              <span className="font-semibold text-stone-700 whitespace-nowrap text-xs">Send Test Copy To:</span>
              <input
                type="email"
                required
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="Enter any email address..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-stone-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs flex items-center space-x-1.5 transition active:scale-95 text-xs cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-semibold transition text-xs"
              >
                Close Preview
              </button>
            </div>
          </form>

          {/* Delivery Response Status Feedback */}
          {sendResult && (
            <div className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
              sendResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-start space-x-2">
                {sendResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  {sendResult.success ? (
                    <div>
                      <strong>Email delivered successfully to {testEmailInput}!</strong>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Provider: {sendResult.provider.toUpperCase()} {sendResult.messageId ? `• ID: ${sendResult.messageId}` : ''}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong>Live Internet Delivery Setup Notice:</strong>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {sendResult.hint || 'Configure RESEND_API_KEY in .env / Settings to send live emails directly from the server.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {sendResult.mailtoUrl && (
                <a
                  href={sendResult.mailtoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs transition"
                >
                  <span>Open in Gmail / Email Client</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
