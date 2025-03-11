const isNodeOrElement =
    typeof Node === 'function'
        ? (val: any): val is Node => val instanceof Node
        : (val: any): val is Node =>
              val && typeof val === 'object' && typeof val.nodeType === 'number' && typeof val.nodeName === 'string'

// 防 nhentai console 屏蔽
interface MyConsole extends Console {
    _clear?: () => void
    _log?: () => void
}

const c: MyConsole = window.console
c._clear = c.clear
c.clear = () => {}
c._log = c.log
c.log = () => {}
