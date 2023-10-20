import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppToastService } from 'src/app/services/app-toast.service';
import { P2pService } from 'src/app/services/p2p.service';
import { Web3Service } from 'src/app/services/web3.service';
import { Chain, erc20ABI, getPublicClient, getWalletClient, writeContract, waitForTransaction } from '@wagmi/core'
import { environment } from 'src/environments/environment';
import { AnyAaaaRecord } from 'dns';
import { delay } from 'src/app/utils/delay';
import { SupportedCoins } from 'src/app/models/supported-coins';
import {parseEther, zeroAddress} from 'viem'
import { FiatCurrencies } from 'src/app/models/supported-fiats';
const P2pABI = require( "../../assets/abis/p2p.json");

@Component({
  selector: 'app-sell-page',
  templateUrl: './sell-page.component.html',
  styleUrls: ['./sell-page.component.scss']
})
export class SellPageComponent {
  sellingForm: FormGroup;
  isChecked: boolean = false;

  
  p2pContract: any;
  alreadyRegistered = false;

  nativeCurrency: any;

  coins : {
    address: string;
    symbol?: string | undefined;
    icon?: string | undefined;
  }[] = []

  fiatCurrencies : {
    name: string;
    id: number;
    code?: string | undefined;
    icon?: string | undefined;
  }[] = [];

  selectedCoin : any 
  selectedFiat: {
      name: string;
      id: number;
      code?: string | undefined;
      icon?: string | undefined;
  } | undefined;

  constructor(private formBuilder: FormBuilder,
    private w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private p2p: P2pService) {
    // Initialize the form
    this.sellingForm = this.formBuilder.group({
      tokenAddress: ['', [Validators.required] ],
      fiatCurrency: ['USD', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(1000000000000)]],
      amount: [0, [Validators.required, Validators.min(0), Validators.max(1000000000000)]]
    });

    for (const key in FiatCurrencies) {
      if (Object.prototype.hasOwnProperty.call(FiatCurrencies, key)) {
        const element = FiatCurrencies[key];
        this.fiatCurrencies.push(element)
      }
    }
    
  }
  
  ngOnInit(): void {

    

    setTimeout(async ()=>{
      this.nativeCurrency=this.w3s.chains.find(ff=>ff.id == this.w3s.chainId)?.nativeCurrency  
      
     
      this.p2pContract = await this.p2p.getP2PContract()
      this.alreadyRegistered = await this.p2pContract.read.isRegistered([this.w3s.account])
      this.coins = SupportedCoins[this.w3s.chainId!]
      this.selectedCoin = this.coins[0]
      this.selectedFiat = this.fiatCurrencies[0]

      
    }, 600)
  }

  
  
  
  // convenience getter for easy access to form fields
  get f() { return this.sellingForm.controls; }

  get fv() { return this.sellingForm.value; }

  async submit(): Promise<void> {

    if(!this.alreadyRegistered){
      alert('You need to register to perform this operation')
      return
    }

    
    const walletClient  = await getWalletClient({
      chainId: this.w3s.chainId
    })
    const publicClient = await getPublicClient({
      chainId: this.w3s.chainId
    })

    this.spinner.show()

    try {
      const address = this.w3s.account
      const price = parseEther(this.sellingForm.value.price.toString());
      const amount = parseEther(this.sellingForm.value.amount.toString());


      // console.log('price 1: ', this.sellingForm.value.price.toString())
      // console.log('amount 1: ', this.sellingForm.value.amount.toString())


      // console.log('price: ', price.toString())
      // console.log('amount: ', amount.toString())

      // return;
      
      if(this.sellingForm.value.tokenAddress.address!==zeroAddress){
        // const tokenContract: any = this.w3s.getERC20Contract(this.sellingForm.value.tokenAddress.address, this.w3s.chainId,  walletClient)

        // const { request: apprvrequest } = await publicClient.simulateContract({
        //   abi: erc20ABI,
        //   address: this.sellingForm.value.tokenAddress.address as `0x${string}`,
        //   functionName: 'approve',
        //   account: address,
        //   args: [
        //     environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`, 
        //     amount
        //   ],
        //   // chain: this.w3s.chainId
        // })
  
        const approveHash = await writeContract({
          abi: erc20ABI,
          address: this.sellingForm.value.tokenAddress.address as `0x${string}`,
          functionName: 'approve',
          // account: address,
          args: [
            environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`, 
            amount
          ],
          // chain: this.w3s.chainId
        })  
        
        await waitForTransaction( 
          { hash: approveHash.hash }
        )  
        await delay(3000);
      }


      

      const {hash:sellHash} = await writeContract({
        abi: P2pABI,
        address: environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`,
        functionName: 'sellToken',
        args: [
          this.sellingForm.value.tokenAddress.address,
          amount,
          price,
          this.selectedFiat?.id
        ],
        value: this.sellingForm.value.tokenAddress.address===zeroAddress ? amount: undefined
        // chain: this.w3s.chainId
      })  
      
      await waitForTransaction( 
        { hash: sellHash }
      )

      await delay(3000);
      
      this.spinner.hide()
      this.toastService.show('Listed', 'Token Sale Listed Successfully!')
      
      
    } catch (error) {
      this.spinner.hide()
      this.toastService.error('Error','Token Listing failed');
      console.error(error)
      
    }
  }

}


