import { HttpService } from 'src/app/services/http.service'
import { FormGroup, FormControl } from '@angular/forms'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-myaccount',
  templateUrl: './myaccount.component.html',
  styleUrls: ['./myaccount.component.scss']
})
export class MyaccountComponent implements OnInit {

  form: FormGroup
  imagePreview: string

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      picture: new FormControl(null, [])
    })
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({picture: file})
    this.form.get('picture').updateValueAndValidity
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result.toString()
    }
    console.log(this.form)
    reader.readAsDataURL(file)
  }

  onSubmit() {
    const imageData = new FormData()
    imageData.append('username', sessionStorage.getItem('username'))
    imageData.append('image', this.form.value.picture, 'profilepicture')
    this.httpService.post('/user/profilepicture', imageData).then((res) => {
      console.log('profile picture updated succesfully!')
    }).catch((err) => {
      console.log(err)
    })
  }
}
