import { Component } from '@angular/core';
import { fetchBalance, switchNetwork, readContract, getContract, writeContract, waitForTransaction } from '@wagmi/core';
import { Subscription } from 'rxjs';

import { Web3Service } from './web3.service';

import  nftAuctionManagerABI from '../assets/abis/nftauctionmanager.json';
import { parseEther } from 'viem';
import { nftAuctionManagerAddress } from 'src/constants';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'auction-app';

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

      

      

      const data = await readContract({
        address: nftAuctionManagerAddress,
        abi: nftAuctionManagerABI,
        functionName: 'auctionCount',
        args:[]

      })

      console.log('AUM Returned ', data)

      const contract = await getContract({
        address: nftAuctionManagerAddress,
        abi: nftAuctionManagerABI,
        // chainId: 1
      })

      //@ts-ignore
      const count = await contract.read.auctionCount();

      // contract.write.functionName([]);


      // const cnt = await contract.read.flut([1,'',er]);

      console.log('AUM Contract Returned ', count)


      
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

  async write(){
    const {hash} = await writeContract({
      address: nftAuctionManagerAddress,
      abi: nftAuctionManagerABI,
      functionName: 'createAuction',
      args: ['0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 1, parseEther('0.1') ] 
    })

    let txReceipt = await waitForTransaction({
      hash: hash,
      // confirmations:
    })

    // txReceipt.status== "success"

    alert('Status: ' +  txReceipt.status);

    const newCount = await readContract({
      address: nftAuctionManagerAddress,
      abi: nftAuctionManagerABI,
      functionName: 'auctionCount',
      args:[]

    })

    alert('New count'+ newCount )


  }


}
