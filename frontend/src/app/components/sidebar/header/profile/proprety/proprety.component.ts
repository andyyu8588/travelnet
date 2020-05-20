import { SocketService } from 'src/app/services/chatsystem/socket.service';
import { FormGroup, FormControl } from '@angular/forms';
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

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.changeForm = new FormGroup({
      'newPropretyValue': new FormControl(this.propretyValue)
    })
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
    this.socketService.emit('editUser', requestedChange, (res) => {
      console.log(res)
    })
    window.location.reload()
  }
}