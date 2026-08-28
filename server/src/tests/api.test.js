const assert = require('assert');
const inMemoryStore = require('../store/inMemoryStore');
const aiTriageService = require('../services/aiTriageService');
const slaEscalationService = require('../services/slaEscalationService');
const { STATUSES, PRIORITIES } = require('../config/constants');

async function runTests() {
  console.log('🧪 Starting CampusResolve Automated Backend Validation...\n');

  // Test 1: User Store & Authentication Data
  console.log('1. Testing User Store...');
  const student = await inMemoryStore.findUserByEmail('student@campus.edu');
  assert.ok(student, 'Student account should exist in seed data');
  assert.strictEqual(student.role, 'student');
  console.log('   ✅ Student account verified: Aarav Sharma');

  const admin = await inMemoryStore.findUserByEmail('admin@campus.edu');
  assert.ok(admin, 'Admin account should exist');
  assert.strictEqual(admin.role, 'admin');
  console.log('   ✅ Admin account verified: Dr. Meenakshi Sundaram');

  // Test 2: AI Triage Service
  console.log('\n2. Testing AI Triage & Categorization...');
  const triageWifi = await aiTriageService.analyzeComplaint(
    'Internet speed very slow',
    'WiFi router disconnected in hostel room',
    'Hostel Block B'
  );
  assert.strictEqual(triageWifi.suggestedCategory, 'wifi_it', 'Should detect WiFi department');
  console.log(`   ✅ Wi-Fi Category Detected: ${triageWifi.suggestedCategory}`);

  const triageCritical = await aiTriageService.analyzeComplaint(
    'Electric Sparking Hazard',
    'Switchboard sparking and smelling like burning plastic in lab',
    'CS Lab 1'
  );
  assert.strictEqual(triageCritical.suggestedPriority, PRIORITIES.CRITICAL, 'Should detect Critical priority');
  console.log(`   ✅ Critical Priority Detected: ${triageCritical.suggestedPriority} (Urgency: ${triageCritical.urgencyScore})`);

  // Test 3: Duplicate Complaint Detection
  console.log('\n3. Testing Duplicate Complaint Detection...');
  const duplicateCheck = await aiTriageService.checkPotentialDuplicates(
    'Wi-Fi router outage in Kaveri Hostel',
    'Internet drops every 5 minutes in Kaveri hostel 3rd floor corridor',
    'wifi_it'
  );
  assert.ok(duplicateCheck.isDuplicate, 'Should detect duplicate complaint');
  console.log(`   ✅ Duplicate Detected: Matched ${duplicateCheck.matchedTicketId} (Similarity: ${duplicateCheck.similarityScore}%)`);

  // Test 4: Complaint Creation & Lifecycle Flow
  console.log('\n4. Testing Complaint Creation & Lifecycle...');
  const newCmp = await inMemoryStore.createComplaint({
    ticketId: 'CMP-2026-TEST',
    title: 'Test Tap Leakage',
    description: 'Tap leaking in first floor washroom',
    department: 'sanitation',
    priority: PRIORITIES.LOW,
    status: STATUSES.SUBMITTED,
    studentId: student._id,
    studentName: student.name,
    timeline: [{
      status: STATUSES.SUBMITTED,
      updatedBy: student.name,
      role: 'student',
      timestamp: new Date(),
      note: 'Initial lodge'
    }]
  });

  assert.ok(newCmp._id, 'Complaint should have an ID');
  assert.strictEqual(newCmp.status, STATUSES.SUBMITTED);
  console.log(`   ✅ Complaint Created: ${newCmp.ticketId}`);

  // Advance to IN_PROGRESS
  const inProgressCmp = await inMemoryStore.updateComplaint(newCmp._id, {
    status: STATUSES.IN_PROGRESS,
    assignedStaffName: 'Plumber Raman'
  });
  assert.strictEqual(inProgressCmp.status, STATUSES.IN_PROGRESS);
  console.log('   ✅ Status updated to: In Progress');

  // Resolve with resolution details
  const resolvedCmp = await inMemoryStore.updateComplaint(newCmp._id, {
    status: STATUSES.RESOLVED,
    resolutionDetails: {
      resolvedAt: new Date(),
      resolvedBy: 'Plumber Raman',
      resolutionNotes: 'Replaced rubber washer and seal.'
    }
  });
  assert.strictEqual(resolvedCmp.status, STATUSES.RESOLVED);
  console.log('   ✅ Status updated to: Resolved');

  // Rate resolution and close
  const closedCmp = await inMemoryStore.updateComplaint(newCmp._id, {
    status: STATUSES.CLOSED,
    feedback: {
      rating: 5,
      comment: 'Fixed rapidly, thank you!',
      submittedAt: new Date()
    }
  });
  assert.strictEqual(closedCmp.status, STATUSES.CLOSED);
  assert.strictEqual(closedCmp.feedback.rating, 5);
  console.log('   ✅ Feedback rated 5/5 stars and ticket closed');

  // Test 5: SLA Escalation Checker
  console.log('\n5. Testing SLA Escalation Engine...');
  const escalated = await slaEscalationService.checkAndEscalateComplaints();
  console.log(`   ✅ SLA Engine processed successfully. Active escalations: ${escalated}`);

  console.log('\n🎉 ALL BACKEND UNIT AND INTEGRATION TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
