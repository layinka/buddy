import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { getWalletClient, getPublicClient, fetchTransaction, writeContract, waitForTransaction } from '@wagmi/core';
import { parseEther } from 'ethers/lib/utils';

import { NgxSpinnerService } from 'ngx-spinner';
import { async, Subscription } from 'rxjs';

import { FiatCurrencies } from 'src/app/models/supported-fiats';
import { AppToastService } from 'src/app/services/app-toast.service';
import { P2pService } from 'src/app/services/p2p.service';
import { Web3Service } from 'src/app/services/web3.service';
import { environment } from 'src/environments/environment';
import { zeroAddress, parseAbiItem, parseAbi } from 'viem';
import { publicClientToProvider } from '../utils/ethers-wagmi-adapter';
import parseEventLogs from '../utils/parseEventLogs';
const P2PABI= require( "../../assets/abis/p2p.json");
// import * as P2PABI from '../../../../../assets/abis/p2p.json';

const EventABI:any = [];

@Component({
  selector: 'app-buy-modal',
  templateUrl: './buy-modal.component.html',
  styleUrls: ['./buy-modal.component.scss']
})
export class BuyModalComponent {
  @Input() listing: any;
  form: FormGroup|undefined=undefined;
  formSubscriptions: Subscription[]=[];

  validationMessages : {
    [index: string]: any
   } = {
     'amount' : {
       'required'  :   'Amount is Required.',
       'min' :   'Amount must be greater than 0',
       'max' :   'Amount must be lesser than 50'
     }  
 
   };

   paymentOptions = [
    'paypal',
    'bank-account',
    'paytm',
    'gpay',
    'phonepe'
   ]

   selectedPaymentOption: string = ''

   p2pContract: any;
    alreadyRegistered = false;

    nativeCurrency: any;

   fiatCurrencies : {
    name: string;
    id: number;
    code?: string | undefined;
    icon?: string | undefined;
  }[] = [];

  constructor(
    private fb: FormBuilder,
    public toastService: AppToastService,
    public activeModal: NgbActiveModal,
    private w3s: Web3Service,
    private spinner: NgxSpinnerService,
    private p2p: P2pService,
    private router: Router
  ){
    for (const key in FiatCurrencies) {
      if (Object.prototype.hasOwnProperty.call(FiatCurrencies, key)) {
        const element = FiatCurrencies[key];
        this.fiatCurrencies.push(element)
      }
    }
  }

  

  async ngOnInit(){
    setTimeout(async ()=>{
      this.nativeCurrency=this.w3s.chains.find(ff=>ff.id == this.w3s.chainId)?.nativeCurrency    

      this.p2pContract = await this.p2p.getP2PContract()
      this.alreadyRegistered = await this.p2pContract.read.isRegistered([this.w3s.account])
    }, 400)

    this.form = this.fb.group({
      amount: [0, [Validators.required, Validators.max(this.listing.amount)]],
      paymentOption: ['', []]
    })

   
    this.validationMessages['amount'].max = 'Amount must be lesser than ' + this.listing.amount;
    this.selectedPaymentOption = this.listing.sellerPayments[0]?.appName  

    console.log(this.listing)
  }

  

  get f() { return this.form!.controls; }
  get fv() { return this.form!.value; }

  supportsPaymentOption(option: string){
    return this.listing.sellerPayments && this.listing.sellerPayments.some((ss: any) =>ss.appName==option)
  }

  paymentOptionSelected(option: string){
    this.selectedPaymentOption = option;
  }


  async onSubmit(frm: FormGroup){

    if(!this.selectedPaymentOption || this.selectedPaymentOption==''){
      alert('Choose a payment option first!')
      return
    }
    this.spinner.show(); 
    
    

    try{
      // const walletClient  = await getWalletClient({
      //   chainId: this.w3s.chainId
      // })
      const publicClient = await getPublicClient({
        chainId: this.w3s.chainId
      })
      const address = this.w3s.account
      
      // // @ts-ignore
      // const { request } = await publicClient.simulateContract({
        
      //   abi: P2PABI,
      //   address: environment.p2pContractAddress[this.w3s.chainId!] as `0x{string}`,
      //   functionName: 'buyToken',
      //   account: address,
      //   args: [
      //     this.listing.listId,
      //     parseEther( this.f.amount.value.toString()), 
      //     'name',
      //     this.selectedPaymentOption
      //   ],
      //   // chain: this.w3s.chainId
      // })

      

      // const filter = await publicClient.createEventFilter({ 
      //   address: environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`,
      //   event: parseAbiItem('event BuyOrderSubmitted(uint indexed listingId, uint indexed orderId, address buyer )'),
      //   fromBlock: 'latest'
      // })

      const {hash} = await writeContract({
        
        abi: P2PABI,
        address: environment.p2pContractAddress[this.w3s.chainId!] as `0x{string}`,
        functionName: 'buyToken',
        
        args: [
          this.listing.listId,
          parseEther( this.f.amount.value.toString()), 
          'name',
          this.selectedPaymentOption
        ],
        // chain: this.w3s.chainId
      })

      await waitForTransaction( 
        { hash: hash }
      )
      
      const provider = publicClientToProvider(publicClient)

      const logs = await parseEventLogs(provider, hash,['event BuyOrderSubmitted(uint indexed listingId, uint indexed orderId, address buyer )'], 'BuyOrderSubmitted')
      const transaction = await fetchTransaction({
        hash,

      })
      
      // ...
      // const logs = await publicClient.getFilterLogs({ filter })
      // const orderId = logs[0]['args']['orderId'].toString()
      // const tokenId = logs[0]['args']['receiptTokenId'].toString()
      
      // @ts-ignore
      console.log('orderId Id:', logs[0]['args']['orderId'])
      // @ts-ignore
      const orderId = logs[0]['args']['orderId'].toString();

      this.spinner.hide();

      this.toastService.show('Success!', 'Order Created', 5000)
      this.router.navigate(['/order', orderId]);

      this.activeModal.close();
    }catch(err){
      console.error(err)
      this.spinner.hide();
      this.toastService.show('Error!', 'Order failed', 5000)
      this.activeModal.dismiss();
    }
  }

  objectKeys(o: any){
    
    if(!o){
      return []
    }
    return Object.keys(o)
  }
}
