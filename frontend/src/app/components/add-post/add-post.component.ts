import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { AddPostService } from "src/app/services/add-post.service";
import { Post } from "src/app/models/post.model";
import { mimeType } from "./mime-type.validator";
import { image } from '@rxweb/reactive-form-validators';

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

  constructor(
    public postsService: AddPostService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      location: new FormControl(null, { validators: [Validators.required] }),
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
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
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
          this.imagePreview = this.post.imagePath
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
}
