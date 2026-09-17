/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { ScheduleSidebar } from './components/ScheduleSidebar';
import { CanvasPreview } from './components/CanvasPreview';
import { EditScheduleModal } from './components/EditScheduleModal';
import { NotifyGuestsModal } from './components/NotifyGuestsModal';
import { NotificationStatusModal } from './components/NotificationStatusModal';
import { SupportChatModal } from './components/SupportChatModal';
import { PageSettingsModal } from './components/PageSettingsModal';
import { GuestListModal } from './components/GuestListModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { INITIAL_SCHEDULE_ITEMS } from './mockData';
import { INITIAL_GUESTS } from './guestData';
import { ScheduleItem, ViewportMode, RecipientType, NotificationStatusDetails, Guest, SentEmailRecord } from './types';
import { sendScheduleEmail } from './services/emailService';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ScheduleItem[]>(INITIAL_SCHEDULE_ITEMS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isPublished, setIsPublished] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Modals state
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState<boolean>(false);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [isPageSettingsOpen, setIsPageSettingsOpen] = useState(false);
  const [isGuestListOpen, setIsGuestListOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);

  // Status & Confirmation Screen state
  const [statusDetails, setStatusDetails] = useState<NotificationStatusDetails | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Guest Management Handlers
  const handleAddGuest = (newGuest: Omit<Guest, 'id'>) => {
    const createdGuest: Guest = {
      ...newGuest,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setGuests((prev) => [createdGuest, ...prev]);
    showToast(`Added ${createdGuest.name} (${createdGuest.email}) to guest list.`);
  };

  const handleUpdateGuest = (updatedGuest: Guest) => {
    setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
    showToast(`Updated contact details for ${updatedGuest.name}.`);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    showToast('Guest removed from directory.');
  };

  const handleBulkAddGuests = (emails: string[]) => {
    const newRecords: Guest[] = emails.map((email, idx) => {
      const username = email.split('@')[0];
      const formattedName = username
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      return {
        id: `bulk-${Date.now()}-${idx}`,
        name: formattedName || 'Wedding Guest',
        email,
        group: 'attending',
        rsvpStatus: 'attending',
        plusOnes: 0,
        partyTag: 'Invited Guest',
      };
    });

    setGuests((prev) => [...newRecords, ...prev]);
    showToast(`Imported ${newRecords.length} guest email addresses!`);
  };

  // Open item for editing
  const handleSelectItem = (item: ScheduleItem) => {
    setEditingItem(item);
    setShowNotifyModal(false);
  };

  // Create new event
  const handleAddNew = () => {
    const newItem: ScheduleItem = {
      id: `new-${Date.now()}`,
      name: 'Afterparty & Cocktails',
      description: 'Join us for late-night music and drinks following the main reception.',
      timingMode: 'start_only',
      date: '2027-09-17',
      formattedDate: 'Friday, September 17, 2027',
      startTime: '10:00 PM',
      timezone: 'GMT+05:30 Kolkata',
      format: 'in_person',
      venue: 'Speakeasy Lounge',
      audience: 'All Guests',
      isDateTBA: false,
      order: items.length + 1,
    };
    setEditingItem(newItem);
    setShowNotifyModal(false);
  };

  // Save event from Edit Modal:
  // ONLY trigger notify modal if date or time of event was modified!
  const handleSaveEvent = (updatedItem: ScheduleItem, triggerNotify: boolean) => {
    setEditingItem(updatedItem);
    if (triggerNotify) {
      // Date or time modified -> show notification prompt
      setShowNotifyModal(true);
    } else {
      // Date and time were NOT changed -> direct save and show confirmation screen
      applyEventSave({ ...updatedItem, hasPendingNotification: false });
      setStatusDetails({
        type: 'direct_saved',
        event: updatedItem,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      showToast(`Saved changes for "${updatedItem.name}" without notifying guests.`);
      setEditingItem(null);
    }
  };

  const applyEventSave = (itemToSave: ScheduleItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === itemToSave.id);
      if (exists) {
        return prev.map((i) => (i.id === itemToSave.id ? itemToSave : i));
      } else {
        return [...prev, itemToSave];
      }
    });
  };

  // Secondary confirmation: Send Notifications
  const handleConfirmSendNotification = (details: {
    recipients: RecipientType;
    channels: { whatsapp: boolean; email: boolean; sms: boolean };
    personalNote: string;
    targetGuests: Guest[];
    extraEmails: string[];
  }) => {
    if (editingItem) {
      const savedItem: ScheduleItem = {
        ...editingItem,
        hasPendingNotification: false,
        lastNotifiedAt: new Date().toISOString(),
      };
      applyEventSave(savedItem);

      const targetList = details.targetGuests || [];
      const recipientCount = targetList.length + (details.extraEmails?.length || 0);

      // Generate realistic SentEmailRecord entries for each recipient
      const generatedSentEmails: SentEmailRecord[] = [];
      if (details.channels.email) {
        targetList.forEach((g, idx) => {
          if (g.email && g.email.includes('@')) {
            generatedSentEmails.push({
              id: `email-${Date.now()}-${idx}`,
              guestId: g.id,
              guestEmail: g.email,
              guestName: g.name,
              eventId: savedItem.id,
              eventName: savedItem.name,
              subject: `Schedule Update: ${savedItem.name}`,
              sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              newSchedule: `${savedItem.formattedDate} at ${savedItem.startTime || '4:00 PM'}`,
              venue: savedItem.venue,
              personalNote: details.personalNote || undefined,
              status: 'delivered',
            });
          }
        });

        // Add any extra on-the-fly emails
        details.extraEmails?.forEach((extraEm, idx) => {
          generatedSentEmails.push({
            id: `email-extra-${Date.now()}-${idx}`,
            guestEmail: extraEm,
            guestName: 'Direct Recipient',
            eventId: savedItem.id,
            eventName: savedItem.name,
            subject: `Schedule Update: ${savedItem.name}`,
            sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            newSchedule: `${savedItem.formattedDate} at ${savedItem.startTime || '4:00 PM'}`,
            venue: savedItem.venue,
            personalNote: details.personalNote || undefined,
            status: 'delivered',
          });
        });
      }

      // Show comprehensive "Messages Sent" confirmation screen with email logs!
      setStatusDetails({
        type: 'sent',
        event: savedItem,
        recipientsCount: recipientCount,
        recipientGroup: details.recipients,
        channels: details.channels,
        note: details.personalNote,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sentEmails: generatedSentEmails,
      });

      // Trigger live backend dispatch if email is selected
      if (details.channels.email && generatedSentEmails.length > 0) {
        const recipientEmails = generatedSentEmails.map((e) => e.guestEmail);
        sendScheduleEmail({
          to: recipientEmails,
          event: savedItem,
          personalNote: details.personalNote,
        }).then((res) => {
          if (res.success) {
            showToast(`Live emails delivered to ${res.recipientsCount || recipientEmails.length} recipients via ${res.provider}!`);
          } else if (!res.configured) {
            showToast(`Formatted schedule updates for ${recipientEmails.length} guests! To auto-dispatch live across the web, configure RESEND_API_KEY.`);
          }
        });
      }

      showToast(
        details.channels.email
          ? `Dispatched schedule emails to ${generatedSentEmails.length} guest addresses!`
          : `Dispatched updates to ${recipientCount} guests!`
      );
      setShowNotifyModal(false);
      setEditingItem(null);
    }
  };

  // Secondary confirmation: Silent Save (Guests NOT informed)
  const handleSilentUpdate = () => {
    if (editingItem) {
      const savedItem: ScheduleItem = {
        ...editingItem,
        hasPendingNotification: true, // Marked as pending notification!
      };
      applyEventSave(savedItem);

      // Show "Updated Silently / Notification Pending" warning screen
      setStatusDetails({
        type: 'silent_pending',
        event: savedItem,
        recipientsCount: guests.length,
        previousSchedule: 'Thursday, Sep 16, 2027 at 5:00 PM',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      showToast(`Schedule updated silently. Guests have not been informed yet.`, 'info');
      setShowNotifyModal(false);
      setEditingItem(null);
    }
  };

  // Direct trigger to notify guests (e.g. from warning screen or timeline badge)
  const handlePromptNotifyFromSidebar = (item: ScheduleItem) => {
    setEditingItem(item);
    setShowNotifyModal(true);
  };

  // Delete event
  const handleDeleteEvent = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Event removed from schedule.');
    setShowNotifyModal(false);
    setEditingItem(null);
  };

  // Bulk delete
  const handleDeleteMultiple = (ids: string[]) => {
    setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
    showToast(`Removed ${ids.length} events from schedule.`);
  };

  // Direct email dispatch handler for testing and individual recipient dispatch
  const handleSendDirectEmail = async (email: string, guestName: string = 'Guest') => {
    const activeEvent = editingItem || items[0];
    showToast(`Dispatching email to ${email}...`);
    try {
      const res = await sendScheduleEmail({
        to: email,
        event: activeEvent,
        guestName,
        personalNote: editingItem ? 'We adjusted our schedule timing!' : undefined,
      });
      if (res.success) {
        showToast(`Email delivered to ${email} via ${res.provider}!`);
      } else if (!res.configured) {
        showToast(`Generated draft for ${email}! Configure RESEND_API_KEY in Settings for auto-delivery.`);
        if (res.mailtoUrl) {
          window.open(res.mailtoUrl, '_blank');
        }
      } else {
        showToast(`Delivery notice: ${res.error || 'Check provider setup'}`);
      }
    } catch (e: any) {
      showToast(`Email error: ${e.message}`);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ECEAE5] antialiased select-none font-sans text-[#2D2D2D]">
      {/* Top Navigation Bar */}
      <TopNavbar
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        isPublished={isPublished}
        onTogglePublish={() => {
          setIsPublished(!isPublished);
          showToast(
            !isPublished 
              ? 'Wedding website published! Guests can now view your live schedule.' 
              : 'Website set to unpublished mode.'
          );
        }}
        onOpenSettings={() => setIsPageSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        onOpenGuestList={() => setIsGuestListOpen(true)}
        guestCount={guests.length}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        {isSidebarVisible && (
          <ScheduleSidebar
            items={items}
            selectedItemId={editingItem?.id || null}
            onSelectItem={handleSelectItem}
            onAddNew={handleAddNew}
            onDeleteMultiple={handleDeleteMultiple}
            onPromptNotify={handlePromptNotifyFromSidebar}
          />
        )}

        {/* Live Canvas Preview */}
        <CanvasPreview
          items={items}
          viewportMode={viewportMode}
          onEditItem={handleSelectItem}
          onOpenSupport={() => setIsSupportChatOpen(!isSupportChatOpen)}
        />
      </div>

      {/* Edit Schedule Item Modal */}
      {editingItem && (
        <EditScheduleModal
          event={editingItem}
          isOpen={true}
          onClose={() => {
            setEditingItem(null);
            setShowNotifyModal(false);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Secondary Foreground Notification Confirmation Dialog (ONLY when date or time was changed!) */}
      {showNotifyModal && editingItem && (
        <NotifyGuestsModal
          event={editingItem}
          guests={guests}
          onClose={() => setShowNotifyModal(false)}
          onConfirmSend={handleConfirmSendNotification}
          onSilentUpdate={handleSilentUpdate}
          onOpenGuestList={() => setIsGuestListOpen(true)}
          onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
          onSendTestEmail={(email, name) => handleSendDirectEmail(email, name)}
        />
      )}

      {/* Notification Status Screen (Sent / Silent Pending / Direct Save) */}
      {statusDetails && (
        <NotificationStatusModal
          details={statusDetails}
          isOpen={true}
          onClose={() => setStatusDetails(null)}
          onTriggerNotifyNow={() => {
            const targetEvent = statusDetails.event;
            setStatusDetails(null);
            setEditingItem(targetEvent);
            setShowNotifyModal(true);
          }}
          onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
          onSendCopyEmail={(copyEmail) => {
            showToast(`Sent email update copy to ${copyEmail}!`);
          }}
        />
      )}

      {/* Functional Guest Directory & Email Manager Modal */}
      <GuestListModal
        isOpen={isGuestListOpen}
        onClose={() => setIsGuestListOpen(false)}
        guests={guests}
        onAddGuest={handleAddGuest}
        onUpdateGuest={handleUpdateGuest}
        onDeleteGuest={handleDeleteGuest}
        onBulkAddGuests={handleBulkAddGuests}
        onSendDirectEmail={handleSendDirectEmail}
        activeEvent={editingItem || items[0]}
      />

      {/* Branded Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        event={editingItem || items[0]}
        guests={guests}
        personalNote={editingItem ? 'We moved our timing so we can watch the sunset together!' : undefined}
        onSendTestEmail={(email) => {
          showToast(`Test email template dispatched to ${email}!`);
        }}
      />

      {/* Support Chat Concierge Widget */}
      <SupportChatModal
        isOpen={isSupportChatOpen}
        onClose={() => setIsSupportChatOpen(false)}
      />

      {/* Page Settings Modal */}
      <PageSettingsModal
        isOpen={isPageSettingsOpen}
        onClose={() => setIsPageSettingsOpen(false)}
        onSave={(settings) => {
          showToast('Schedule page settings updated successfully.');
        }}
      />

      {/* Toast Notification Alert Banner */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#2D2D2D] text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center space-x-3 text-xs">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium pr-2">{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


