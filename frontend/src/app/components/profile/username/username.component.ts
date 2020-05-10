import { SocketService } from 'src/app/services/socket.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit {
  @Input() username: string
  changeForm: FormGroup
  changing: boolean

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.changeForm = new FormGroup({
      'newUsername': new FormControl(this.username)
    })
  }

  // changing between form and h3 with old username
  onClick(): void {
    this.changing = !this.changing
  }

  // once a new username is submitted
  onSubmit(): void {
    const requestedChange = {
      username: this.username,
      proprety: 'username',
      newProprety: this.changeForm.get('newUsername').value
    }
    this.socketService.emit('editUser', requestedChange, (res) => {
      console.log(res)
    })
    sessionStorage.username = this.changeForm.get('newUsername').value
    window.location.reload()
  }
}