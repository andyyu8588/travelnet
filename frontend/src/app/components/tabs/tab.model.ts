export class tab {
    [key: string]: any
    query: string
    path: string
    prePath:string
    content: Object[]

    constructor(query: string, path: string, content = [], prePath: string) {
        query = this.query
        path = this.path
        content = this.content
        prePath = this.prePath
    }
}
