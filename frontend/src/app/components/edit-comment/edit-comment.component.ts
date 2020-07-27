import { Component, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommentsService } from 'src/app/services/comments.service';

@Component({
  selector: 'app-edit-comment',
  templateUrl: './edit-comment.component.html',
  styleUrls: ['./edit-comment.component.scss']
})
export class EditCommentComponent implements OnInit {
  form: FormGroup;
  commentData: any

  constructor(
    public dialogRef: MatDialogRef<any>,
    private CommentsService: CommentsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data.comment)
    if(!this.data.displayEdits){
      this.form = new FormGroup({
          'comment': new FormControl(null, {validators: [Validators.required]}),
        })
        this.form.setValue({
          'comment': this.data.comment.comment.content
        })
        this.commentData = this.data.comment
      }
    }


  onEditComment(){
    this.commentData.comment.edited.push({edit: this.commentData.comment.content, date:Date().toLocaleString()})
    this.commentData.comment.content = this.form.value.comment
    console.log(this.commentData)
    this.CommentsService.editComment(this.commentData)
    this.closeDialog()
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
