import { SocketService } from 'src/app/services/chatsystem/socket.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

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

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    if (this.proprety == 'email') {
      this.changeForm = new FormGroup({
        'newPropretyValue': new FormControl(this.propretyValue, [Validators.required, Validators.email])
      })
    } else if (this.proprety == 'password') {
      this.changeForm = new FormGroup({
        'newPropretyValue': new FormControl(this.propretyValue, [Validators.required, Validators.minLength(5)])
      })
    } else {
      this.changeForm = new FormGroup({
        'newPropretyValue': new FormControl(this.propretyValue, [Validators.required])
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
      this.socketService.emit('editUser', requestedChange, (res) => {
        console.log(res)
        window.location.reload()
      })
    } else {
      this.invalid = true
    }    
  }
}