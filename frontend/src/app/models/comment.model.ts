export interface Comment {
  id: string;
  date: string,
  author: string;
  content: string;
  likes: string[];
  replies: Comment[];
}

