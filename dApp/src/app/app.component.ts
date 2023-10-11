import { Component } from '@angular/core';
import { fetchBalance, switchNetwork, readContract, getContract, writeContract, waitForTransaction } from '@wagmi/core';
import { Subscription } from 'rxjs';

import { Web3Service } from './services/web3.service';


import { parseEther } from 'viem';
import { nftAuctionManagerAddress } from 'src/constants';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Buddy';

  selectedNetwork?: number;

  networkList?: any[];

  unsubscribeChain?: Subscription;

  balance : any;


  constructor(public  w3s: Web3Service){
    
  }

  async ngOnInit(){
    this.networkList= this.w3s.chains;

    
    this.unsubscribeChain =  this.w3s.chainId$.subscribe(async (chainId)=>{
      if(!chainId) return;
      this.selectedNetwork = chainId;      

      if(this.w3s.account){
        fetchBalance({
          address: this.w3s.account as `0x${string}`,
          // token: '0x12266565'
  
        }).then((b)=>{
          this.balance= {
            formatted: b.formatted,
            symbol: b.symbol
          }
        })
      }

      

      


      
    })

    


  }

  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
  }

  async onSwitchNetwork(newNetwork: any){

    this.selectedNetwork=newNetwork;


    await switchNetwork({
      chainId: newNetwork
    });

  }



}
