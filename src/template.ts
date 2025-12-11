import { TPL_STR, Repository, Language } from './types'
import { buildRegex, getOptsMap } from './utils'

export function replaceStringTemplate(
    input: string,
    name: TPL_STR,
    value: string | number
) {
    return input.replace(buildRegex(name), (_, opts) =>
        opts && getOptsMap(opts).has('uri')
            ? encodeURIComponent(value)
            : String(value)
    )
}

export function replaceLanguageTemplate(
    input: string,
    repositories: Repository[]
) {
    const rStart = buildRegex(TPL_STR.LANGUAGE_TEMPLATE_START, true)
    const rEnd = buildRegex(TPL_STR.LANGUAGE_TEMPLATE_END, true)

    const replacements = []
    for (const match of input.matchAll(rStart)) {
        if (match.index === undefined) continue
        const opts = match.groups?.opts
        const max = (opts && Number(getOptsMap(opts).get('max'))) || 8
        const end = match.index + match[0].length
        const s = input.substring(end)
        const endMatch = s.search(rEnd)
        if (endMatch === -1) continue
        const str = s.substring(0, endMatch)
        const replacement = getLanguages(repositories, max)
            .map(lang => {
                let res = str
                res = replaceStringTemplate(
                    res,
                    TPL_STR.LANGUAGE_NAME,
                    lang.name
                )
                res = replaceStringTemplate(
                    res,
                    TPL_STR.LANGUAGE_PERCENT,
                    lang.percent
                )
                res = replaceStringTemplate(
                    res,
                    TPL_STR.LANGUAGE_COLOR,
                    lang.color
                )
                return res
            })
            .reduce((acc, parts) => acc + parts, '')
        replacements.push({
            start: end,
            end: end + endMatch,
            replacement,
        })
    }

    let output = ''
    let start = 0
    for (const replacement of replacements) {
        output += input.substring(start, replacement.start)
        output += replacement.replacement
        start = replacement.end
    }
    output += input.substring(start, input.length)
    output = output.replace(rStart, '').replace(rEnd, '')
    return output
}

export function getLanguages(repositories: Repository[], max: number) {
    const languages = new Map<string, Language>()

    for (const repo of repositories) {
        for (const lang of repo.languages.edges) {
            const existing = languages.get(lang.node.name)
            if (existing) {
                existing.size += lang.size
            } else {
                languages.set(lang.node.name, {
                    name: lang.node.name,
                    size: lang.size,
                    percent: 0,
                    color: lang.node.color || '#ededed',
                })
            }
        }
    }

    const langs = [...languages.values()].sort((a, b) => b.size - a.size)
    const totalSize = langs.reduce((acc, lang) => acc + lang.size, 0)
    /** rounds x to 1 decimal place */
    const round = (x: number) => Math.floor(x * 10) / 10
    const getPercent = (size: number) => round((size / totalSize) * 100)
    for (const lang of langs) {
        lang.percent = getPercent(lang.size)
    }

    let maxLanguages = max

    // adjust maxLanguages based on languages that are under 0.1%
    const index = langs.findIndex(lang => lang.percent === 0)
    if (index !== -1) {
        maxLanguages = Math.min(maxLanguages, index + 1)
    }

    // aggregate removed languages under 'Other'
    if (maxLanguages < langs.length) {
        const size = langs
            .splice(maxLanguages - 1)
            .reduce((acc, lang) => acc + lang.size, 0)
        const percent = getPercent(size)

        if (percent !== 0) {
            langs.push({
                name: 'Other',
                size,
                percent,
                color: '#ededed',
            })
        }
    }

    return langs
}
