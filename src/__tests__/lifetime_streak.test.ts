import { calculateStreak, getAllContributionWeeks } from '../api'
import { graphql } from '@octokit/graphql'

const mockGql = jest.fn() as unknown as typeof graphql

describe('lifetime streak', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should calculate streak across multiple years when lifetime is enabled', async () => {
        // Mock data:
        // 2023: 1 contribution every day
        // 2022: 1 contribution every day
        // This should result in a streak of 365 + 365 = 730 days (ignoring leap years for simplicity of this mock)

        const days2023 = Array.from({ length: 365 }, (_, i) => ({
            contributionCount: 1,
            date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        })).reverse() // Newest first

        const days2022 = Array.from({ length: 365 }, (_, i) => ({
            contributionCount: 1,
            date: new Date(2022, 0, i + 1).toISOString().split('T')[0],
        })).reverse()

        const weeks2023: any[] = []
        for (let i = 0; i < days2023.length; i += 7) {
            weeks2023.push({ contributionDays: days2023.slice(i, i + 7) })
        }

        const weeks2022: any[] = []
        for (let i = 0; i < days2022.length; i += 7) {
            weeks2022.push({ contributionDays: days2022.slice(i, i + 7) })
        }

        const mockResponse = {
            viewer: {
                _2023: { contributionCalendar: { weeks: weeks2023 } },
                _2022: { contributionCalendar: { weeks: weeks2022 } },
            },
        }

        ;(mockGql as unknown as jest.Mock).mockResolvedValue(mockResponse)

        const weeks = await getAllContributionWeeks(mockGql, [2023, 2022])
        const { currentStreak, longestStreak } = calculateStreak(weeks, true)

        expect(currentStreak).toBeGreaterThan(700)
        expect(longestStreak).toBeGreaterThan(700)
    })
})
