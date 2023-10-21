import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getWalletClient, getPublicClient, fetchTransaction } from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest } from 'rxjs';
import { SupportedCoins } from 'src/app/models/supported-coins';
import { FiatCurrencies } from 'src/app/models/supported-fiats';
import { AppToastService } from 'src/app/services/app-toast.service';
import { P2pService } from 'src/app/services/p2p.service';
import { Web3Service } from 'src/app/services/web3.service';
import { delay } from 'src/app/utils/delay';
import { environment } from 'src/environments/environment';
import { formatEther, parseAbiItem, parseEther, zeroAddress } from 'viem';

const P2PABI= require( "../../assets/abis/p2p.json");

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss']
})
export class OrderPageComponent {
  id: any;
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

  order: any;
  unsubscribeChain: any;

  constructor(private formBuilder: FormBuilder,
    private w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private modalService: NgbModal,
    private p2p: P2pService) {

      for (const key in FiatCurrencies) {
        if (Object.prototype.hasOwnProperty.call(FiatCurrencies, key)) {
          const element = FiatCurrencies[key];
          this.fiatCurrencies.push(element)
        }
      }
    }

  async ngOnInit() {
     
        this.unsubscribeChain =  combineLatest([this.route.params, this.w3s.chainId$, this.w3s.account$]).subscribe(async ([params,chainId, account])=>{
          if(!(chainId && account)) return

          this.id = params['id'];
    
          this.nativeCurrency=this.w3s.chains.find(ff=>ff.id == chainId)?.nativeCurrency 

          this.p2pContract = await this.p2p.getP2PContract()
          this.alreadyRegistered = await this.p2pContract.read.isRegistered([account])
          this.coins = SupportedCoins[chainId!]

          const order = await this.p2pContract.read.getOrder([this.id])

          
          let tokenAddress = order.tokenAddress;
          let tokenInfo = {
            name: this.nativeCurrency.name,
            symbol: this.nativeCurrency.name
          }

          if(order.tokenAddress !== zeroAddress){
            tokenInfo = await this.w3s.getTokenInfo(order.tokenAddress)
          }

          const sellerPayments: any[] = await this.p2pContract.read.sellerPayments([order.seller]) 

          this.order = {
            ...order,
            isSeller : this.w3s.account== order.seller,
            amount: formatEther(order.amount).toString(),
            price: formatEther(order.price).toString(),
            tokenName: tokenInfo.name,
            tokenSymbol: tokenInfo.symbol,
            priceCurrency : this.fiatCurrencies.find(ff=>ff.id==order.priceCurrency)?.code,
            total : parseFloat(formatEther(order.amount).toString()) * parseFloat( formatEther(order.price).toString()),
            paymentOption: sellerPayments.find(ff=>ff.appName== order.payOption),
            

          } 
          
        })
        
  
  }

  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
  }


  async markAsPaid(){

    
    this.spinner.show(); 
    
    try{
      const walletClient  = await getWalletClient({
        chainId: this.w3s.chainId
      })
      const publicClient = await getPublicClient({
        chainId: this.w3s.chainId
      })
      const [address] = await walletClient!.getAddresses()
      
      // @ts-ignore
      const { request } = await publicClient.simulateContract({
        
        abi: P2PABI,
        address: environment.p2pContractAddress[this.w3s.chainId!] as `0x{string}`,
        functionName: 'markAsPaid',
        account: address,
        args: [
          this.id
        ],
        // chain: this.w3s.chainId
      })

      

      // const filter = await publicClient.createEventFilter({ 
      //   address: environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`,
      //   event: parseAbiItem('event BuyOrderSubmitted(uint indexed listingId, uint indexed orderId, address buyer )'),
      //   fromBlock: 'latest'
      // })

      const hash = await walletClient!.writeContract(request)

      await publicClient.waitForTransactionReceipt( 
        { hash: hash }
      )
      
      const transaction = await fetchTransaction({
        hash,

      })
      
      await delay(3000);
      this.order.paid=true;
      this.spinner.hide();

      this.toastService.show('Success!', 'Order Marked as paid', 5000)
      

      
    }catch(err){
      console.error(err)
      this.spinner.hide();
      this.toastService.show('Error!', 'Mark as paid failed', 5000)
      
    }
  }

  async release(){

    
    this.spinner.show(); 
    
    try{
      const walletClient  = await getWalletClient({
        chainId: this.w3s.chainId
      })
      const publicClient = await getPublicClient({
        chainId: this.w3s.chainId
      })
      const [address] = await walletClient!.getAddresses()
      
      // @ts-ignore
      const { request } = await publicClient.simulateContract({
        
        abi: P2PABI,
        address: environment.p2pContractAddress[this.w3s.chainId!] as `0x{string}`,
        functionName: 'release',
        account: address,
        args: [
          this.id
        ],
        // chain: this.w3s.chainId
      })

      

      // const filter = await publicClient.createEventFilter({ 
      //   address: environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`,
      //   event: parseAbiItem('event BuyOrderSubmitted(uint indexed listingId, uint indexed orderId, address buyer )'),
      //   fromBlock: 'latest'
      // })

      const hash = await walletClient!.writeContract(request)

      await publicClient.waitForTransactionReceipt( 
        { hash: hash }
      )
      
      const transaction = await fetchTransaction({
        hash,

      })
      
      await delay(3000);
      this.order.fulfilled=true;
      this.spinner.hide();

      this.toastService.show('Success!', 'Order Completed', 5000)
      

      
    }catch(err){
      console.error(err)
      this.spinner.hide();
      this.toastService.show('Error!', 'Release failed', 5000)
      
    }
  }


}
