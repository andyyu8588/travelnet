import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { HttpClient } from '@angular/common/http'


@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.scss']
})
export class AddTagComponent implements OnInit {
  form: FormGroup
  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    this.form = new FormGroup({
      tag: new FormControl(null, {
        validators: []
      })
    })
  }
  onSubmit(){
    this.onAddTag(sessionStorage.getItem('username'), this.form.get('tag').value)
  }
  onAddTag(username: string, tag: string){ //send request to add tag to post
    this.http
      .put(environment.travelnetURL + "api/user/addTag/", {'username': username, 'tag': tag})
      .subscribe((response:{message:string, likes: string[]})=>{
        console.log(response)
    })
  }
}
