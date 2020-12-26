export interface Comment {
  _id: string
  date: string
  author: string
  content: string
  likes: string[]
  replies: [{
    _id: string;
    date: string,
    author: string;
    content: string;
    likes: string[];
    edited: [{edit: string, date: string}];
    // replies: null
  }]
  edited: [{edit: string, date: string}]
}

