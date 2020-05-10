import { SocketService } from 'src/app/services/socket.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  @Input() email: string
  @Input() username: string
  changeForm: FormGroup
  changing: boolean

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.changeForm = new FormGroup({
      'newEmail': new FormControl(this.email)
    })
  }

  // changing between form and h3 with old email
  onClick(): void {
    this.changing = !this.changing
  }

  // once a new email is submitted
  onSubmit(): void {
    const requestedChange = {
      username: this.username,
      proprety: 'email',
      newProprety: this.changeForm.get('newEmail').value
    }
    this.socketService.emit('editUser', requestedChange, (res) => {
      console.log(res)
    })
    window.location.reload()
  }
}
