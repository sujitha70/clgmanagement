const inMemoryStore = require('../store/inMemoryStore');
const { PRIORITIES } = require('../config/constants');

const DEPARTMENT_KEYWORDS = {
  wifi_it: ['wifi', 'wi-fi', 'internet', 'network', 'router', 'ethernet', 'lan', 'lms', 'portal', 'server', 'slow net', 'dns', 'ip', 'login portal', 'erp', 'disconnect'],
  hostel: ['hostel', 'room', 'bed', 'warden', 'geyser', 'fan', 'light', 'corridor', 'dorm', 'washroom', 'cupboard', 'window', 'water heater', 'block a', 'block b', 'curfew', 'roommate'],
  mess: ['mess', 'food', 'canteen', 'dining', 'taste', 'hygiene', 'insect', 'breakfast', 'lunch', 'dinner', 'roti', 'rice', 'meal', 'drinking water', 'water filter', 'ro tap', 'stale'],
  academics: ['faculty', 'professor', 'teacher', 'attendance', 'syllabus', 'internal marks', 'lab', 'class', 'lecture', 'assignment', 'timetable', 'exam', 'credits', 'hod', 'dean'],
  infrastructure: ['lift', 'elevator', 'water leak', 'tap', 'ac', 'air conditioner', 'projector', 'whiteboard', 'door', 'switchboard', 'bench', 'broken', 'desk', 'crack', 'generator', 'power cut'],
  library: ['book', 'library', 'reference', 'journal', 'digital library', 'fine', 'return date', 'librarian', 'reading hall', 'silence', 'edition'],
  accounts: ['fee', 'payment', 'refund', 'challan', 'transaction', 'scholarship', 'receipt', 'accounts', 'fine', 'finance', 'gateway', 'deducted', 'double charge'],
  transport: ['bus', 'route', 'driver', 'pickup', 'shuttle', 'van', 'transit', 'pass', 'timing'],
  sanitation: ['garbage', 'dustbin', 'cleanliness', 'cleaning', 'sweep', 'washroom dirty', 'smell', 'mosquito', 'sanitizer', 'drainage'],
  sports: ['ground', 'badminton', 'cricket', 'gym', 'court', 'football', 'basketball', 'equipment', 'table tennis']
};

const CRITICAL_KEYWORDS = ['spark', 'fire', 'electric shock', 'hazard', 'bleeding', 'violence', 'harassment', 'ragging', 'emergency', 'short circuit', 'collapsed', 'danger', 'gas leak'];
const HIGH_KEYWORDS = ['exam', 'submission', 'test', 'deadline', 'urgent', 'broken tap', 'flooding', 'no water', 'no power', 'intermittent', 'failed payment', 'duplicate charge', 'stolen', 'threat'];
const LOW_KEYWORDS = ['request', 'suggestion', 'inquiry', 'update syllabus', 'extra chair', 'minor', 'color', 'recommendation', 'edition'];

/**
 * Calculate Jaccard similarity between two token sets
 */
function calculateTextSimilarity(textA, textB) {
  if (!textA || !textB) return 0;
  const stopWords = new Set(['the', 'and', 'with', 'for', 'this', 'that', 'from', 'have', 'has', 'since', 'every', 'been', 'near', 'area']);
  
  const tokenize = (text) => {
    return new Set(
      text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w))
    );
  };

  const setA = tokenize(textA);
  const setB = tokenize(textB);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const minSetSize = Math.min(setA.size, setB.size);
  const overlapRatio = intersection / minSetSize;
  const union = new Set([...setA, ...setB]).size;
  const jaccard = intersection / union;

  return Math.max(jaccard, overlapRatio * 0.6);
}

