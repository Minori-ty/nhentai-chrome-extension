export const log = window.console.log

window.console.clear = 1
window.console.log = 2
setInterval(() => {
    window.console.clear = 1
    window.console.log = 2
}, 500)
