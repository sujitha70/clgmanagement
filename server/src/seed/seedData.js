const bcrypt = require('bcryptjs');
const { ROLES, STATUSES, PRIORITIES, DEPARTMENTS } = require('../config/constants');

const hashedPassword = bcrypt.hashSync('password123', 10);

const SEED_USERS = [
  {
    _id: 'usr_student_aarav',
    name: 'Aarav Sharma',
    email: 'student@campus.edu',
    password: hashedPassword,
    role: ROLES.STUDENT,
    rollNumber: 'CS-2023-014',
    department: 'Computer Science & Engineering',
    semester: '6th Sem',
    hostelBlock: 'Block-B (Kaveri Hostel)',
    roomNumber: 'Room 304',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date(Date.now() - 30 * 86400000)
  },
  {
    _id: 'usr_student_priya',
    name: 'Priya Patel',
    email: 'priya@campus.edu',
    password: hashedPassword,
    role: ROLES.STUDENT,
    rollNumber: 'EC-2023-088',
    department: 'Electronics & Communication',
    semester: '4th Sem',
    hostelBlock: 'Block-A (Ganga Girls Hostel)',
    roomNumber: 'Room 112',
    phone: '+91 98123 45678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date(Date.now() - 25 * 86400000)
  },
  {
    _id: 'usr_staff_hostel',
    name: 'Rajesh Gupta',
    email: 'staff.hostel@campus.edu',
    password: hashedPassword,
    role: ROLES.STAFF,
    department: 'Hostel & Residential',
    assignedDepartment: 'hostel',
    phone: '+91 94441 23456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isStaff: true,
    createdAt: new Date(Date.now() - 90 * 86400000)
  },
  {
    _id: 'usr_staff_wifi',
    name: 'Sneha Reddy',
    email: 'staff.wifi@campus.edu',
    password: hashedPassword,
    role: ROLES.STAFF,
    department: 'IT & Wi-Fi Network',
    assignedDepartment: 'wifi_it',
    phone: '+91 94442 34567',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    isStaff: true,
    createdAt: new Date(Date.now() - 90 * 86400000)
  },
  {
    _id: 'usr_staff_maintenance',
    name: 'V. Kumar',
    email: 'staff.maintenance@campus.edu',
    password: hashedPassword,
    role: ROLES.STAFF,
    department: 'Infrastructure & Maintenance',
    assignedDepartment: 'infrastructure',
    phone: '+91 94443 45678',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isStaff: true,
    createdAt: new Date(Date.now() - 90 * 86400000)
  },
  {
    _id: 'usr_admin_dean',
    name: 'Dr. Meenakshi Sundaram',
    email: 'admin@campus.edu',
    password: hashedPassword,
    role: ROLES.ADMIN,
    department: 'Dean of Student Affairs',
    phone: '+91 98880 11223',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date(Date.now() - 180 * 86400000)
  },
  {
    _id: 'usr_superadmin_principal',
    name: 'Prof. K. Narayanan (Principal)',
    email: 'principal@campus.edu',
    password: hashedPassword,
    role: ROLES.SUPER_ADMIN,
    department: 'Office of the Principal & Director',
    phone: '+91 98888 99999',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date(Date.now() - 365 * 86400000)
  }
];

const SEED_DEPARTMENTS = DEPARTMENTS.map(dept => ({
  ...dept,
  _id: dept.id,
  headName: dept.id === 'hostel' ? 'Rajesh Gupta' : (dept.id === 'wifi_it' ? 'Sneha Reddy' : 'Dr. M. Sundaram'),
  headEmail: dept.id === 'hostel' ? 'staff.hostel@campus.edu' : (dept.id === 'wifi_it' ? 'staff.wifi@campus.edu' : 'admin@campus.edu'),
  slaHoursMultiplier: 1.0,
  activeTicketsCount: 4,
  resolvedTicketsCount: 18
}));

