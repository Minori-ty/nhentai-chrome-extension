export default function forbidanClear() {
    console.clear = () => {}
    Object.defineProperty(console, 'clear', {
        value: () => {},
        writable: false, // 禁止重新赋值
        configurable: false, // 禁止重新定义属性
    })
}
