export class RoomWidget {
   [prop: string]: any;
   public roomName: string
   public roomId: string

   
   constructor(roomName: string, roomId: string) {
      this.roomId= roomId
      this.roomName = roomName
   }
}