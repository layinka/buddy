import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { NextIdProfile } from '../models';
import { NextIdService } from '../services/next-id.service';
import { Web3Service } from '../services/web3.service';

@Component({
  selector: 'next-id-profile',
  templateUrl: './next-id-profile.component.html',
  styleUrls: ['./next-id-profile.component.scss']
})
export class NextIdProfileComponent {
  @Input() identity?: string|null;
  unsub?: Subscription

  profiles?: NextIdProfile[];


  colors : {
    [profileType: string]: string      
  } = {
    'ethereum':'primary',
    'ens':'secondary',
    'farcaster':'info',
    'lens': 'warning',
    'next.id':'danger'
  }
  constructor(private nextIdProfileService: NextIdService, public  w3s: Web3Service){
    const s=''
    s.toLowerCase()
  }

  ngOnInit(){

    setTimeout(()=>{
      if(this.identity){
        this.nextIdProfileService.getProfiles(this.identity).subscribe((p)=>{
          this.profiles=p
        }, (err)=>{
          console.log('error getting ', (this.identity??''), 'profile', err)
        })
      }
    }, 500)
    // this.unsub = this.w3s.account$.subscribe((account)=>{
    //   if(this.identity){
    //     this.nextIdProfileService.getProfiles(this.identity).subscribe((p)=>{
    //       this.profiles=p
    //     })
    //   }
    // })
  }

  ngOnDestroy(){
    // this.unsub?.unsubscribe();
    // delete this.unsub;
  }
}
