const STATUSES = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

const STATUS_FLOW = [
  STATUSES.SUBMITTED,
  STATUSES.UNDER_REVIEW,
  STATUSES.ASSIGNED,
  STATUSES.IN_PROGRESS,
  STATUSES.RESOLVED,
  STATUSES.CLOSED
];

const PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

const SLA_HOURS = {
  [PRIORITIES.CRITICAL]: 12,  // 12 hours SLA
  [PRIORITIES.HIGH]: 24,      // 24 hours SLA
  [PRIORITIES.MEDIUM]: 72,    // 3 days SLA
  [PRIORITIES.LOW]: 120       // 5 days SLA
};

const ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin'
};

const DEPARTMENTS = [
  { id: 'hostel', name: 'Hostel & Residential', code: 'HST', icon: 'Home' },
  { id: 'academics', name: 'Academics & Faculty', code: 'ACD', icon: 'BookOpen' },
  { id: 'wifi_it', name: 'IT & Wi-Fi Network', code: 'NET', icon: 'Wifi' },
  { id: 'infrastructure', name: 'Infrastructure & Maintenance', code: 'INF', icon: 'Wrench' },
  { id: 'mess', name: 'Mess & Food Quality', code: 'MES', icon: 'Utensils' },
  { id: 'library', name: 'Library Services', code: 'LIB', icon: 'Library' },
  { id: 'accounts', name: 'Accounts & Fee Section', code: 'ACC', icon: 'CreditCard' },
  { id: 'transport', name: 'Campus Transportation', code: 'TRN', icon: 'Bus' },
  { id: 'sanitation', name: 'Sanitation & Cleanliness', code: 'SAN', icon: 'Sparkles' },
  { id: 'sports', name: 'Sports & Amenities', code: 'SPT', icon: 'Trophy' }
];

module.exports = {
  STATUSES,
  STATUS_FLOW,
  PRIORITIES,
  SLA_HOURS,
  ROLES,
  DEPARTMENTS
};