const SEED_COMPLAINTS = [
  {
    _id: 'cmp_1001',
    ticketId: 'CMP-2026-1001',
    title: 'High-speed Wi-Fi router intermittent outage in Kaveri Hostel 3rd Floor',
    description: 'The Wi-Fi access point in Kaveri Hostel 3rd Floor corridors drops connection every 5 minutes since yesterday evening. Students are unable to access LMS and online research portals for mid-term submissions.',
    department: 'wifi_it',
    location: 'Kaveri Hostel, 3rd Floor Corridor (near Room 304)',
    priority: PRIORITIES.HIGH,
    status: STATUSES.IN_PROGRESS,
    studentId: 'usr_student_aarav',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@campus.edu',
    studentRollNumber: 'CS-2023-014',
    studentPhone: '+91 98765 43210',
    isAnonymous: false,
    assignedStaffId: 'usr_staff_wifi',
    assignedStaffName: 'Sneha Reddy (IT Staff)',
    attachments: [
      {
        url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
        filename: 'wifi_error_log.png',
        fileType: 'image/png',
        size: 145020
      }
    ],
    timeline: [
      {
        status: STATUSES.SUBMITTED,
        updatedBy: 'Aarav Sharma',
        role: 'student',
        timestamp: new Date(Date.now() - 18 * 3600000),
        note: 'Complaint registered by student.'
      },
      {
        status: STATUSES.UNDER_REVIEW,
        updatedBy: 'Dr. Meenakshi Sundaram',
        role: 'admin',
        timestamp: new Date(Date.now() - 14 * 3600000),
        note: 'Reviewed by Dean of Student Affairs. Priority set to High due to exam week.'
      },
      {
        status: STATUSES.ASSIGNED,
        updatedBy: 'Dr. Meenakshi Sundaram',
        role: 'admin',
        timestamp: new Date(Date.now() - 10 * 3600000),
        note: 'Assigned to Network Engineer Sneha Reddy.'
      },
      {
        status: STATUSES.IN_PROGRESS,
        updatedBy: 'Sneha Reddy',
        role: 'staff',
        timestamp: new Date(Date.now() - 4 * 3600000),
        note: 'Replaced PoE injector; testing gateway ping stability across rooms 301-315.'
      }
    ],
    comments: [
      {
        authorId: 'usr_student_aarav',
        authorName: 'Aarav Sharma',
        authorRole: 'student',
        text: 'The signal is showing full bars but DHCP is failing to assign IP addresses.',
        isInternal: false,
        createdAt: new Date(Date.now() - 17 * 3600000)
      },
      {
        authorId: 'usr_staff_wifi',
        authorName: 'Sneha Reddy',
        authorRole: 'staff',
        text: 'Our network team is updating the firmware on AP-B3-04 right now.',
        isInternal: false,
        createdAt: new Date(Date.now() - 3 * 3600000)
      },
      {
        authorId: 'usr_admin_dean',
        authorName: 'Dr. Meenakshi Sundaram',
        authorRole: 'admin',
        text: 'Internal Note: Please ensure all 3rd-floor APs are inspected before 5 PM.',
        isInternal: true,
        createdAt: new Date(Date.now() - 2 * 3600000)
      }
    ],
    aiAnalysis: {
      suggestedCategory: 'wifi_it',
      suggestedPriority: PRIORITIES.HIGH,
      urgencyScore: 82,
      sentiment: 'Frustrated / Urgent',
      summary: 'Wi-Fi AP disconnections in Kaveri Hostel 3rd floor impacting student study before exams.',
      isPotentialDuplicate: false
    },
    slaDeadline: new Date(Date.now() + 6 * 3600000),
    isEscalated: false,
    createdAt: new Date(Date.now() - 18 * 3600000),
    updatedAt: new Date(Date.now() - 2 * 3600000)
  },
  {
    _id: 'cmp_1002',
    ticketId: 'CMP-2026-1002',
    title: 'Ceiling fan regulator sparking and defective in Ganga Hostel Room 112',
    description: 'The ceiling fan speed regulator makes a buzzing sparking noise and sparks fly whenever switched between speed 2 and 3. Risk of electrical hazard.',
    department: 'hostel',
    location: 'Ganga Girls Hostel, Room 112',
    priority: PRIORITIES.CRITICAL,
    status: STATUSES.ASSIGNED,
    studentId: 'usr_student_priya',
    studentName: 'Priya Patel',
    studentEmail: 'priya@campus.edu',
    studentRollNumber: 'EC-2023-088',
    studentPhone: '+91 98123 45678',
    isAnonymous: false,
    assignedStaffId: 'usr_staff_maintenance',
    assignedStaffName: 'V. Kumar (Maintenance)',
    attachments: [],
    timeline: [
      {
        status: STATUSES.SUBMITTED,
        updatedBy: 'Priya Patel',
        role: 'student',
        timestamp: new Date(Date.now() - 6 * 3600000),
        note: 'Urgent electrical hazard reported.'
      },
      {
        status: STATUSES.UNDER_REVIEW,
        updatedBy: 'Dr. Meenakshi Sundaram',
        role: 'admin',
        timestamp: new Date(Date.now() - 5 * 3600000),
        note: 'Classified as Critical Safety Hazard.'
      },
      {
        status: STATUSES.ASSIGNED,
        updatedBy: 'Rajesh Gupta',
        role: 'staff',
        timestamp: new Date(Date.now() - 3 * 3600000),
        note: 'Assigned to Campus Electrician Team.'
      }
    ],
    comments: [
      {
        authorId: 'usr_staff_maintenance',
        authorName: 'V. Kumar',
        authorRole: 'staff',
        text: 'Electrician has been dispatched with replacement modular regulator switch.',
        isInternal: false,
        createdAt: new Date(Date.now() - 1 * 3600000)
      }
    ],
    aiAnalysis: {
      suggestedCategory: 'hostel',
      suggestedPriority: PRIORITIES.CRITICAL,
      urgencyScore: 95,
      sentiment: 'High Anxiety / Safety Risk',
      summary: 'Electrical sparking in fan regulator at Ganga Hostel Room 112 posing safety hazard.',
      isPotentialDuplicate: false
    },
    slaDeadline: new Date(Date.now() + 6 * 3600000),
    isEscalated: false,
    createdAt: new Date(Date.now() - 6 * 3600000),
    updatedAt: new Date(Date.now() - 1 * 3600000)
  },
  {
    _id: 'cmp_1003',
    ticketId: 'CMP-2026-1003',
    title: 'Water filter RO dispenser tap broken in North Mess Dining Hall',
    description: 'Drinking water dispenser unit #2 in North Mess has a cracked lever tap causing clean water wastage and floor slipping hazard.',
    department: 'mess',
    location: 'North Mess, Ground Floor Dining Area',
    priority: PRIORITIES.MEDIUM,
    status: STATUSES.RESOLVED,
    studentId: 'usr_student_aarav',
    studentName: 'Anonymous Student',
    isAnonymous: true,
    assignedStaffId: 'usr_staff_maintenance',
    assignedStaffName: 'V. Kumar',
    attachments: [],
    timeline: [
      {
        status: STATUSES.SUBMITTED,
        updatedBy: 'Anonymous',
        role: 'student',
        timestamp: new Date(Date.now() - 48 * 3600000),
        note: 'Submitted anonymously.'
      },
      {
        status: STATUSES.UNDER_REVIEW,
        updatedBy: 'Dr. Meenakshi Sundaram',
        role: 'admin',
        timestamp: new Date(Date.now() - 42 * 3600000),
        note: 'Forwarded to Estate maintenance.'
      },
      {
        status: STATUSES.ASSIGNED,
        updatedBy: 'Dr. Meenakshi Sundaram',
        role: 'admin',
        timestamp: new Date(Date.now() - 36 * 3600000),
        note: 'Assigned to plumbing team.'
      },
      {
        status: STATUSES.IN_PROGRESS,
        updatedBy: 'V. Kumar',
        role: 'staff',
        timestamp: new Date(Date.now() - 24 * 3600000),
        note: 'Replaced brass faucet and valve.'
      },
      {
        status: STATUSES.RESOLVED,
        updatedBy: 'V. Kumar',
        role: 'staff',
        timestamp: new Date(Date.now() - 8 * 3600000),
        note: 'New food-grade stainless steel dispenser valve installed and leak tested.'
      }
    ],
    comments: [],
    resolutionDetails: {
      resolvedAt: new Date(Date.now() - 8 * 3600000),
      resolvedBy: 'V. Kumar',
      resolvedById: 'usr_staff_maintenance',
      resolutionNotes: 'Installed heavy-duty SS304 tap valve and cleaned surrounding drainage channel.'
    },
    feedback: {
      rating: 5,
      comment: 'Super fast fix! Dispenser works flawlessly now. Thank you maintenance team!',
      submittedAt: new Date(Date.now() - 2 * 3600000)
    },
    aiAnalysis: {
      suggestedCategory: 'mess',
      suggestedPriority: PRIORITIES.MEDIUM,
      urgencyScore: 55,
      sentiment: 'Concerned',
      summary: 'Broken water dispenser faucet in North Mess creating water waste and wet floor.',
      isPotentialDuplicate: false
    },
    slaDeadline: new Date(Date.now() - 12 * 3600000),
    isEscalated: false,
    createdAt: new Date(Date.now() - 48 * 3600000),
    updatedAt: new Date(Date.now() - 2 * 3600000)
  },
  {
    _id: 'cmp_1004',
    ticketId: 'CMP-2026-1004',
    title: 'Duplicate examination fee deducted during online semester registration',
    description: 'Payment gateway timed out during 6th semester fee payment, and the bank transaction was debited twice (Transaction IDs: TXN89211 and TXN89212 for ₹4,500 each).',
    department: 'accounts',
    location: 'Online Payment Portal / Finance Section',
    priority: PRIORITIES.HIGH,
    status: STATUSES.CLOSED,
    studentId: 'usr_student_aarav',
    studentName: 'Aarav Sharma',
    studentEmail: 'student@campus.edu',
    studentRollNumber: 'CS-2023-014',
    studentPhone: '+91 98765 43210',
    isAnonymous: false,
    assignedStaffId: 'usr_admin_dean',
    assignedStaffName: 'Accounts Admin',
    attachments: [],
    timeline: [
      {
        status: STATUSES.SUBMITTED,
        updatedBy: 'Aarav Sharma',
        role: 'student',
        timestamp: new Date(Date.now() - 96 * 3600000),
        note: 'Submitted payment dispute.'
      },
      {
        status: STATUSES.UNDER_REVIEW,
        updatedBy: 'Dr. Meenakshi Sundaram',
        role: 'admin',
        timestamp: new Date(Date.now() - 90 * 3600000),
        note: 'Sent to Bank Reconciliation Desk.'
      },
      {
        status: STATUSES.IN_PROGRESS,
        updatedBy: 'Accounts Admin',
        role: 'staff',
        timestamp: new Date(Date.now() - 72 * 3600000),
        note: 'Bank PG verified double charge; reverse credit initiated.'
      },
      {
        status: STATUSES.RESOLVED,
        updatedBy: 'Accounts Admin',
        role: 'staff',
        timestamp: new Date(Date.now() - 48 * 3600000),
        note: 'Refund of ₹4,500 credited back to student source bank account (Ref: RRN772910).'
      },
      {
        status: STATUSES.CLOSED,
        updatedBy: 'Aarav Sharma',
        role: 'student',
        timestamp: new Date(Date.now() - 24 * 3600000),
        note: 'Student verified credit and closed ticket.'
      }
    ],
    comments: [],
    resolutionDetails: {
      resolvedAt: new Date(Date.now() - 48 * 3600000),
      resolvedBy: 'Accounts Admin',
      resolvedById: 'usr_admin_dean',
      resolutionNotes: 'Refund of ₹4,500 processed successfully via payment gateway portal.',
      closedAt: new Date(Date.now() - 24 * 3600000)
    },
    feedback: {
      rating: 5,
      comment: 'Very professional handling! Refund received within 48 hours.',
      submittedAt: new Date(Date.now() - 24 * 3600000)
    },
    aiAnalysis: {
      suggestedCategory: 'accounts',
      suggestedPriority: PRIORITIES.HIGH,
      urgencyScore: 78,
      sentiment: 'Concerned about money',
      summary: 'Double fee deduction of ₹4500 during online semester fee payment.',
      isPotentialDuplicate: false
    },
    slaDeadline: new Date(Date.now() - 72 * 3600000),
    isEscalated: false,
    createdAt: new Date(Date.now() - 96 * 3600000),
    updatedAt: new Date(Date.now() - 24 * 3600000)
  },
  {
    _id: 'cmp_1005',
    ticketId: 'CMP-2026-1005',
    title: 'Reference books missing & outdated editions in Central Library AI section',
    description: 'The syllabus for Artificial Intelligence and Deep Learning lists 2024 editions, but the library only has 2 copies of the 2017 edition which are constantly checked out.',
    department: 'library',
    location: 'Central Library, 2nd Floor Computing Section',
    priority: PRIORITIES.LOW,
    status: STATUSES.SUBMITTED,
    studentId: 'usr_student_priya',
    studentName: 'Priya Patel',
    studentEmail: 'priya@campus.edu',
    studentRollNumber: 'EC-2023-088',
    studentPhone: '+91 98123 45678',
    isAnonymous: false,
    attachments: [],
    timeline: [
      {
        status: STATUSES.SUBMITTED,
        updatedBy: 'Priya Patel',
        role: 'student',
        timestamp: new Date(Date.now() - 2 * 3600000),
        note: 'New book requisition complaint submitted.'
      }
    ],
    comments: [],
    aiAnalysis: {
      suggestedCategory: 'library',
      suggestedPriority: PRIORITIES.LOW,
      urgencyScore: 35,
      sentiment: 'Neutral / Informative',
      summary: 'Request for updated 2024 editions of AI & Deep Learning reference books in Central Library.',
      isPotentialDuplicate: false
    },
    slaDeadline: new Date(Date.now() + 118 * 3600000),
    isEscalated: false,
    createdAt: new Date(Date.now() - 2 * 3600000),
    updatedAt: new Date(Date.now() - 2 * 3600000)
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'notif_1',
    recipientId: 'usr_student_aarav',
    recipientRole: ROLES.STUDENT,
    title: 'Ticket In Progress 🛠️',
    message: 'Your complaint CMP-2026-1001 (Wi-Fi router outage) has been updated to In Progress by Sneha Reddy.',
    ticketId: 'CMP-2026-1001',
    type: 'STATUS_CHANGE',
    read: false,
    createdAt: new Date(Date.now() - 4 * 3600000)
  },
  {
    id: 'notif_2',
    recipientId: 'admin',
    recipientRole: ROLES.ADMIN,
    title: 'Critical Complaint Lodged ⚠️',
    message: 'Critical safety issue reported in Ganga Girls Hostel Room 112 (CMP-2026-1002). Immediate action required.',
    ticketId: 'CMP-2026-1002',
    type: 'ALERT',
    read: false,
    createdAt: new Date(Date.now() - 6 * 3600000)
  },
  {
    id: 'notif_3',
    recipientId: 'usr_student_priya',
    recipientRole: ROLES.STUDENT,
    title: 'Electrician Assigned ⚡',
    message: 'Your complaint CMP-2026-1002 has been assigned to V. Kumar (Maintenance).',
    ticketId: 'CMP-2026-1002',
    type: 'ASSIGNMENT',
    read: true,
    createdAt: new Date(Date.now() - 3 * 3600000)
  }
];

module.exports = {
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_COMPLAINTS,
  SEED_NOTIFICATIONS
};
