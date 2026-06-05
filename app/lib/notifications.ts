export interface AppNotification {
  id: string;
  title: string;
  content: string;
  target: 'all' | 'citizens' | 'officials';
  sender: string;
  senderRole: 'mayor' | 'official';
  date: string; // ISO datetime
  status: 'approved' | 'pending' | 'denied';
  requestedBy?: string; // Official's email
  requestedAt?: string; // ISO datetime
  approvedAt?: string;
  approvedBy?: string;
}
