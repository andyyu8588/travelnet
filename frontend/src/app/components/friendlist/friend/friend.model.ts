export class friend {
   [prop: string]: any;
   public username: string
   public thumbnail?: HTMLImageElement
   public status?: boolean
   
   constructor(username: string, thumbnail: HTMLImageElement, status: boolean) {
    this.status = status
    this.thumbnail = thumbnail
    this.username = username
   }
}