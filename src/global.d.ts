declare module '*.svg' {
    import React = require('react')
    export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
    const src: string
    export default src
}

declare module '*.json' {
    const content: string
    export default content
}

declare global {
    interface Window {
        log: typeof window.console.log
    }
}

export {}
