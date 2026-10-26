// Rank captains (student mentors) for a student. CUSTOMIZE the weights here.
// captain: { id, name, year, freePeer, rateCents, rating, bookedHours, weeklyCap, verifiedGrade, openSlots }
// level: 'peer' | 'pro' | 'sponsored'   (solo = no captain)
export function scoreCaptain(captain, { level = 'peer', budgetCents = 0 } = {}) {
  const reasons = [];
  if (captain.verifiedGrade == null) return null;                              // must have passed the module
  if (captain.bookedHours >= captain.weeklyCap) return null;                   // protect captains from overload
  if (level === 'peer' && !captain.freePeer) return null;
  if (level === 'pro' && budgetCents > 0 && captain.rateCents > budgetCents) return null;

  let score = 40; reasons.push('Passed this module');
  const g = (captain.verifiedGrade / 100) * 20; score += g; reasons.push(`Grade ${Math.round(captain.verifiedGrade)}%`);
  const slots = Math.min(captain.openSlots ?? 0, 3) * 8; score += slots; if (slots) reasons.push(`${captain.openSlots} open slots`);
  score += ((captain.rating ?? 0) / 5) * 10;
  if (level === 'pro' && budgetCents > 0) score += 10 * (1 - captain.rateCents / budgetCents);
  if (level === 'peer') { score += 10; reasons.push('Free peer captain'); }
  score -= (captain.bookedHours / captain.weeklyCap) * 10;                     // prefer captains with room
  return { score: Math.round(score * 10) / 10, reasons };
}

export function rankCaptains(captains, opts) {
  return captains
    .map((c) => ({ ...c, match: scoreCaptain(c, opts) }))
    .filter((c) => c.match)
    .sort((a, b) => b.match.score - a.match.score);
}
