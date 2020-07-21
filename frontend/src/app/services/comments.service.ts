import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import { AddPostService } from "./add-post.service"
@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  url = "http://localhost:3000/api/comments/"
  private posts: Post[] = [];
  private comments: Comment[] = []
  private postsUpdated = new Subject<Post[]>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private PostService: AddPostService) {}

  // getComments(postId:string) {
  //   this.PostService.getPost(postId).subscribe(post =>{
  //   })
  // }
  addComment(newComment,postId){
    const postData = new FormData();
    postData.append("date", newComment.date);
    postData.append("author", newComment.author);
    postData.append("content", newComment.content);

    this.http
    .post<{ message: string; comment: Comment }>(
      this.url,
      postData,{
        headers: {}
      }
    ).subscribe(responseData => {
      const comment: Comment = {
        id: responseData.comment.id,
        date: responseData.comment.date,
        author: responseData.comment.author,
        likes: responseData.comment.likes,
        content: newComment.content,
        replies: responseData.comment.replies,
        edited: responseData.comment.edited,
      };
      console.log(comment)
      //need to update post
      const postIndex = this.posts.findIndex(p => p.id === postId);
      let allPosts = this.PostService.posts[postIndex].comments.push(comment)
      this.PostService.updatePosts(allPosts)
  })
}
  //doesnt even exist lul
  /**get specific comment given its id */
  getComment(commentId: string) {
    return this.http.get<{
      _id: string;
      date: string;
      author: string;
      content: string;
      likes: string[];
      replies: Comment[];
      edited: string
    }>(
      this.url + commentId
    );
  }
  /**reply to head comment */
  reply(postId: string, commentId: string, reply: Comment){
    const commentData = new FormData();
    commentData.append("date", reply.date);
    commentData.append("author", reply.author);
    commentData.append("content", reply.content);
    const postIndex = this.posts.findIndex(p => p.id === postId);
    const commentIndex = this.posts[postIndex].comments.findIndex(c => c.id === commentId)

    this.http
    .post<{ message: string; reply: Comment }>(
      this.url + commentId,
      commentData,
    )
    .subscribe(responseData => {
      let allPosts = this.PostService.posts[postIndex].comments[commentIndex].push(responseData.reply)
      this.PostService.updatePosts(allPosts)
    })
  }
  /**edit comment */
  editComment(postId: string, commentId: string, newComment: Comment){
    const commentData = new FormData();
    commentData.append("id", newComment.id);
    commentData.append("date", newComment.date);
    commentData.append("author", newComment.author);
    commentData.append("content", newComment.content);
    commentData.append("edited", newComment.edited);
  }
  /**like existing comment */
  /**delete existing comment */


}
