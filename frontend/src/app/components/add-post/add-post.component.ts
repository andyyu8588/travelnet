import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core'
import {COMMA, ENTER} from '@angular/cdk/keycodes'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ActivatedRoute, ParamMap } from '@angular/router'

import { AddPostService } from 'src/app/services/add-post.service'
import { Post } from 'src/app/models/post.model'
import { mimeType } from './mime-type.validator'
import { title } from 'process'
import { Subscription } from 'rxjs'
import { geocodeResponseModel } from 'src/app/models/geocodeResp.model'
import { CitySearchComponent } from '../city-search/city-search.component'

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent implements OnInit, OnDestroy, AfterViewChecked {
  enteredTitle = ''
  enteredContent = ''
  post: Post
  isLoading = false
  form: FormGroup
  imagePreview: string
  private mode = 'create'
  private postId: string
  location: string

  // tags
  visible = true
  selectable = true
  removable = true
  addOnBlur = true
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]
  tags: string[] = []

  // filters
  private clickedOption_sub: Subscription
  clickedOption: geocodeResponseModel = null
  @ViewChild(CitySearchComponent) CitySearchComponent: CitySearchComponent
  checkedOnce = false

  constructor(
    public postsService: AddPostService,
    public route: ActivatedRoute
  ) {}


  ngOnInit() {
    this.form = new FormGroup({ // form to create social media posts
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      location: new FormControl(null, { validators: [Validators.required] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      tags: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId')
        this.isLoading = true
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false
          this.post = {
            _id: postData._id,
            author: postData.author,
            date: postData.date,
            location: postData.location,
            likes: postData.likes,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            tags: postData.tags,
            comments: postData.comments,
          }
          this.form.setValue({
            location: this.post.location,
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
            tags: this.post.tags,
          })
          this.imagePreview = this.post.imagePath
          this.tags = this.post.tags
          this.location = this.post.location
        })
      } else {
        this.mode = 'create'
        this.postId = null
      }
    })
  }

  ngAfterViewChecked(){
    if (this.CitySearchComponent && !this.checkedOnce){
      this.clickedOption_sub = this.CitySearchComponent.clickedOption.subscribe((city: geocodeResponseModel) => {
      if (city) {
        this.clickedOption = city
      } else {
        this.clickedOption = null
      }
      })
    }
    else if (!this.CitySearchComponent){

    }
    else{
      this.checkedOnce = true
    }
  }

  onImagePicked(event: Event) { // close input form for images
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({ image: file })
    this.form.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  onSavePost() { //send request to save post
    this.onAddLocation(this.clickedOption.name)
    if (this.form.invalid) {
      return
    }
    this.isLoading = true
    if (this.mode === 'create') {
      const newPost = {
        date: new Date().toLocaleString(),
        location: this.form.value.location,
        author: sessionStorage.getItem('username'),
        title: this.form.value.title,
        content: this.form.value.content,
        image: this.form.value.image,
        tags: this.form.value.tags,
      }
      this.postsService.addPost(newPost)
    } else {
      this.postsService.updatePost({
        _id: this.postId,
        date: this.post.date, // will be changed to earlier date
        location: this.form.value.location,
        author: sessionStorage.getItem('username'),
        likes: this.post.likes,
        title: this.form.value.title,
        content: this.form.value.content,
        image: this.form.value.image,
        tags: this.form.value.tags,
        comments: this.post.comments
      })
    }
    this.form.reset()
    this.isLoading = false;
  }


  addTag(event): void {
    const input = event.input
    const value = event.value

    // Add a tag
    if ((value || '').trim()) {
      this.tags.push(value.trim())
    }

    // Reset the input value
    if (input) {
      input.value = ''
    }
    this.form.patchValue({ tags: this.tags })
    this.form.get('tags').updateValueAndValidity()

  }

  removeTag(tag): void {
    const index = this.tags.indexOf(tag)
    if (index >= 0) {
      this.tags.splice(index, 1)
    }
    this.form.patchValue({ tags: this.tags })
    this.form.get('tags').updateValueAndValidity()
  }
  onAddLocation(location: string){
    this.location = location
    this.form.patchValue({ location })
    this.form.get('location').updateValueAndValidity()
  }
  ngOnDestroy(){
    this.clickedOption_sub.unsubscribe()
  }
}
