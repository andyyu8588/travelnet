import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { mimeType } from './mime-type.validator';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  form: FormGroup
  imagePreview: string

  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'picture': new FormControl(null, [RxwebValidators.extension({extensions: ['jpeg', 'png']})])
    })
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({image: file})
    this.form.get('picture').updateValueAndValidity
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result.toString()
    }
    console.log(this.form)
    reader.readAsDataURL(file)
  }

  onSubmit() {
    console.log(this.form)
  }
}