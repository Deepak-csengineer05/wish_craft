/**
 * Formats a Date object into a readable string like "7th January".
 * @param {Date} date - The date to format
 * @returns {string} - e.g., "7th January"
 */
export function formatDateLabel(date) {
  const day = date.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[date.getMonth()];

  let suffix = 'th';
  if (day === 1 || day === 21 || day === 31) suffix = 'st';
  else if (day === 2 || day === 22) suffix = 'nd';
  else if (day === 3 || day === 23) suffix = 'rd';

  return `${day}${suffix} ${month}`;
}

/**
 * Calculates milestone dates based on a birthday.
 * @param {string} birthdayInput - Date string (e.g. "2026-04-17" or "04-17")
 * @returns {Array<{daysPrior: number, dateLabel: string}>} - Array of milestones
 */
export function calculateMilestones(birthdayInput) {
  let targetYear = new Date().getFullYear();
  let month = 3; // April (0-indexed)
  let day = 17;

  if (birthdayInput) {
    const parts = birthdayInput.split('-');
    if (parts.length === 3) {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      targetYear = new Date().getFullYear();
    } else if (parts.length === 2) {
      // DD-MM
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      targetYear = new Date().getFullYear();
    }
  }

  const targetDate = new Date(targetYear, month, day);

  const offsets = [100, 75, 50, 25, 10, 5];
  
  return offsets.map(days => {
    const d = new Date(targetDate.getTime());
    d.setDate(targetDate.getDate() - days);
    return {
      daysPrior: days,
      dateLabel: formatDateLabel(d)
    };
  });
}
