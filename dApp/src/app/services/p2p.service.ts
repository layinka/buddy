
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getContract, readContract } from '@wagmi/core';
import { ethers } from 'ethers';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { formatEther, parseAbi, parseEther, zeroAddress } from 'viem';

import { formatDateToJsString, getDateFromEther } from '../utils/date';
import { Web3Service } from './web3.service';
const P2PABI= require( "../../assets/abis/p2p.json");


@Injectable({
  providedIn: 'root'
})
export class P2pService {

  
  constructor(private http: HttpClient, private w3s: Web3Service) { }


  async getP2PContract(){

    const contract = await getContract({
      address: environment.p2pContractAddress[this.w3s.chainId!] as `0x{string}`,
      abi: P2PABI,
      chainId: this.w3s.chainId
    })

    return contract
  }

  async getListings(currencyId: number,nativeCoin: string, start:number = 0, pagesize=50){
    
    const p2pContract = await this.getP2PContract();

    const listingIds = await p2pContract.read.currencyListings([currencyId, start, pagesize])
    const listings = await Promise.all(
        listingIds
          .map(async (element: any) => {
            let result: any = await p2pContract.read.listingAt([element]);

            // if(result.seller == this.w3s.account){
            //   return undefined;
            // }

            let tokenAddress = result.tokenAddress;
            let tokenInfo = {
              name: nativeCoin,
              symbol: nativeCoin
            }

            if(result.tokenAddress !== zeroAddress){
              tokenInfo = await this.w3s.getTokenInfo(result.tokenAddress)
            }

            const sellerPayments: any[] = await p2pContract.read.sellerPayments([result.seller]) 

            // console.log('parseEther(result.amount).toString(): ', parseEther('100').toString())

            // console.log('result.price:',result.price, ', formatEther(result.amount).toString(): ', formatEther(result.price).toString())

            // console.log('result.amount:',result.amount, ', formatEther(result.amount).toString(): ', formatEther(result.amount).toString())

            // console.log('result.amount:',result.amount, ', formatEther(result.amount).toString(): ', ethers.utils.formatEther(result.amount).toString())
            
            return {
              ...result,
              amount: formatEther(result.amount).toString(),
              price: formatEther(result.price).toString(),
              name: tokenInfo.name,
              symbol: tokenInfo.symbol,
              isOwnedByUser: result.seller == this.w3s.account,
              sellerPayments
            }
            
          })
      );
    return listings.filter(f=>!!f);
  }


}






function formatDateToIdString(date: Date){
  
  // Hours part from the timestamp
  const hours = date.getHours();
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  const seconds = "0" + date.getSeconds();

  const formattedTime = `${date.getMonth()}${date.getDate()}${date.getFullYear()}${hours}${minutes.substr(-2)}${seconds.substr(-2)}`;

  return formattedTime;
}