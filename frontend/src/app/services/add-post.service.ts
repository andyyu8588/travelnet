import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "src/app/models/post.model";

@Injectable({ providedIn: "root" })
export class AddPostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>("http://localhost:3000/api/posts")
      .pipe(
        map(postData => {
          return postData.posts.map(post => {
            return {
              author: post.author,
              likes: post.likes,
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath
            };
          });
        })
      )
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{ _id: string, author: string, likes: string[], title: string, content: string, imagePath: string }>(
      "http://localhost:3000/api/posts/" + id
    );
  }

  addPost(newPost) {
    // title: string, content: string, image: File
    const postData = new FormData();
    postData.append("author", newPost.author);
    postData.append("title", newPost.title);
    postData.append("content", newPost.content);
    postData.append("image", newPost.image, newPost.title);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(responseData => {
        const post: Post = {
          id: responseData.post.id,
          author: newPost.author,
          title: newPost.title,
          content: newPost.content,
          imagePath: responseData.post.imagePath
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  updatePost(updatedPost) {
    // id: string, title: string, content: string, image: File | string
    let postData: Post | FormData;
    if (typeof updatedPost.image === "object") {
      postData = new FormData();
      postData.append("author", updatedPost.author);
      postData.append("id", updatedPost.id);
      postData.append("title", updatedPost.title);
      postData.append("content", updatedPost.content);
      postData.append("image", updatedPost.image, updatedPost.title);
    } else {
      postData = {
        id: updatedPost.id,
        author: updatedPost.author,
        title: updatedPost.title,
        content: updatedPost.content,
        imagePath: updatedPost.image
      };
    }
    this.http
      .put("http://localhost:3000/api/posts/" + updatedPost.id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === updatedPost.id);
        const post: Post = {
          id: updatedPost.id,
          title: updatedPost.title,
          author: updatedPost.author,
          content: updatedPost.content,
          imagePath: ""
        };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
