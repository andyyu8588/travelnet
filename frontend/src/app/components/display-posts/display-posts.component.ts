import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { Subscription } from 'rxjs'

import { Post } from 'src/app/models/post.model'
import { AddPostService } from 'src/app/services/add-post.service'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpService } from 'src/app/services/http.service'

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
  posts: Post[] = []
  isLoading = false
  private postsSub: Subscription;
  timeoutHandler
  likeShow = false
  input: string


  constructor(public postsService: AddPostService, private HttpService: HttpService, private route: ActivatedRoute) {}

  ngOnInit() { // get all posts related to a user
    if (sessionStorage.getItem('username')){
      this.isLoading = true
      this.route.params.subscribe(params => {
        this.input = params.query
        if (this.input){
          this.postsService.searchPosts({input: this.input})
          this.postsSub = this.postsService.getPostUpdateListener()
          .subscribe((posts: Post[]) => {
            this.isLoading = false
            this.posts = posts
          })

        }
        else{
          this.HttpService.get('/user', null).then((res: any) => {
            this.user = res.user[0]
            this.postsService.getRelevantPosts({author: this.user.username, follows: this.user.following, tags: this.user.tags, location: this.user.location})
            this.postsSub = this.postsService.getPostUpdateListener()
            .subscribe((posts: Post[]) => {
              this.isLoading = false
              this.posts = posts
            })
          })
        }
      })
    }
  }

  onDelete(postId: string) { //delete a post
    this.postsService.deletePost(postId)
  }

  ngOnDestroy() {
    if (sessionStorage.getItem('username')){
      this.postsSub.unsubscribe()
    }
  }

  like(postId: string){
    this.postsService.likePost(postId, sessionStorage.getItem('username'))
  }

  public mouseup() {
    if (this.timeoutHandler) {
      clearInterval(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }

  public mousedown() {
    this.timeoutHandler = setInterval(() => {
      this.showLikes()
      console.log(this.likeShow)
    }, 300)
  }

  showLikes(){
    this.likeShow = !this.likeShow
  }

  submitComment(comment){

  }
  ownContent(post){
    if (sessionStorage.getItem('username') === post.author){
      return true
    }
  }




}

