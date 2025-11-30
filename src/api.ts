import { graphql } from '@octokit/graphql'
import { Gist, Repository } from './types'
import { getDateTime } from './utils'

export async function getUserInfo(gql: typeof graphql, includeForks = false) {
    const query = `{
        viewer {
            createdAt
            issues {
                totalCount
            }
            pullRequests {
                totalCount
            }
            contributionsCollection {
                contributionYears
            }
            gists(first: 100) {
                totalCount
                nodes {
                    stargazers {
                        totalCount
                    }
                }
            }
            repositories(affiliations: OWNER, isFork: ${includeForks}, first: 100) {
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
            issues: {
                totalCount: number
            }
            pullRequests: {
                totalCount: number
            }
            contributionsCollection: {
                contributionYears: number[]
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
            issues,
            pullRequests,
            contributionsCollection: { contributionYears },
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

    return {
        accountAge,
        issues: issues.totalCount,
        pullRequests: pullRequests.totalCount,
        contributionYears,
        gists: gists.totalCount,
        repositories: repositories.totalCount,
        repositoryNodes: repositories.nodes,
        repositoriesContributedTo: repositoriesContributedTo.totalCount,
        stars,
    }
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
