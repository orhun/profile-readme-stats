import { promises as fs } from 'fs'
import * as core from '@actions/core'
import { graphql } from '@octokit/graphql'
import { TPL_STR } from './types'
import { getUserInfo, getTotalCommits, getTotalReviews } from './api'
import { replaceLanguageTemplate, replaceStringTemplate } from './template'

run().catch(error => core.setFailed(error.message))

async function run(): Promise<void> {
    const token = core.getInput('token')
    const template = core.getInput('template')
    const readme = core.getInput('readme')
    const includeForks = core.getInput('includeForks') === 'true'

    const gql = graphql.defaults({
        headers: { authorization: `token ${token}` },
    })

    const {
        accountAge,
        issues,
        pullRequests,
        contributionYears,
        gists,
        repositories,
        repositoryNodes,
        repositoriesContributedTo,
        stars,
    } = await getUserInfo(gql, includeForks)

    const totalCommits = await getTotalCommits(gql, contributionYears)
    const totalReviews = await getTotalReviews(gql, contributionYears)

    let o = await fs.readFile(template, { encoding: 'utf8' })
    o = replaceLanguageTemplate(o, repositoryNodes)
    o = replaceStringTemplate(o, TPL_STR.ACCOUNT_AGE, accountAge)
    o = replaceStringTemplate(o, TPL_STR.ISSUES, issues)
    o = replaceStringTemplate(o, TPL_STR.PULL_REQUESTS, pullRequests)
    o = replaceStringTemplate(o, TPL_STR.COMMITS, totalCommits)
    o = replaceStringTemplate(o, TPL_STR.CODE_REVIEWS, totalReviews)
    o = replaceStringTemplate(o, TPL_STR.GISTS, gists)
    o = replaceStringTemplate(o, TPL_STR.REPOSITORIES, repositories)
    o = replaceStringTemplate(
        o,
        TPL_STR.REPOSITORIES_CONTRIBUTED_TO,
        repositoriesContributedTo
    )
    o = replaceStringTemplate(o, TPL_STR.STARS, stars)
    await fs.writeFile(readme, o)
}
