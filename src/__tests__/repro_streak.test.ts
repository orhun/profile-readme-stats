import { calculateStreak } from '../api'

describe('repro streak bug', () => {
    it('should cap streak at 1 year (approx 365/366 days) when lifetime is disabled', () => {
        // Mock 400 days of continuous contributions
        // If the bug exists (and filtering is missing), it might return 400.
        // With the fix (filtering dates >= oneYearAgo), it should return ~365/366.

        const today = new Date()
        const days: any[] = []
        for (let i = 0; i < 400; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            days.push({
                contributionCount: 1,
                date: d.toISOString().split('T')[0],
            })
        }
        
        // Wrap in weeks structure
        const weeks: any[] = []
        // Push all days as one huge week or separate, calculateStreak flattens it anyway
        weeks.push({ contributionDays: days })

        const { currentStreak } = calculateStreak(weeks, false) // false = default = no lifetime

        // It should be 365 or 366 (leap year)
        expect(currentStreak).toBeLessThanOrEqual(366)
        expect(currentStreak).toBeGreaterThanOrEqual(365)
    })
})
