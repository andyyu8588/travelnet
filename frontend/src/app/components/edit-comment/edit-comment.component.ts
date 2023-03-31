import { Component, OnInit } from '@angular/core'
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog'
import { Inject } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { CommentsService } from 'src/app/services/comments.service'

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.scss']
})
export class EditCommentComponent implements OnInit {
  form: FormGroup
  commentData: any

  constructor(
    public dialogRef: MatDialogRef<any>,
    private CommentsService: CommentsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void { // re-initialize the comment
    if (!this.data.displayEdits){
      this.form = new FormGroup({
          comment: new FormControl(null, {validators: [Validators.required]}),
        })
      if (this.data.commentData.reply){
          this.form.setValue({
            comment: this.data.commentData.reply.content
            })
        }
        else{
          this.form.setValue({
            comment: this.data.commentData.comment.content
            })
        }
      this.commentData = this.data.commentData
      }
    }


  onEditComment(){ // save local data to the comment
    if (this.data.commentData.reply){
      this.commentData.reply.edited.push({edit: this.commentData.reply.content, date: Date().toLocaleString()})
      this.commentData.reply.content = this.form.value.comment
      this.CommentsService.editComment(this.commentData)
    }
    else{
      this.commentData.comment.edited.push({edit: this.commentData.comment.content, date: Date().toLocaleString()})
      this.commentData.comment.content = this.form.value.comment
      this.CommentsService.editComment(this.commentData)
    }
    this.closeDialog()
  }

  closeDialog() {
    this.dialogRef.close()
  }

}
