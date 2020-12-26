import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'


@Component({
  selector: 'app-search-posts',
  templateUrl: './search-posts.component.html',
  styleUrls: ['./search-posts.component.scss']
})
export class SearchPostsComponent implements OnInit {
  form: FormGroup

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      input: new FormControl(null, {
        validators: []
      })
    })
  }
  onSearchPost(){
    if (this.form.invalid) {
      return
    }
    const input = this.form.get('input').value
    if (input){
    this.router.navigate(['/home', input])
    }
  }
}
