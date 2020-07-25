import { Comment } from './comment.model'
export interface Post {
  _id: string;
  date: string,
  location: string,
  author: string;
  likes: string[];
  title: string;
  content: string;
  imagePath: string;
  tags: string[];
  comments: Comment[]
}

