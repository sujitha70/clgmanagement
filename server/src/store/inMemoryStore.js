const { v4: uuidv4 } = require('uuid');
const { SEED_USERS, SEED_DEPARTMENTS, SEED_COMPLAINTS, SEED_NOTIFICATIONS } = require('../seed/seedData');

class InMemoryStore {
  constructor() {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.departments = JSON.parse(JSON.stringify(SEED_DEPARTMENTS));
    this.complaints = JSON.parse(JSON.stringify(SEED_COMPLAINTS));
    this.notifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS));
  }

  // --- USER METHODS ---
  async findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    return this.users.find(u => u._id === id || u.id === id) || null;
  }

  async createUser(userData) {
    const newUser = {
      _id: `usr_${uuidv4().substring(0, 8)}`,
      createdAt: new Date(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  async getAllStaff(departmentId = null) {
    let list = this.users.filter(u => u.role === 'staff' || u.isStaff);
    if (departmentId) {
      list = list.filter(u => u.assignedDepartment === departmentId);
    }
    return list;
  }

  // --- COMPLAINTS METHODS ---
  async getAllComplaints(filters = {}) {
    let result = [...this.complaints];

    if (filters.studentId) {
      result = result.filter(c => c.studentId === filters.studentId);
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters.department && filters.department !== 'all') {
      result = result.filter(c => c.department === filters.department);
    }
    if (filters.priority && filters.priority !== 'all') {
      result = result.filter(c => c.priority === filters.priority);
    }
    if (filters.assignedStaffId) {
      result = result.filter(c => c.assignedStaffId === filters.assignedStaffId);
    }
    if (filters.isEscalated !== undefined) {
      result = result.filter(c => c.isEscalated === (filters.isEscalated === 'true' || filters.isEscalated === true));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c =>
        c.ticketId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.studentName && c.studentName.toLowerCase().includes(q))
      );
    }

    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }

  async findComplaintById(id) {
    return this.complaints.find(c => c._id === id || c.ticketId === id) || null;
  }

  async createComplaint(complaintData) {
    const newComplaint = {
      _id: `cmp_${Date.now().toString().slice(-6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Submitted',
      timeline: [],
      comments: [],
      ...complaintData
    };
    this.complaints.unshift(newComplaint);
    return newComplaint;
  }

  async updateComplaint(id, updates) {
    const index = this.complaints.findIndex(c => c._id === id || c.ticketId === id);
    if (index === -1) return null;
    this.complaints[index] = {
      ...this.complaints[index],
      ...updates,
      updatedAt: new Date()
    };
    return this.complaints[index];
  }

  // --- DEPARTMENTS METHODS ---
  async getAllDepartments() {
    return this.departments;
  }

  async findDepartmentById(id) {
    return this.departments.find(d => d.id === id || d._id === id) || null;
  }

  // --- NOTIFICATIONS METHODS ---
  async getNotificationsForUser(userId, role) {
    return this.notifications
      .filter(n => n.recipientId === userId || n.recipientId === role || n.recipientRole === role || n.recipientId === 'admin')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async createNotification(notifData) {
    const newNotif = {
      id: `notif_${Date.now()}`,
      createdAt: new Date(),
      read: false,
      ...notifData
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  async markNotificationRead(notifId) {
    const notif = this.notifications.find(n => n.id === notifId);
    if (notif) notif.read = true;
    return notif;
  }

  async markAllNotificationsRead(userId, role) {
    this.notifications.forEach(n => {
      if (n.recipientId === userId || n.recipientRole === role) {
        n.read = true;
      }
    });
    return true;
  }
}

const inMemoryStore = new InMemoryStore();

module.exports = inMemoryStore;
