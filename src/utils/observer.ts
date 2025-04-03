import PageIndicator from './indicator'

export default class Observer {
    observer: IntersectionObserver
    indicator: PageIndicator
    total: number
    constructor(indicator: PageIndicator, total: number) {
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), { threshold: 0 })
        this.indicator = indicator
        this.total = total
    }

    handleIntersect(entries: IntersectionObserverEntry[]) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const map = new Map()
                const target = entry.target as HTMLElement

                if (map.has(target.getAttribute('data-page'))) {
                    const count = map.get(target.getAttribute('data-page'))
                    map.set(target.getAttribute('data-page'), count + 1)
                } else {
                    map.set(target.getAttribute('data-page'), 1)
                }
                const maxCount = Math.max(...map.values())
                const maxPage = [...map.entries()].find(([_, value]) => value === maxCount)![0]
                this.indicator.updatePageIndicator(`${maxPage} / ${this.total}`)
            }
        })
    }

    addObserve(target: Element) {
        this.observer.observe(target)
    }
}
