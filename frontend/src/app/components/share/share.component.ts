import { FormControl, FormGroup } from '@angular/forms'
import { Component, OnInit, Input } from '@angular/core'
import { threadId } from 'worker_threads'

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
  @Input() UrlLink: URL | string
  shareForm: FormGroup = null
  copied = false
  constructor() { }

  ngOnInit(): void {
    this.shareForm = new FormGroup({
     urlLinkControl: new FormControl(null)

    })
    this.shareForm.get('urlLinkControl').patchValue(this.UrlLink ? this.UrlLink : 'czi')
  }

  onCopyClick() {
    this.copied = true
  }

}
