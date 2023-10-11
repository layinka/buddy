import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getWalletClient, getPublicClient, fetchTransaction, writeContract, waitForTransaction } from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';

import { AppToastService } from 'src/app/services/app-toast.service';
import { P2pService } from 'src/app/services/p2p.service';
import { Web3Service } from 'src/app/services/web3.service';
import { delay } from 'src/app/utils/delay';
import { environment } from 'src/environments/environment';
import { zeroAddress, parseAbiItem } from 'viem';
const P2pABI = require( "../../assets/abis/p2p.json");




@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  
  contract: any; // Update the type according to your contract
  connected: boolean = false;
  signer: any; // Update the type according to your signer


  paytm: string = '';
  gpay: string = '';
  phonepe: string = '';
  paypalEmail: string = '';

  showPaytm: boolean = false;
  showGpay: boolean = false;
  showPaypal: boolean = false;
  showPhonepe: boolean = false;
  showBankAccount=false;

  
  registrationForm: FormGroup;

  p2pContract: any;
  alreadyRegistered = false;

  constructor(private formBuilder: FormBuilder,
    private w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private p2p: P2pService) {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gpay: '',
      phonepe: '',
      paypalEmail: '',
      paytm: '',
      bankAccount: '',
      bankAccountName: ['', []],
      bankName: ['', []]
    });
  }

  ngOnInit(): void {
    setTimeout(async ()=>{
      this.p2pContract = await this.p2p.getP2PContract()      
      this.alreadyRegistered = await this.p2pContract.read.isRegistered([this.w3s.account])

    }, 400)
  }

  

  paytmClicked() {
    const t= this.showPaytm
    this.hideAllPayments();
    this.showPaytm = !t;
  }

  gpayClicked() {
    const t= this.showGpay
    this.hideAllPayments();
    this.showGpay = !t;
  }

  phonepeClicked() {
    const t= this.showPhonepe
    this.hideAllPayments();
    this.showPhonepe = !t;
  }

  paypalClicked() {
    const t= this.showPaypal
    this.hideAllPayments();
    this.showPaypal = !t;
  }

  bankAccountClicked() {
    const t= this.showBankAccount
    this.hideAllPayments();
    this.showBankAccount = !t;
  }

  hideAllPayments(){
    this.showPaypal = false;
    this.showGpay = false;
    this.showPaytm = false;
    this.showPhonepe = false;
    this.showBankAccount=false;
  }

  
  
  // convenience getter for easy access to form fields
  get f() { return this.registrationForm.controls; }
  
  async submit(event: Event) {
    event.preventDefault();

    
    if (!this.registrationForm || this.registrationForm.invalid) {
      // Form validation failed
      return;
    }

    this.spinner.show()

    // Registration logic here
    // Access form values using this.registrationForm.value

    const payments = [];
    if (this.f.gpay.value ) {
      payments.push({
        appName: 'gpay',
        paymentInstruction: this.f.gpay.value,
      });
    }
    if (this.f.phonepe.value) {
      payments.push({
        appName: 'phonepe',
        paymentInstruction: this.f.phonepe.value 
      });
    }
    if (this.f.paypalEmail.value ) {
      payments.push({
        appName: 'paypal',
        paymentInstruction: this.f.paypalEmail.value ,
      });
    }
    if (this.f.paytm.value) {
      payments.push({
        appName: 'paytm',
        paymentInstruction: this.f.paytm.value,
      });
    }
    if (this.f.bankAccount.value ) {
      payments.push({
        appName: 'bank',
        paymentInstruction: `Pay to \n Bank: ${this.f.bankName.value}\n Account Name: ${this.f.bankAccountName.value}\nAccount Number ${this.f.bankAccount.value}`,
        // userId: this.f.bankAccount.value,
        // userName: this.f.bankAccountName.value,
        // bank: this.f.bankName.value
      });
    }

    try {
      const walletClient  = await getWalletClient({
        chainId: this.w3s.chainId
      })
      const publicClient = await getPublicClient({
        chainId: this.w3s.chainId
      })
      
      const account = walletClient?.account;// await walletClient!.getAddresses()
      
      
      // const { request } = await publicClient.simulateContract({
      //   abi: P2pABI,
      //   address: environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`,
      //   functionName: 'register',
      //   account: account?.address,
      //   args: [
      //     this.f.name.value, 
      //     this.f.email.value, 
      //     payments
      //   ],
      //   // chain: this.w3s.chainId
      // })

      
      const {hash} = await writeContract({
        abi: P2pABI,
        address: environment.p2pContractAddress[this.w3s.chainId!] as `0x${string}`,
        functionName: 'register',
        account: account?.address,
        args: [
          this.f.name.value, 
          this.f.email.value, 
          payments
        ],
        // chain: this.w3s.chainId
      })

      await waitForTransaction( 
        { hash: hash }
      )

      await delay(3000);
      
      this.spinner.hide()
      this.toastService.show('Registered', 'Registration Completed successfully!')
      this.router.navigate(['/sell']);
    } catch (error) {
      this.spinner.hide()
      this.toastService.error('Failed', 'Registration Failed!')
      
    }
  }

  
}


