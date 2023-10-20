import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest } from 'rxjs';
import { SupportedCoins } from 'src/app/models/supported-coins';
import { FiatCurrencies } from 'src/app/models/supported-fiats';
import { AppToastService } from 'src/app/services/app-toast.service';
import { P2pService } from 'src/app/services/p2p.service';
import { Web3Service } from 'src/app/services/web3.service';
import { BuyModalComponent } from '../buy-modal/buy-modal.component';


@Component({
  selector: 'app-buy-page',
  templateUrl: './buy-page.component.html',
  styleUrls: ['./buy-page.component.scss']
})
export class BuyPageComponent {
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

  listings : any[]|undefined = undefined

  sellerPayments: any;
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


  
  
  ngOnInit(): void {

    this.unsubscribeChain =  combineLatest([ this.w3s.chainId$, this.w3s.account$]).subscribe(async ([chainId, account])=>{
      if(!chainId || !account) return
      this.nativeCurrency=this.w3s.chains.find(ff=>ff.id == chainId)?.nativeCurrency    

      this.p2pContract = await this.p2p.getP2PContract()
      this.alreadyRegistered = await this.p2pContract.read.isRegistered([account])
      this.coins = SupportedCoins[this.w3s.chainId!]
      this.selectedCoin = this.coins[0]
      this.selectedFiat = this.fiatCurrencies[0]

      this.listings = await this.p2p.getListings(this.selectedFiat!.id, this.nativeCurrency.symbol)

      this.sellerPayments = await this.p2pContract.read.sellerPayments([account]) 
      
    })

  }

  
  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
  }


  async fiatChanged(eventTarget: any){
    this.listings = undefined;

    this.listings = await this.p2p.getListings(this.selectedFiat!.id, this.nativeCurrency.symbol)
  }


  onBuyClick(listing: any){
    const modalRef = this.modalService.open(BuyModalComponent);
		modalRef.componentInstance.listing = listing;   

    modalRef.closed.subscribe(async ()=>{
      // const result = await modalRef.result
      // this.router.navigate(['/manage/event', this.event?.id]);
      // window.location.reload(); 
    })
  }
}
