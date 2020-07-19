import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "src/app/models/post.model";

@Injectable({ providedIn: "root" })
export class AddPostService {
  url = "http://localhost:3000/api/posts/"
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(this.url)
      .pipe(
        map(postData => {
          return postData.posts.map(post => {
            return {
              id: post._id,
              date: post.date,
              location: post.location,
              likes: post.likes,
              author: post.author,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              tags: post.tags
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
    return this.http.get<{
      _id: string,
      date: string,
      location: string,
      author: string,
      likes: Array<string>,
      title: string,
      content: string,
      imagePath: string,
      tags: Array<string>, }>(
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
          id: responseData.post.id,
          date: responseData.post.date,
          location: responseData.post.location,
          author: responseData.post.author,
          likes: responseData.post.likes,
          title: newPost.Title,
          content: newPost.content,
          imagePath: responseData.post.imagePath,
          tags: responseData.post.tags,
        };
        console.log(post)
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  updatePost(oldPost) {
    // id: string, title: string, content: string, image: File | string
    let postData: Post | FormData;
    if (typeof oldPost.image === "object") {
      postData = new FormData();
      postData.append("id", oldPost.id);
      postData.append("date", oldPost.date);
      postData.append("location", oldPost.location);
      postData.append("author", oldPost.author);
      postData.append("title", oldPost.title);
      postData.append("content", oldPost.content);
      postData.append("image", oldPost.image, oldPost.title);
      postData.append("tags", oldPost.tags);
    } else {
      postData = {
        id: oldPost.id,
        date: oldPost.date,
        location: oldPost.location,
        author: oldPost.author,
        likes: oldPost.likes,
        title: oldPost.title,
        content: oldPost.content,
        imagePath: oldPost.image,
        tags: oldPost.tags
      };
    }
    this.http
      .put(this.url + oldPost.id, postData)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === oldPost.id);
        const post: Post = {
          id: oldPost.id,
          date: oldPost.date,
          location: oldPost.location,
          author: oldPost.author,
          likes: oldPost.likes,
          title: oldPost.title,
          content: oldPost.content,
          imagePath: "",
          tags: oldPost.tags
        };
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete(this.url + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
  likePost(postId: string, username: string){
    const updatedPostIndex = this.posts.indexOf(this.posts.find(post => post.id == postId));
      this.http
      .put(this.url +'like/' + postId, {'username': username})
      .subscribe((response:{message:string, likes: string[]})=>{
        (this.posts[updatedPostIndex]).likes= response.likes
        this.postsUpdated.next([...this.posts])
      })
  }
}
