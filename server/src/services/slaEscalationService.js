const inMemoryStore = require('../store/inMemoryStore');
const { SLA_HOURS, PRIORITIES, STATUSES } = require('../config/constants');

class SLAEscalationService {
  constructor() {
    this.timer = null;
  }

  /**
   * Calculate SLA deadline timestamp based on creation date and priority
   */
  calculateDeadline(createdAt = new Date(), priority = PRIORITIES.MEDIUM) {
    const hours = SLA_HOURS[priority] || 72;
    return new Date(new Date(createdAt).getTime() + hours * 3600000);
  }

  /**
   * Scan active complaints and flag SLA breaches / escalations
   */
  async checkAndEscalateComplaints(io = null) {
    const complaints = await inMemoryStore.getAllComplaints();
    const now = new Date();

    let escalatedCount = 0;

    for (const cmp of complaints) {
      // Only escalate unresolved/unclosed tickets
      if (cmp.status === STATUSES.RESOLVED || cmp.status === STATUSES.CLOSED) {
        continue;
      }

      const deadline = cmp.slaDeadline ? new Date(cmp.slaDeadline) : this.calculateDeadline(cmp.createdAt, cmp.priority);

      // Check if overdue and not already escalated
      if (now > deadline && !cmp.isEscalated) {
        cmp.isEscalated = true;
        cmp.escalatedAt = now;
        cmp.escalationReason = `SLA Breached: Overdue by ${Math.round((now - deadline) / 3600000)} hours without resolution.`;

        // Add timeline entry
        cmp.timeline.push({
          status: cmp.status,
          updatedBy: 'Automated SLA Monitor',
          role: 'system',
          timestamp: now,
          note: `🚨 Escalated automatically to Principal & Dean due to SLA breach.`
        });

        // Create admin notification
        const notif = await inMemoryStore.createNotification({
          recipientId: 'admin',
          recipientRole: 'admin',
          title: `🚨 Escalation Alert: ${cmp.ticketId}`,
          message: `Ticket ${cmp.ticketId} (${cmp.title}) has breached its ${cmp.priority} SLA deadline.`,
          ticketId: cmp.ticketId,
          type: 'ESCALATION'
        });

        if (io) {
          io.emit('escalation_alert', {
            ticketId: cmp.ticketId,
            title: cmp.title,
            priority: cmp.priority,
            department: cmp.department,
            notification: notif
          });
        }

        escalatedCount++;
      }
    }

    if (escalatedCount > 0) {
      console.log(`⏱️ SLA Escalation Check: ${escalatedCount} ticket(s) escalated to Administration.`);
    }

    return escalatedCount;
  }

  startPeriodicChecker(io, intervalMs = 60000) {
    // Run initial check
    this.checkAndEscalateComplaints(io).catch(err => console.error('SLA Initial Check Error:', err));
    // Interval check
    this.timer = setInterval(() => {
      this.checkAndEscalateComplaints(io).catch(err => console.error('SLA Checker Error:', err));
    }, intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

module.exports = new SLAEscalationService();
