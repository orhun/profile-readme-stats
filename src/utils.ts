import { TPL_STR } from './types'

export function getDateTime(year: number) {
    const date = new Date()
    date.setUTCFullYear(year, 0, 1)
    date.setUTCHours(0, 0, 0, 0)
    return date.toISOString()
}

export function buildRegex(name: TPL_STR, newLine = false) {
    let str = `\\{\\{\\s*${name}(?::(?<opts>.+?))?\\s*\\}\\}`
    if (newLine) str += '\\n?'
    return new RegExp(str, 'g')
}

export function getOptsMap(opts: string) {
    const opt = new Map<string, string | undefined>()
    for (const match of opts.matchAll(/(?<key>[^=;]+)(?:=(?<value>[^;]+))?/g)) {
        const key = match.groups?.key
        const value = match.groups?.value
        if (key) opt.set(key, value)
    }
    return opt
}
