import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from "@angular/core";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { AddPostService } from "src/app/services/add-post.service";
import { Post } from "src/app/models/post.model";
import { mimeType } from "./mime-type.validator";
import { title } from 'process';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = "create";
  private postId: string;
  location: string

  //tags
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: string[] = [];

  constructor(
    public postsService: AddPostService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log(this.location)
    this.form = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      location: new FormControl(null, { validators: [Validators.required] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      tags: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            author: postData.author,
            date: postData.date,
            location: postData.location,
            likes: postData.likes,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            tags: postData.tags,
            comments: postData.comments,
          };
          this.form.setValue({
            location: this.post.location,
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
            tags: this.post.tags,
          });
          this.imagePreview = this.post.imagePath
          this.tags = this.post.tags
          this.location = this.post.location
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost({
        date: new Date().toLocaleString(),
        location: this.form.value.location,
        author: sessionStorage.getItem('username'),
        title: this.form.value.title,
        content: this.form.value.content,
        image: this.form.value.image,
        tags: this.form.value.tags,
      });
      console.log(this.form)
    } else {
      this.postsService.updatePost({
        id: this.postId,
        date: new Date().toLocaleString(), //will be changed to earlier date
        location: this.form.value.location,
        author: sessionStorage.getItem('username'),
        title: this.form.value.title,
        content: this.form.value.content,
        image: this.form.value.image,
        tags: this.form.value.tags,
      });
    }
    this.form.reset();
  }


  addTag(event): void {
    const input = event.input;
    const value = event.value;

    // Add a tag
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.form.patchValue({ tags: this.tags });
    this.form.get("tags").updateValueAndValidity();
  }

  removeTag(tag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    this.form.patchValue({ tags: this.tags });
    this.form.get("tags").updateValueAndValidity();
  }
  onAddLocation(location: string){
    this.location = location
    this.form.patchValue({ location: location });
    this.form.get("location").updateValueAndValidity();
    console.log(location)
  }
}
