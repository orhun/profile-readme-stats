import { getUserInfo, getTotalCommits, getTotalReviews } from '../api'
import { graphql } from '@octokit/graphql'

// Mock graphql function
const mockGql = jest.fn() as unknown as typeof graphql

describe('api', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUserInfo', () => {
        it('should fetch and process user info', async () => {
            const mockData = {
                viewer: {
                    createdAt: '2020-01-01T00:00:00Z',
                    issues: { totalCount: 10 },
                    pullRequests: {
                        totalCount: 20,
                        nodes: [
                            {
                                title: 'PR 1',
                                url: 'http://pr1',
                                createdAt: '2023-01-01',
                                repository: { nameWithOwner: 'owner/repo', url: 'http://repo' },
                            },
                        ],
                    },
                    gists: { totalCount: 5, nodes: [{ stargazers: { totalCount: 1 } }] },
                    repositories: {
                        totalCount: 15,
                        nodes: [
                            {
                                stargazers: { totalCount: 2 },
                                languages: { edges: [] },
                            },
                        ],
                    },
                    repositoriesContributedTo: { totalCount: 3 },
                    followers: { totalCount: 100 },
                    following: { totalCount: 50 },
                    sponsorshipsAsMaintainer: { totalCount: 5 },
                    sponsorshipsAsSponsor: { totalCount: 2 },
                    repositoryDiscussionComments: { totalCount: 15 },
                    repositoryDiscussions: { totalCount: 8 },
                    contributionsCollection: {
                        contributionYears: [2023, 2022],
                        contributionCalendar: {
                            weeks: [
                                {
                                    contributionDays: [
                                        { contributionCount: 5, date: '2023-01-01' },
                                        { contributionCount: 0, date: '2023-01-02' },
                                    ],
                                },
                            ],
                        },
                    },
                },
            }
            ;(mockGql as unknown as jest.Mock).mockResolvedValue(mockData)

            const result = await getUserInfo(mockGql)

            expect(result.issues).toBe(10)
            expect(result.pullRequests).toBe(20)
            expect(result.stars).toBe(3) // 1 from gist + 2 from repo
            expect(result.followers).toBe(100)
            expect(result.sponsors).toBe(5)
            expect(result.discussionsStarted).toBe(8)
            expect(mockGql).toHaveBeenCalled()
        })
    })

    describe('getTotalCommits', () => {
        it('should sum up commits from all years', async () => {
            const mockData = {
                viewer: {
                    _2023: { totalCommitContributions: 100 },
                    _2022: { totalCommitContributions: 50 },
                },
            }
            ;(mockGql as unknown as jest.Mock).mockResolvedValue(mockData)

            const total = await getTotalCommits(mockGql, [2023, 2022])
            expect(total).toBe(150)
        })
    })
})
