import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Send, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ArrowRight,
  Info,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Eye,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { NotificationStatusDetails, SentEmailRecord } from '../types';
import { sendScheduleEmail, checkEmailConfigStatus, EmailConfigStatus, SendEmailResult } from '../services/emailService';

interface NotificationStatusModalProps {
  details: NotificationStatusDetails;
  isOpen: boolean;
  onClose: () => void;
  onTriggerNotifyNow: () => void;
  onOpenEmailPreview?: () => void;
  onSendCopyEmail?: (email: string) => void;
}

export const NotificationStatusModal: React.FC<NotificationStatusModalProps> = ({
  details,
  isOpen,
  onClose,
  onTriggerNotifyNow,
  onOpenEmailPreview,
  onSendCopyEmail,
}) => {
  if (!isOpen) return null;

  const { type, event, recipientsCount = 42, channels, note, timestamp, previousSchedule, sentEmails = [] } = details;
  const [showDevicePreview, setShowDevicePreview] = useState(false);
  const [showEmailList, setShowEmailList] = useState(false);
  const [copyEmailInput, setCopyEmailInput] = useState('duhitabiswas95156@gmail.com');
  const [isSendingCopy, setIsSendingCopy] = useState(false);
  const [copyResult, setCopyResult] = useState<SendEmailResult | null>(null);
  const [configStatus, setConfigStatus] = useState<EmailConfigStatus | null>(null);

  useEffect(() => {
    checkEmailConfigStatus().then(setConfigStatus);
  }, []);

  const formattedNewSchedule = event.isDateTBA
    ? 'Date To Be Announced'
    : `${event.formattedDate} at ${event.startTime || '4:00 PM'}`;

  const handleSendCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyEmailInput.trim() || !copyEmailInput.includes('@')) return;

    setIsSendingCopy(true);
    setCopyResult(null);

    try {
      const res = await sendScheduleEmail({
        to: copyEmailInput.trim(),
        event,
        personalNote: note,
      });
      setCopyResult(res);
      onSendCopyEmail?.(copyEmailInput.trim());
    } catch (err: any) {
      setCopyResult({
        success: false,
        configured: false,
        provider: 'none',
        error: err.message || 'Dispatch failed',
      });
    } finally {
      setIsSendingCopy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[580px] rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Close Button */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            {type === 'sent' 
              ? 'Dispatch Report' 
              : type === 'silent_pending' 
                ? 'Action Required' 
                : 'Save Confirmation'}
          </span>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-7 py-3 overflow-y-auto space-y-4 flex-1 text-sm">
          
          {/* ================= STATE 1: NOTIFIED / MESSAGES SENT ================= */}
          {type === 'sent' && (
            <div className="space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    Guest Notifications Dispatched!
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your updates for <strong className="text-gray-800 font-semibold">{event.name}</strong> have been successfully delivered to your guests.
                  </p>
                </div>
              </div>

              {/* Delivery Stats Card */}
              <div className="bg-[#FAF9F6] border border-[#E9E7E0] rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">New Schedule Sent:</span>
                  <span className="font-semibold text-gray-900 text-right">{formattedNewSchedule}</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-gray-200/60">
                  <span className="text-gray-500 font-medium">Audience Notified:</span>
                  <span className="font-semibold text-gray-900">
                    {details.recipientGroup === 'all' 
                      ? `All Invited Guests (${recipientsCount})` 
                      : details.recipientGroup === 'attending' 
                        ? `Attending Only (${recipientsCount})` 
                        : `Bridal Party Only (${recipientsCount})`}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-gray-500 font-medium">Delivery Channels:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {channels?.whatsapp && (
                      <div className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-800 text-[11px]">WhatsApp</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Sent ({recipientsCount})
                        </span>
                      </div>
                    )}
                    {channels?.email && (
                      <div className="flex items-center justify-between bg-white border border-indigo-200 px-3 py-2 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-indigo-600" />
                          <span className="font-semibold text-gray-800 text-[11px]">Branded Email</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Delivered ({sentEmails.length > 0 ? sentEmails.length : recipientsCount})
                        </span>
                      </div>
                    )}
                    {channels?.sms && (
                      <div className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <span className="font-semibold text-gray-800 text-[11px]">SMS Text</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                          Sent ({recipientsCount})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {note && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <div className="text-gray-500 font-medium text-[11px] mb-1">Personal Note Attached:</div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-gray-700 italic text-[11px]">
                      "{note}"
                    </div>
                  </div>
                )}
              </div>

              {/* Functional Email Recipient Log */}
              {channels?.email && sentEmails.length > 0 && (
                <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-bold text-indigo-950 text-xs">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Email Delivery Log ({sentEmails.length} dispatched)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={onOpenEmailPreview}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 hover:underline"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailList(!showEmailList)}
                        className="text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200"
                      >
                        {showEmailList ? 'Hide List' : 'View Addresses'}
                      </button>
                    </div>
                  </div>

                  {showEmailList && (
                    <div className="max-h-40 overflow-y-auto divide-y divide-indigo-100/70 bg-white rounded-xl border border-indigo-100 text-[11px]">
                      {sentEmails.map((item, idx) => (
                        <div key={idx} className="px-3 py-1.5 flex items-center justify-between">
                          <div className="truncate mr-2">
                            <span className="font-semibold text-stone-900 mr-1.5">{item.guestName}</span>
                            <span className="text-stone-500 font-mono text-[10px]">{item.guestEmail}</span>
                          </div>
                          <span className="shrink-0 px-2 py-0.2 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px] border border-emerald-200">
                            Delivered
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Send Copy Form */}
                  <div className="pt-2 space-y-2">
                    <form onSubmit={handleSendCopy} className="flex items-center space-x-1.5">
                    <input
                      type="email"
                      required
                      value={copyEmailInput}
                      onChange={(e) => setCopyEmailInput(e.target.value)}
                      placeholder="Send a copy to an email (e.g. duhitabiswas95156@gmail.com)..."
                      className="flex-1 bg-white border border-indigo-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-indigo-400"
                    />
                    <button
                      type="submit"
                      disabled={isSendingCopy}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center space-x-1 cursor-pointer"
                    >
                      {isSendingCopy ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Copy</span>
                        </>
                      )}
                    </button>
                  </form>

                  {copyResult && (
                    <div className={`p-2.5 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                      copyResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className="flex items-start space-x-1.5">
                        {copyResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="text-[11px] leading-relaxed">
                          {copyResult.success ? (
                            <span>Delivered schedule update to <strong>{copyEmailInput}</strong> via {copyResult.provider.toUpperCase()}!</span>
                          ) : (
                            <span>
                              <strong>Live API Setup Needed:</strong> {copyResult.hint || 'Add RESEND_API_KEY in Settings to deliver automatically.'}
                            </span>
                          )}
                        </div>
                      </div>

                      {copyResult.mailtoUrl && (
                        <a
                          href={copyResult.mailtoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-xs transition"
                        >
                          <span>Open in Gmail / Mail Client</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

              {/* Guest Phone View Toggle */}
              <div>
                <button
                  onClick={() => setShowDevicePreview(!showDevicePreview)}
                  className="w-full flex items-center justify-between py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
                >
                  <span className="flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{showDevicePreview ? 'Hide Instant Notification Preview' : 'View What Guests Received'}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDevicePreview ? 'rotate-180' : ''}`} />
                </button>

                {showDevicePreview && (
                  <div className="mt-2 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-[11px]">
                      <span>WhatsApp Notification Preview</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5 text-stone-800">
                      <p className="font-medium text-xs">
                        💌 <strong>Elena &amp; Julian's Wedding:</strong> The schedule for <strong>{event.name}</strong> has been updated!
                      </p>
                      <p className="text-[11px] text-stone-600">
                        🗓️ <strong>New Time:</strong> {formattedNewSchedule}
                      </p>
                      {note && (
                        <p className="text-[11px] text-stone-500 italic bg-stone-50 p-1.5 rounded-md">
                          "{note}"
                        </p>
                      )}
                      <div className="pt-1 text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                        <span>Tap to update your calendar &amp; RSVP</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= STATE 2: UPDATED SILENTLY / NOTIFICATION PENDING ================= */}
          {type === 'silent_pending' && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Schedule Changed — Guests Have NOT Been Informed
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    You chose to update <strong className="text-gray-800 font-semibold">{event.name}</strong> silently.
                  </p>
                </div>
              </div>

              {/* High-visibility Action Callout */}
              <div className="bg-amber-50/80 border-2 border-amber-200 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Important Next Step: Send Update Before The Event</span>
                </div>
                <p className="text-amber-800 leading-relaxed text-xs">
                  Your event is now saved with the new time in the builder, but <strong>guests currently hold the previous schedule</strong>. You have not yet informed them of this change.
                </p>
                <p className="text-amber-800 text-[11px]">
                  We have marked this event with a <span className="font-semibold bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-900">⚠️ Notification Pending</span> badge in your timeline so you can send updates anytime.
                </p>
              </div>

              {/* Time Change Comparison */}
              <div className="bg-[#FAF9F6] border border-[#E9E7E0] rounded-2xl p-3.5 text-xs">
                <div className="text-gray-500 font-medium mb-2 text-[11px] uppercase tracking-wider">
                  Schedule Comparison
                </div>
                <div className="flex items-center justify-between bg-white border border-gray-200 p-2.5 rounded-xl">
                  <div>
                    <span className="text-gray-400 text-[10px] block font-semibold uppercase">Previous Time</span>
                    <span className="text-gray-500 line-through text-xs font-medium">
                      {previousSchedule || 'Thursday, Sep 16 at 5:00 PM'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 mx-2" />
                  <div>
                    <span className="text-emerald-600 text-[10px] block font-semibold uppercase">New Unnotified Time</span>
                    <span className="text-gray-900 text-xs font-bold">
                      {formattedNewSchedule}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STATE 3: DIRECT SAVE (NO DATE/TIME CHANGE) ================= */}
          {type === 'direct_saved' && (
            <div className="space-y-4 text-center sm:text-left">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-stone-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    Schedule Details Updated
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated details for <strong className="text-gray-800 font-semibold">{event.name}</strong> were saved successfully.
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-600 leading-relaxed">
                <div className="font-semibold text-stone-800 mb-1">Date &amp; Time Remained Unchanged:</div>
                The event's date and timing were not modified. Consequently, the guest notification dialog was skipped, and no unnecessary messages were dispatched to your guest list.
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-7 py-4 border-t border-gray-100 bg-[#FBFBFA] flex items-center justify-between shrink-0">
          {type === 'silent_pending' ? (
            <>
              <button 
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                I’ll Inform Guests Later
              </button>
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerNotifyNow();
                }}
                className="px-5 py-2.5 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notify Guests Now</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              {channels?.email ? (
                <button
                  type="button"
                  onClick={onOpenEmailPreview}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Guest Email Template</span>
                </button>
              ) : <div />}

              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#2D2D2D] hover:bg-black text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

