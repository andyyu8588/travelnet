export class tab {
    [key: string]: any
    query: string
    content: {
      'venues': any;
      'users': any;

    }

    constructor(query: string, path: string, content = {}, prePath: string) {
        query = this.query
        content = this.content
    }
}
