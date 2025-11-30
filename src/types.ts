export enum TPL_STR {
    LANGUAGE_TEMPLATE_START = 'LANGUAGE_TEMPLATE_START',
    LANGUAGE_TEMPLATE_END = 'LANGUAGE_TEMPLATE_END',
    LANGUAGE_NAME = 'LANGUAGE_NAME',
    LANGUAGE_PERCENT = 'LANGUAGE_PERCENT',
    LANGUAGE_COLOR = 'LANGUAGE_COLOR',
    ACCOUNT_AGE = 'ACCOUNT_AGE',
    ISSUES = 'ISSUES',
    PULL_REQUESTS = 'PULL_REQUESTS',
    CODE_REVIEWS = 'CODE_REVIEWS',
    COMMITS = 'COMMITS',
    GISTS = 'GISTS',
    REPOSITORIES = 'REPOSITORIES',
    REPOSITORIES_CONTRIBUTED_TO = 'REPOSITORIES_CONTRIBUTED_TO',
    STARS = 'STARS',
    FOLLOWERS = 'FOLLOWERS',
    FOLLOWING = 'FOLLOWING',
    SPONSORS = 'SPONSORS',
    SPONSORING = 'SPONSORING',
    DISCUSSIONS_STARTED = 'DISCUSSIONS_STARTED',
    DISCUSSIONS_ANSWERED = 'DISCUSSIONS_ANSWERED',
    COMMIT_STREAK = 'COMMIT_STREAK',
    LONGEST_COMMIT_STREAK = 'LONGEST_COMMIT_STREAK',
    RECENT_ACTIVITY = 'RECENT_ACTIVITY',
}

export interface Starrable {
    stargazers: {
        totalCount: number
    }
}

export interface Gist extends Starrable {}

export interface Repository extends Starrable {
    languages: {
        edges: Array<{
            size: number
            node: {
                color?: string
                name: string
            }
        }>
    }
}

export interface Language {
    name: string
    size: number
    percent: number
    color: string
}
