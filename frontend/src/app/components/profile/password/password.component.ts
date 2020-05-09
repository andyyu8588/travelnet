import { SocketService } from './../../../services/socket.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements OnInit {
  @Input() username: string
  @Input() password: string
  changeForm: FormGroup
  changing: boolean

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.changeForm = new FormGroup({
      'newPassword': new FormControl(this.password)
    })
  }

  onClick(): void {
    this.changing = !this.changing
  }

  onSubmit(): void {
    const requestedChange = {
      username: this.username,
      proprety: 'password',
      newProprety: this.changeForm.get('newPassword').value
    }
    console.log(requestedChange.newProprety)
    this.socketService.emit('editUser', requestedChange, (res) => {
      console.log(res)
    })
  }
}
