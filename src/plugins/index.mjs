import forbidanConsole from './rules/forbidanConsole.mjs'

export const rules = {
    'forbidan-console': forbidanConsole,
}

export const configs = {
    recommended: {
        plugins: {
            nhentai: {
                rules,
            },
        },
        rules: {
            'nhentai/forbidan-console': 'error',
        },
    },
}

export default {
    rules,
    configs,
}
