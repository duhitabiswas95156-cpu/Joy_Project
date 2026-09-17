export type TimingMode = 'start_only' | 'start_end' | 'tba';
export type AttendanceFormat = 'in_person' | 'virtual' | 'both';
export type ViewportMode = 'desktop' | 'tablet' | 'mobile';
export type RecipientType = 'all' | 'attending' | 'bridal_party' | 'custom';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  group: 'all' | 'attending' | 'bridal_party';
  rsvpStatus: 'attending' | 'declined' | 'pending';
  partyTag?: string; // e.g. "Maid of Honor", "Best Man", "Family", "Friend"
  plusOnes?: number;
  dietary?: string;
  lastNotifiedAt?: string;
  lastEmailStatus?: 'delivered' | 'opened' | 'pending';
}

export interface SentEmailRecord {
  id: string;
  guestId?: string;
  guestName: string;
  guestEmail: string;
  eventId: string;
  eventName: string;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'opened';
  personalNote?: string;
  newSchedule: string;
  venue?: string;
}

export interface ScheduleItem {
  id: string;
  name: string;
  description: string;
  timingMode: TimingMode;
  date: string; // Display date or ISO e.g. "2027-09-16"
  formattedDate: string; // "Thursday, September 16, 2027" or "Date To Be Announced"
  startTime: string; // "04:00 PM"
  endTime?: string;
  timezone: string;
  format: AttendanceFormat;
  venue: string;
  audience: string; // "All Guests"
  isDateTBA: boolean;
  order: number;
  hasPendingNotification?: boolean;
  lastNotifiedAt?: string;
}

export interface NotificationStatusDetails {
  type: 'sent' | 'silent_pending' | 'direct_saved';
  event: ScheduleItem;
  recipientsCount?: number;
  recipientGroup?: RecipientType;
  channels?: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  timestamp: string;
  note?: string;
  previousSchedule?: string;
  sentEmails?: SentEmailRecord[];
}

export interface NotificationSettings {
  recipients: RecipientType;
  channels: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  note: string;
}

