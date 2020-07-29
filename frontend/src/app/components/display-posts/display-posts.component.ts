import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subscription } from 'rxjs';

import { Post } from "src/app/models/post.model";
import { AddPostService } from "src/app/services/add-post.service";
import { FormGroup, FormControl } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-display-posts',
  templateUrl: './display-posts.component.html',
  styleUrls: ['./display-posts.component.scss']
})
export class DisplayPostsComponent implements OnInit, OnDestroy {
  user
  // posts = [
  //   { title: "First Post", content: "This is the first post's content" },
  //   { title: "Second Post", content: "This is the second post's content" },
  //   { title: "Third Post", content: "This is the third post's content" }
  // ];
  posts: Post[] = [];
  isLoading = false;
  private postsSub: Subscription;
  timeoutHandler
  likeShow = false
  form: FormGroup;


  constructor(public postsService: AddPostService, private HttpService: HttpService) {}

  ngOnInit() {
    this.form = new FormGroup({
      comment: new FormControl(null, {
        validators: []
      })
    })
    this.isLoading = true;
    this.HttpService.get('/user', null).then((res: any) => {
      this.user = res.user[0]
      this.postsService.getRelevantPosts({author: this.user.username, follows: this.user.following, tags: this.user.tags, location: this.user.ocation});
      this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.isLoading = false;
        this.posts = posts;
      });
    })

  }

  onDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  like(postId: string){
    this.postsService.likePost(postId, sessionStorage.getItem('username'))
  }

  public mouseup() {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  }

  public mousedown() {
    this.timeoutHandler = setInterval(() => {
      this.showLikes()
      console.log(this.likeShow)
    }, 300);
  }

  showLikes(){
    this.likeShow = !this.likeShow
  }

  submitComment(comment){

  }
  ownContent(post){
    if(sessionStorage.getItem('username') === post.author){
      return true
    }
  }



}

