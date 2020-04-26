export class RoomWidget {
   [prop: string]: any;
   public roomName: string
   public roomId: string
   public unread?: boolean

   
   constructor(roomName: string, roomId: string, unread: boolean) {
      this.roomId= roomId
      this.roomName = roomName
   }
}