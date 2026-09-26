// Keys must match backend/models/Ticket.js
export const TICKET_STATUSES = {
  reserved: 'محجوزة — بانتظار الدفع',
  confirmed: 'مؤكدة',
  used: 'مستخدمة',
  cancelled: 'ملغاة',
}

// Short labels for tables and badges
export const TICKET_STATUSES_SHORT = {
  reserved: 'بانتظار الدفع',
  confirmed: 'مؤكدة',
  used: 'مستخدمة',
  cancelled: 'ملغاة',
}

export const MAX_TICKETS_PER_RESERVATION = 10
