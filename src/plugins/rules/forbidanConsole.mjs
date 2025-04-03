import { AST_NODE_TYPES } from '@typescript-eslint/typescript-estree'

const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow use of console.log and suggest window.log instead',
        },
        fixable: 'code',
        messages: {
            forbidanConsole: '禁止console.log',
        },
        schema: [],
    },
    create(context) {
        return {
            CallExpression(node) {
                if (
                    node.callee.type === AST_NODE_TYPES.MemberExpression &&
                    node.callee.object.type === AST_NODE_TYPES.Identifier &&
                    node.callee.object.name === 'console' &&
                    node.callee.property.type === AST_NODE_TYPES.Identifier &&
                    node.callee.property.name === 'log'
                ) {
                    context.report({
                        node,
                        messageId: 'forbidanConsole',
                        fix(fixer) {
                            const sourceCode = context.sourceCode
                            const text = sourceCode.getText(node)
                            const fixedText = text.replace('console.log', 'window.log')
                            return fixer.replaceText(node, fixedText)
                        },
                    })
                }
            },
        }
    },
    defaultOptions: [],
}

export default rule
