export interface Comment {
  _id: string;
  date: string,
  author: string;
  content: string;
  likes: string[];
  replies: [{
    _id: string;
    date: string,
    author: string;
    content: string;
    likes: string[];
  }];
  edited: string;
}