class AITriageService {
  /**
   * Analyze complaint description to suggest department, priority, urgency, and generate summary
   */
  async analyzeComplaint(title = '', description = '', location = '') {
    const combinedText = `${title} ${description} ${location}`.toLowerCase();

    // 1. Department Detection
    let detectedDept = 'infrastructure';
    let maxDeptScore = 0;

    for (const [dept, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
      let score = 0;
      for (const kw of keywords) {
        if (combinedText.includes(kw)) {
          score += kw.length > 5 ? 2 : 1;
        }
      }
      if (score > maxDeptScore) {
        maxDeptScore = score;
        detectedDept = dept;
      }
    }

    // 2. Priority & Urgency Assessment
    let priority = PRIORITIES.MEDIUM;
    let urgencyScore = 50;
    let sentiment = 'Concerned / Neutral';

    const hasCritical = CRITICAL_KEYWORDS.some(k => combinedText.includes(k));
    const hasHigh = HIGH_KEYWORDS.some(k => combinedText.includes(k));
    const hasLow = LOW_KEYWORDS.some(k => combinedText.includes(k));

    if (hasCritical) {
      priority = PRIORITIES.CRITICAL;
      urgencyScore = 95;
      sentiment = 'Critical Safety / Immediate Hazard';
    } else if (hasHigh) {
      priority = PRIORITIES.HIGH;
      urgencyScore = 80;
      sentiment = 'Urgent / High Friction';
    } else if (hasLow) {
      priority = PRIORITIES.LOW;
      urgencyScore = 30;
      sentiment = 'Informational / Low Urgency';
    }

    // 3. LLM Auto Summary & Sentiment with Gemini if available
    let summary = title;

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Analyze this college student grievance:
Title: ${title}
Description: ${description}
Location: ${location}

Provide a JSON response with:
1. "summary": A concise 1-sentence executive summary (under 15 words)
2. "sentiment": Sentiment category (e.g., "Critical Safety Hazard", "Urgent Friction", "Concerned", or "Informational")
3. "urgencyScore": Integer between 1 and 100
4. "suggestedDepartment": One of ["wifi_it", "hostel", "mess", "academics", "infrastructure", "library", "accounts", "transport", "sanitation", "sports"]
5. "suggestedPriority": One of ["Critical", "High", "Medium", "Low"]

Return ONLY raw JSON.`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const geminiData = await geminiRes.json();
        const rawJson = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed.summary) summary = parsed.summary;
          if (parsed.sentiment) sentiment = parsed.sentiment;
          if (parsed.urgencyScore) urgencyScore = parsed.urgencyScore;
          if (parsed.suggestedDepartment) detectedDept = parsed.suggestedDepartment;
          if (parsed.suggestedPriority) priority = parsed.suggestedPriority;
        }
      } catch (err) {
        // Fallback to heuristic
      }
    } else if (description && description.length > 30) {
      const cleanDesc = description.replace(/\r?\n|\r/g, ' ').trim();
      const firstSentence = cleanDesc.split(/[.!?]/)[0];
      summary = firstSentence.length > 120 ? `${firstSentence.substring(0, 117)}...` : firstSentence;
    }

    // 4. Duplicate Complaint Detection
    const duplicateCheck = await this.checkPotentialDuplicates(title, description, detectedDept);

    return {
      suggestedCategory: detectedDept,
      suggestedPriority: priority,
      urgencyScore,
      sentiment,
      summary,
      isPotentialDuplicate: duplicateCheck.isDuplicate,
      duplicateTicketId: duplicateCheck.matchedTicketId || null,
      duplicateSimilarity: duplicateCheck.similarityScore || 0,
      matchedComplaintTitle: duplicateCheck.matchedTitle || null
    };
  }

  /**
   * Search existing complaints in the same category for high text similarity
   */
  async checkPotentialDuplicates(title = '', description = '', department = '') {
    const complaints = await inMemoryStore.getAllComplaints({
      department: department && department !== 'all' ? department : undefined
    });

    const activeComplaints = complaints.filter(c => c.status !== 'Closed' && c.status !== 'Resolved');

    let maxSimilarity = 0;
    let bestMatch = null;

    const currentText = `${title} ${description}`;

    for (const item of activeComplaints) {
      const targetText = `${item.title} ${item.description}`;
      const sim = calculateTextSimilarity(currentText, targetText);

      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        bestMatch = item;
      }
    }

    // Similarity threshold > 35% indicates high overlap of key terms
    if (maxSimilarity >= 0.35 && bestMatch) {
      return {
        isDuplicate: true,
        matchedTicketId: bestMatch.ticketId,
        matchedTitle: bestMatch.title,
        similarityScore: Math.round(maxSimilarity * 100)
      };
    }

    return {
      isDuplicate: false,
      similarityScore: Math.round(maxSimilarity * 100)
    };
  }
}

module.exports = new AITriageService();
