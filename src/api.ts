import { graphql } from '@octokit/graphql'
import { Gist, Repository } from './types'
import { getDateTime } from './utils'

export async function getUserInfo(gql: typeof graphql, includeForks = false) {
    const query = `{
        viewer {
            createdAt
            followers { totalCount }
            following { totalCount }
            sponsorshipsAsMaintainer { totalCount }
            sponsorshipsAsSponsor { totalCount }
            repositoryDiscussionComments { totalCount }
            repositoryDiscussions { totalCount }
            issues {
                totalCount
            }
            pullRequests(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
                totalCount
                nodes {
                    title
                    url
                    createdAt
                    repository {
                        nameWithOwner
                        url
                    }
                }
            }
            contributionsCollection {
                contributionYears
                contributionCalendar {
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                        }
                    }
                }
            }
            gists(first: 100) {
                totalCount
                nodes {
                    stargazers {
                        totalCount
                    }
                }
            }
            repositories(affiliations: OWNER, ${
                includeForks ? '' : 'isFork: false,'
            } first: 100) {
                totalCount
                nodes {
                    stargazers {
                        totalCount
                    }
                    languages(first: 100) {
                        edges {
                            size
                            node {
                                color
                                name
                            }
                        }
                    }
                }
            }
            repositoriesContributedTo {
                totalCount
            }
        }
        rateLimit { cost remaining resetAt }
    }`

    interface Result {
        viewer: {
            createdAt: string
            followers: { totalCount: number }
            following: { totalCount: number }
            sponsorshipsAsMaintainer: { totalCount: number }
            sponsorshipsAsSponsor: { totalCount: number }
            repositoryDiscussionComments: { totalCount: number }
            repositoryDiscussions: { totalCount: number }
            issues: {
                totalCount: number
            }
            pullRequests: {
                totalCount: number
                nodes: Array<{
                    title: string
                    url: string
                    createdAt: string
                    repository: {
                        nameWithOwner: string
                        url: string
                    }
                }>
            }
            contributionsCollection: {
                contributionYears: number[]
                contributionCalendar: {
                    weeks: Array<{
                        contributionDays: Array<{
                            contributionCount: number
                            date: string
                        }>
                    }>
                }
            }
            gists: {
                totalCount: number
                nodes: Gist[]
            }
            repositories: {
                totalCount: number
                nodes: Repository[]
            }
            repositoriesContributedTo: {
                totalCount: number
            }
        }
    }

    const {
        viewer: {
            createdAt,
            followers,
            following,
            sponsorshipsAsMaintainer,
            sponsorshipsAsSponsor,
            repositoryDiscussionComments,
            repositoryDiscussions,
            issues,
            pullRequests,
            contributionsCollection: { contributionYears, contributionCalendar },
            gists,
            repositories,
            repositoriesContributedTo,
        },
    } = await gql<Result>(query)

    const accountAgeMS = Date.now() - new Date(createdAt).getTime()
    const accountAge = Math.floor(accountAgeMS / (1000 * 60 * 60 * 24 * 365.25))

    const stars = [...gists.nodes, ...repositories.nodes]
        .map(gist => gist.stargazers.totalCount)
        .reduce((total, current) => total + current, 0)

    const { currentStreak, longestStreak } = calculateStreak(contributionCalendar)

    const recentActivity = pullRequests.nodes
        .map(pr => `<li><a href="${pr.url}">${pr.title}</a> in <a href="${pr.repository.url}">${pr.repository.nameWithOwner}</a></li>`)
        .join('\n')

    return {
        accountAge,
        followers: followers.totalCount,
        following: following.totalCount,
        sponsors: sponsorshipsAsMaintainer.totalCount,
        sponsoring: sponsorshipsAsSponsor.totalCount,
        discussionsStarted: repositoryDiscussions.totalCount,
        discussionsAnswered: repositoryDiscussionComments.totalCount,
        issues: issues.totalCount,
        pullRequests: pullRequests.totalCount,
        contributionYears,
        currentStreak,
        longestStreak,
        recentActivity: `<ul>\n${recentActivity}\n</ul>`,
        gists: gists.totalCount,
        repositories: repositories.totalCount,
        repositoryNodes: repositories.nodes,
        repositoriesContributedTo: repositoriesContributedTo.totalCount,
        stars,
    }
}

function calculateStreak(calendar: {
    weeks: Array<{
        contributionDays: Array<{ contributionCount: number; date: string }>
    }>
}) {
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let isCurrentStreak = true

    const days = calendar.weeks
        .flatMap(week => week.contributionDays)
        .reverse() // Start from today

    // Check if today has contributions, if not, check yesterday to start streak
    const today = new Date().toISOString().split('T')[0]
    const todayContrib = days.find(d => d.date === today)
    
    // If no contribution today, we can still be in a streak if we contributed yesterday
    // But if we didn't contribute today OR yesterday, current streak is 0
    
    for (const day of days) {
        if (day.contributionCount > 0) {
            tempStreak++
        } else {
            // If we hit a day with 0 contributions
            if (isCurrentStreak) {
                // If we haven't broken the initial chain yet, this is our current streak
                // Exception: if the 0 contribution day is TODAY, we don't break the streak yet (unless yesterday was also 0)
                if (day.date !== today) {
                     currentStreak = tempStreak
                     isCurrentStreak = false
                }
            }
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak
            }
            tempStreak = 0
        }
    }
    
    // Final check in case the longest streak was the last one
    if (tempStreak > longestStreak) {
        longestStreak = tempStreak
    }
    
    // If we never broke the first chain (e.g. contributed every day), current = temp
    if (isCurrentStreak) {
        currentStreak = tempStreak
    }

    return { currentStreak, longestStreak }
}

export async function getTotalCommits(
    gql: typeof graphql,
    contributionYears: number[]
) {
    let query = '{viewer{'
    for (const year of contributionYears) {
        query += `_${year}: contributionsCollection(from: "${getDateTime(
            year
        )}") { totalCommitContributions }`
    }
    query += '}}'

    interface Result {
        viewer: Record<string, { totalCommitContributions: number }>
    }

    const result = await gql<Result>(query)
    return Object.keys(result.viewer)
        .map(key => result.viewer[key].totalCommitContributions)
        .reduce((total, current) => total + current, 0)
}

export async function getTotalReviews(
    gql: typeof graphql,
    contributionYears: number[]
) {
    let query = '{viewer{'
    for (const year of contributionYears) {
        query += `_${year}: contributionsCollection(from: "${getDateTime(
            year
        )}") { totalPullRequestReviewContributions }`
    }
    query += '}}'

    interface Result {
        viewer: Record<string, { totalPullRequestReviewContributions: number }>
    }

    const result = await gql<Result>(query)
    return Object.keys(result.viewer)
        .map(key => result.viewer[key].totalPullRequestReviewContributions)
        .reduce((total, current) => total + current, 0)
}
