import { HttpService } from 'src/app/services/http.service'
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap'
import { SocketService } from 'src/app/services/chatsystem/socket.service'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Component, OnInit, Input } from '@angular/core'
import * as moment from 'moment'

@Component({
  selector: 'app-proprety',
  templateUrl: './proprety.component.html',
  styleUrls: ['./proprety.component.scss']
})
export class PropretyComponent implements OnInit {
  @Input() username: string
  @Input() proprety: string
  @Input() propretyValue: string
  changeForm: FormGroup
  changing: boolean
  invalid: boolean
  invalidOld: boolean
  model: NgbDateStruct

  constructor(
    private httpService: HttpService) { }

  ngOnInit(): void {

    // special forms that need validations
    if (this.proprety == 'email') {
      this.changeForm = new FormGroup({
        newPropretyValue: new FormControl(this.propretyValue, [Validators.required, Validators.email])
      })
    } else if (this.proprety == 'password') {
      this.propretyValue = '••••••••'
      this.changeForm = new FormGroup({
        oldPassword: new FormControl(null, [Validators.required, Validators.minLength(5)]),
        newPropretyValue: new FormControl(null, [Validators.required, Validators.minLength(5)])
      })
    } else { // everything else
      if (this.proprety == 'birthdate') {
        this.propretyValue = this.propretyValue.slice(0, 10)
      }
      this.changeForm = new FormGroup({
        newPropretyValue: new FormControl(this.propretyValue, [Validators.required])
      })
    }
  }

  // changing between form and h3 with old proprety
  onClick(): void {
    this.changing = !this.changing
  }

  // once a new proprety is submitted
  onSubmit(): void {
    const requestedChange = {
      username: this.username,
      proprety: this.proprety,
      newProprety: this.changeForm.get('newPropretyValue').value
    }

    if (this.changeForm.valid) {
      this.invalid = false

      if (this.proprety == 'password') {
        // implement old password
      } else if (this.proprety == 'birthdate') {
        requestedChange.newProprety = moment(requestedChange.newProprety)
      }

      this.httpService.patch('/user/edit', requestedChange).then((res) => {
        console.log(res)
        window.location.reload()
      }).catch((err) => {
        console.log(err)
      })
    } else {
      this.invalid = true
    }
  }
}
