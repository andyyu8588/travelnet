import { Component, OnInit, Input } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommentsService } from 'src/app/services/comments.service';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment
  @Input() postId: string
  replyField = false
  showReplies = false
  form: FormGroup;
  constructor(
    private commentsService: CommentsService,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      content: new FormControl(null, { validators: [Validators.required] }),
      })
  }

  reply(){
    this.replyField = !this.replyField
  }
  onAddReply(){
    if (this.form.invalid) {
      return;
    }
    let newReply = {
      date: new Date().toLocaleString(),
      author: sessionStorage.getItem('username'),
      content: this.form.value.content,
    }
    this.commentsService.reply(this.postId,this.comment._id,newReply)
    this.form.reset();
  }
  likeTreeComment(){
    let likeContent = {
      postId: this.postId,
      commentId: this.comment._id,
      username: sessionStorage.getItem("username")
    }
    this.commentsService.liketreeComment(likeContent)
  }
  like(){

  }
}
