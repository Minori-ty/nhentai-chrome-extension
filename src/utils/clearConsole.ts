window.log = console.log
console.log = () => {
    window.log('console.log 已被禁用，请改用window.log')
}
console.clear = () => {}
