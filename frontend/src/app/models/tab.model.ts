import { SearchParams } from './searchParams';
export class tab {
  // [key: string]: any
  query: SearchParams
  content: {
    'venues': any[];
    'users': any[];
  }

  constructor(query: SearchParams, content: {[key: string]: any}) {
    query = this.query
    content = this.content
  }
}
