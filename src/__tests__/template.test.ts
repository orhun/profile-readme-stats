import { replaceStringTemplate, replaceLanguageTemplate, getLanguages } from '../template'
import { TPL_STR, Repository } from '../types'

describe('template', () => {
    describe('replaceStringTemplate', () => {
        it('should replace template string with value', () => {
            const input = 'Age: {{ ACCOUNT_AGE }}'
            const output = replaceStringTemplate(input, TPL_STR.ACCOUNT_AGE, 5)
            expect(output).toBe('Age: 5')
        })

        it('should encode URI if requested', () => {
            const input = 'Color: {{ LANGUAGE_COLOR:uri }}'
            const output = replaceStringTemplate(input, TPL_STR.LANGUAGE_COLOR, '#123456')
            expect(output).toBe('Color: %23123456')
        })
    })

    describe('getLanguages', () => {
        const mockRepos: Repository[] = [
            {
                stargazers: { totalCount: 0 },
                languages: {
                    edges: [
                        { size: 100, node: { name: 'TypeScript', color: '#blue' } },
                        { size: 50, node: { name: 'JavaScript', color: '#yellow' } },
                    ],
                },
            },
        ]

        it('should calculate language percentages', () => {
            const languages = getLanguages(mockRepos, 5)
            expect(languages).toHaveLength(2)
            expect(languages[0].name).toBe('TypeScript')
            expect(languages[0].percent).toBe(66.6)
            expect(languages[1].name).toBe('JavaScript')
            expect(languages[1].percent).toBe(33.3)
        })

        it('should respect max limit and group others', () => {
             const manyRepos: Repository[] = [
                {
                    stargazers: { totalCount: 0 },
                    languages: {
                        edges: [
                            { size: 100, node: { name: 'A', color: 'a' } },
                            { size: 90, node: { name: 'B', color: 'b' } },
                            { size: 80, node: { name: 'C', color: 'c' } },
                        ],
                    },
                },
            ]
            const languages = getLanguages(manyRepos, 2)
            expect(languages).toHaveLength(2) // A, Other
            expect(languages[1].name).toBe('Other')
        })
    })
})
