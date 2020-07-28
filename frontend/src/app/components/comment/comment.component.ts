import { Component, OnInit, Input } from '@angular/core';
import { Comment } from 'src/app/models/comment.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommentsService } from 'src/app/services/comments.service';
import { MatDialog } from '@angular/material/dialog';
import { EditCommentComponent } from '../edit-comment/edit-comment.component';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment
  @Input() postId: string
  displayEdits = false
  replyField = false
  showReplies = false
  form: FormGroup;
  constructor(
    private commentsService: CommentsService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log(this.comment)
    this.form = new FormGroup({
      content: new FormControl(null, { validators: [Validators.required] }),
      })
  }

  replyBoolean(){
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
    let replyContent = {
      postId: this.postId,
      commentId: this.comment._id,
      reply: newReply
    }
    this.commentsService.reply(replyContent)
    this.form.reset();
  }
  likeTreeComment(){
    let likeContent = {
      postId: this.postId,
      commentId: this.comment._id,
      username: sessionStorage.getItem("username"),
      replyId: null
    }
    this.commentsService.likeComment(likeContent)
  }
  likeLeafComment(replyId){
    let likeContent = {
      postId: this.postId,
      commentId: this.comment._id,
      username: sessionStorage.getItem("username"),
      replyId: replyId
    }
    this.commentsService.likeComment(likeContent)
  }
  deleteTreeComment(){
    let deleteContent = {
      postId: this.postId,
      commentId: this.comment._id,
      replyId: null
    }
    this.commentsService.deleteComment(deleteContent)
  }
  deleteLeafComment(replyId){
    let deleteContent = {
      postId: this.postId,
      commentId: this.comment._id,
      replyId: replyId
    }
    this.commentsService.deleteComment(deleteContent)
  }
  editTreeComment(){
    let commentInfo = {
      postId: this.postId,
      comment: this.comment,
      replyId: null
    }
    const dialogRef = this.dialog.open(EditCommentComponent,{data:{displayEdits: false, comment: commentInfo}});
    dialogRef.afterClosed().subscribe();

  }
  showEdits(){
    let commentInfo = {
      postId: this.postId,
      comment: this.comment,
      replyId: null
    }
    const dialogRef = this.dialog.open(EditCommentComponent,{data:{displayEdits: true, comment: commentInfo}});
    dialogRef.afterClosed().subscribe();
  }
}
