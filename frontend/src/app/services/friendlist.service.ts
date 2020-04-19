import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { friend } from '../components/friendlist/friend/friend.model';
import { ArrayType } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class FriendlistService {

  public list: Array<friend> = []

  constructor(private socketService: SocketService) { }

    getList(array: string[]){
    this.list=[]
    let polishedarr = (array.filter((a,b) => array.indexOf(a) === (b))).sort()
    console.log(polishedarr)
    this.socketService.once("searchChatroom_res").subscribe((data:any) => {
      (data.res).forEach(element => {
        this.list.push({
          username: element.Users,

        })
      });
    })
    //sends array of users in alphabeltical order
    this.socketService.emit('searchChatroom', {sender: sessionStorage.getItem('username'), req: polishedarr})
  }
}

