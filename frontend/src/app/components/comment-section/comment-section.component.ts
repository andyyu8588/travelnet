import { Component, OnInit, Input } from '@angular/core';
import { AddPostService } from 'src/app/services/add-post.service';
import { CommentsService } from 'src/app/services/comments.service';
import { ActivatedRoute } from '@angular/router';
import { Comment } from "src/app/models/comment.model";
import { Post } from 'src/app/models/post.model';
import { CommentStmt } from '@angular/compiler';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {
  @Input() post: Post
  public comments: Comment[]
  form: FormGroup;


  constructor(
    private postsService: AddPostService,
    private route: ActivatedRoute,
    private commentsService: CommentsService,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      content: new FormControl(null, { validators: [Validators.required] }),
    })
  }

  onAddComment() {
    if (this.form.invalid) {
      return;
    }
    let newComment = {
      date: new Date().toLocaleString(),
      author: sessionStorage.getItem('username'),
      content: this.form.value.content,
    }
    this.commentsService.addComment(newComment,this.post.id)
    this.form.reset();
  }

}
