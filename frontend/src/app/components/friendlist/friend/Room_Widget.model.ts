export class RoomWidget {
   [prop: string]: any;
   public roomName: string
   public thumbnail?: HTMLImageElement
   public status?: boolean
   
   constructor(roomName: string, thumbnail: HTMLImageElement, status: boolean) {
    this.status = status
    this.thumbnail = thumbnail
    this.username = roomName
   }
}