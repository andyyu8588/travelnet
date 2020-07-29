import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "src/app/models/post.model";
import { Comment } from "src/app/models/comment.model";

@Injectable({ providedIn: "root" })
export class AddPostService {
  url = "http://localhost:3000/api/posts/"
  public posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(this.url)
      .pipe(
        map(postData => {
          var formattedComment
          var formattedReply
          return postData.posts.map(post => {
          return{
              _id: post._id,
              date: post.date,
              location: post.location,
              likes: post.likes,
              author: post.author,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              tags: post.tags,
              comments: post.comments
            };

          });
        })
      )
      .subscribe(transformedPosts => {
        console.log(transformedPosts)
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
  getRelevantPosts(UserPref:{author: [string],tags: [string], location: [string] }){
    this.http
      .post<{ message: string; posts: any }>(this.url+ 'getSpecific/',UserPref).pipe(
        map(postData => {
          var formattedComment
          var formattedReply
          return postData.posts.map(post => {
          return{
              _id: post._id,
              date: post.date,
              location: post.location,
              likes: post.likes,
              author: post.author,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              tags: post.tags,
              comments: post.comments
            };

          });
        })
      ).subscribe(transformedPosts => {
        console.log(transformedPosts)
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }


  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      date: string,
      location: string,
      author: string,
      likes: Array<string>,
      title: string,
      content: string,
      imagePath: string,
      tags: Array<string>,
      comments: Array<Comment>}>(
      this.url + id
    );
  }

  /**is now implemented inside user */
  addPost(newPost) {
    const postData = new FormData();
    postData.append("date", newPost.date);
    postData.append("location", newPost.location);
    postData.append("author", newPost.author);
    postData.append("title", newPost.title);
    postData.append("content", newPost.content);
    postData.append("image", newPost.image, newPost.title);
    postData.append("tags", newPost.tags);
    this.http
      .post<{ message: string; post: Post }>(
        this.url,
        postData,{
          headers: {
            authorization: localStorage.getItem('token')? localStorage.getItem('token').toString() : 'monkas'
          }
        }
      )
      .subscribe(responseData => {
        const post: Post = {
          _id: responseData.post._id,
          date: responseData.post.date,
          location: responseData.post.location,
          author: responseData.post.author,
          likes: responseData.post.likes,
          title: newPost.Title,
          content: newPost.content,
          imagePath: responseData.post.imagePath,
          tags: responseData.post.tags,
          comments: responseData.post.comments,
        };
        this.posts.push(post);
        this.postsUpdated.next(this.posts);
        this.router.navigate(["/"]);
        console.log(this.posts)
      });
  }

  updatePost(newPost) {
    // id: string, title: string, content: string, image: File | string
    let postData: Post | FormData;
    if (typeof newPost.image === "object") {
      postData = new FormData();
      postData.append("id", newPost._id);
      postData.append("date", newPost.date);
      postData.append("location", newPost.location);
      postData.append("author", newPost.author);
      postData.append("likes", newPost.likes);
      postData.append("title", newPost.title);
      postData.append("content", newPost.content);
      postData.append("image", newPost.image, newPost.title);
      postData.append("tags", newPost.tags);
      postData.append("comments", newPost.comments);
    } else {
      postData = {
        _id: newPost._id,
        date: newPost.date,
        location: newPost.location,
        author: newPost.author,
        likes: newPost.likes,
        title: newPost.title,
        content: newPost.content,
        imagePath: newPost.image,
        tags: newPost.tags,
        comments: newPost.comments
      };
    }
    this.http
      .put(this.url + newPost._id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p._id === newPost.id);
        const post: Post = {
          _id: newPost._id,
          date: newPost.date,
          location: newPost.location,
          author: newPost.author,
          likes: newPost.likes,
          title: newPost.title,
          content: newPost.content,
          imagePath: "",
          tags: newPost.tags,
          comments: newPost.comments
        };
        console.log(post)
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next(this.posts);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete(this.url + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post._id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next(this.posts);
      });
  }
  likePost(postId: string, username: string){
    const updatedPostIndex = this.posts.indexOf(this.posts.find(post => post._id == postId));
      this.http
      .put(this.url +'like/' + postId, {'username': username})
      .subscribe((response:{message:string, likes: string[]})=>{
        (this.posts[updatedPostIndex]).likes= response.likes
        this.postsUpdated.next(this.posts)
      })
  }
  updatePosts(posts){
    this.postsUpdated.next(posts)
  }
}
