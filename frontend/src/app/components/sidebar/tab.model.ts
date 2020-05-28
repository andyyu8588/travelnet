export class tab {
    [key: string]: any
    query: string
    path: string
    content: Object[]

    constructor(query: string, path: string, content = []) {
        query = this.query
        path = this.path
        content = this.content
    }
}
