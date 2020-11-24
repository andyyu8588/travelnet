import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'

import { Post } from '../models/post.model'
import { Comment } from '../models/comment.model'
import { AddPostService } from './add-post.service'
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  url = environment.travelnetCommentURL
  private posts: Post[] = []
  private postsUpdated = new Subject<Post[]>()

  constructor(
    private http: HttpClient,
    private router: Router,
    private PostService: AddPostService) {}

  addComment(newComment, postId: string){
    this.http
    .post<{ message: string; comment: Comment }>(
      this.url,
      {commentData: newComment, postId}, {
        headers: {}
      }
    ).subscribe(responseData => {
      const comment: Comment = {
        _id: responseData.comment._id,
        date: responseData.comment.date,
        author: responseData.comment.author,
        likes: responseData.comment.likes,
        content: newComment.content,
        replies: responseData.comment.replies,
        edited: responseData.comment.edited,
      }
      console.log(comment)
      // need to update post
      const postIndex = this.PostService.posts.findIndex(p => p._id === postId)
      this.PostService.posts[postIndex].comments.push(comment)
      this.PostService.updatePosts(this.PostService.posts)
  })
}
  /**get all comments associated to a post*/
  getComments() {
    this.http
      .get<{ message: string; comments: any }>(this.url)
      .pipe(
        map(commentData => {
          return commentData.comments.map(comment => {
            return {
              _id: comment._id,
              date: comment.date,
              author: comment.author,
              content: comment.content,
              likes: comment.likes,
              replies: comment.replies,
              edited: comment.edited
            }
          })
        })
      )
      .subscribe(transformedComments => {
        // this.posts = transformedPosts;
        // this.postsUpdated.next([...this.posts])/;
      })
  }
  // doesnt even exist lul
  /**get specific comment given its id */
  getComment(commentId: string) {
    return this.http.get<{
      _id: string;
      date: string;
      author: string;
      content: string;
      likes: string[];
      replies: Comment[];
      edited: string[]
    }>(
      this.url + commentId
    )
  }
  /**reply to head comment */
  reply(replyContent: {postId: string, commentId: string, reply: any}){
    const postIndex = this.PostService.posts.findIndex(p => p._id === replyContent.postId)
    const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === replyContent.commentId)

    this.http
    .put<{ message: string; reply: Comment }>(
      this.url + replyContent.commentId,
      {commentData: replyContent.reply, postId: replyContent.postId})
    .subscribe(responseData => {
      this.PostService.posts[postIndex].comments[commentIndex].replies.push(responseData.reply)
      this.PostService.updatePosts(this.PostService.posts)
    })
  }
  /**edit  tree comment */
  editComment(editContent: {postId: string, reply: any, comment: any}){
    console.log(editContent)
    const postIndex = this.PostService.posts.findIndex(p => p._id === editContent.postId)
    const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === editContent.comment._id)
    if (editContent.reply){
      const replyIndex = this.PostService.posts[postIndex].comments[commentIndex].replies.findIndex(r => r._id === editContent.reply._id)
    }
    this.http
    .put<{ message: string; comment: Comment }>(
      this.url + 'edit/' + editContent.comment._id,
    {postId: editContent.postId, replyId: editContent.reply, comment: editContent.comment})
      .subscribe(response => {
        (this.PostService.posts[postIndex]).comments[commentIndex] = response.comment
        this.PostService.updatePost(this.PostService.posts)
      })


  }
  /**like comment */
  likeComment(likeContent: {postId: string, commentId: string, username: string, replyId: string}){
    const postIndex = this.PostService.posts.findIndex(p => p._id === likeContent.postId)
    const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === likeContent.commentId)
    if (likeContent.replyId){
      const replyIndex = this.PostService.posts[postIndex].comments[commentIndex].replies.findIndex(r => r._id === likeContent.replyId)
    }
    this.http
    .put<{ message: string; likes: string[] }>(
      this.url + 'like/' + likeContent.commentId,
    {postId: likeContent.postId, username: likeContent.username, replyId: likeContent.replyId})
      .subscribe(response => {
        if (likeContent.replyId){
          (this.PostService.posts[postIndex]).comments[commentIndex].replies[replyIndex].likes = response.likes
        }
        else{
          (this.PostService.posts[postIndex]).comments[commentIndex].likes = response.likes
        }
        this.PostService.updatePost(this.PostService.posts)
      })
  }
  /**delete existing comment */
  deleteComment(deleteContent: {postId: string, commentId: string, replyId: string}){
    const postIndex = this.PostService.posts.findIndex(p => p._id === deleteContent.postId)
    const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === deleteContent.commentId)
    if (deleteContent.replyId){
      const replyIndex = this.PostService.posts[postIndex].comments[commentIndex].replies.findIndex(r => r._id === deleteContent.replyId)
    }
    this.http
    .put<{}>(
      this.url + 'delete/' + deleteContent.commentId,
      {postId: deleteContent.postId, replyId: deleteContent.replyId})
      .subscribe(() => {
        const newPosts = this.PostService.posts
        if (deleteContent.replyId){
          newPosts[postIndex].comments[commentIndex].replies.splice(replyIndex)
        }
        else{
          newPosts[postIndex].comments.splice(commentIndex)
        }
        this.postsUpdated.next(newPosts)
      })
  }
}
