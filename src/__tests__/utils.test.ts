import { getDateTime, buildRegex, getOptsMap } from '../utils'
import { TPL_STR } from '../types'

describe('utils', () => {
    describe('getDateTime', () => {
        it('should return correct ISO string for a given year', () => {
            const date = getDateTime(2023)
            expect(date).toBe('2023-01-01T00:00:00.000Z')
        })
    })

    describe('buildRegex', () => {
        it('should build regex for template string', () => {
            const regex = buildRegex(TPL_STR.ACCOUNT_AGE)
            expect(regex).toBeInstanceOf(RegExp)
            expect('{{ ACCOUNT_AGE }}'.match(regex)).toBeTruthy()
        })

        it('should handle options', () => {
            const regex = buildRegex(TPL_STR.LANGUAGE_TEMPLATE_START)
            expect('{{ LANGUAGE_TEMPLATE_START:max=5 }}'.match(regex)).toBeTruthy()
        })

        it('should handle newlines if requested', () => {
            const regex = buildRegex(TPL_STR.LANGUAGE_TEMPLATE_START, true)
            expect('{{ LANGUAGE_TEMPLATE_START }}\n'.match(regex)).toBeTruthy()
        })
    })

    describe('getOptsMap', () => {
        it('should parse options string', () => {
            const opts = 'max=5;uri'
            const map = getOptsMap(opts)
            expect(map.get('max')).toBe('5')
            expect(map.has('uri')).toBe(true)
        })
    })
})
