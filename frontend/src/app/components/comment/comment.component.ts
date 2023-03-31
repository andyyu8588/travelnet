import { Component, OnInit, Input } from '@angular/core'
import { Comment } from 'src/app/models/comment.model'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { CommentsService } from 'src/app/services/comments.service'
import { MatDialog } from '@angular/material/dialog'
import { EditCommentComponent } from '../edit-comment/edit-comment.component'


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment
  @Input() postId: string
  displayEdits = false
  replyField = true
  showReplies = false
  form: FormGroup
  constructor(
    private commentsService: CommentsService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      content: new FormControl(null, { validators: [Validators.required] }),
      })
  }

  replyBoolean(){
    this.replyField = !this.replyField
  }

  onAddReply(){ // add comment reply
    if (this.form.invalid) {
      return
    }
    const newReply = {
      date: new Date().toLocaleString(),
      author: sessionStorage.getItem('username'),
      content: this.form.value.content,
    }
    const replyContent = {
      postId: this.postId,
      commentId: this.comment._id,
      reply: newReply
    }
    this.commentsService.reply(replyContent)
    this.form.reset()
  }

  likeTreeComment(){ //like a root tree
    const likeContent = {
      postId: this.postId,
      commentId: this.comment._id,
      username: sessionStorage.getItem('username'),
      replyId: null
    }
    this.commentsService.likeComment(likeContent)
  }

  likeLeafComment(replyId){ //like a child comment
    const likeContent = {
      postId: this.postId,
      commentId: this.comment._id,
      username: sessionStorage.getItem('username'),
      replyId
    }
    this.commentsService.likeComment(likeContent)
  }

  deleteTreeComment(){ //delete a root comment
    const deleteContent = {
      postId: this.postId,
      commentId: this.comment._id,
      replyId: null
    }
    this.commentsService.deleteComment(deleteContent)
  }

  deleteLeafComment(replyId){// delete a child comment
    const deleteContent = {
      postId: this.postId,
      commentId: this.comment._id,
      replyId
    }
    this.commentsService.deleteComment(deleteContent)
  }

  editTreeComment(){ //edit a root comment
    const commentInfo = {
      postId: this.postId,
      comment: this.comment,
      reply: null
    }
    const dialogRef = this.dialog.open(EditCommentComponent, {data: {displayEdits: false, commentData: commentInfo}})
    dialogRef.afterClosed().subscribe()
  }

  editLeafComment(reply){ //edit a root comment
    const commentInfo = {
      postId: this.postId,
      comment: this.comment,
      reply
    }
    const dialogRef = this.dialog.open(EditCommentComponent, {data: {displayEdits: false, commentData: commentInfo}})
    dialogRef.afterClosed().subscribe()

  }

  showParentEdits(){ // show previous edit for root comment
    const commentInfo = {
      postId: this.postId,
      comment: this.comment,
      reply: null
    }
    const dialogRef = this.dialog.open(EditCommentComponent, {data: {displayEdits: true, commentData: commentInfo}})
    dialogRef.afterClosed().subscribe()
  }

  showLeafEdits(reply){  // show previous edit for child comment
    const commentInfo = {
      postId: this.postId,
      comment: reply,
      reply: true
    }
    const dialogRef = this.dialog.open(EditCommentComponent, {data: {displayEdits: true, commentData: commentInfo}})
    dialogRef.afterClosed().subscribe()
  }

  ownContent(content){ //check if content belongs to user
    if (content.author === sessionStorage.getItem('username')){
      return true
    }
  }
}
