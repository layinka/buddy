import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getWalletClient, getPublicClient, fetchTransaction, writeContract, waitForTransaction, signMessage } from '@wagmi/core';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { combineLatest } from 'rxjs';

import { AppToastService } from 'src/app/services/app-toast.service';
import { P2pService } from 'src/app/services/p2p.service';
import { Web3Service } from 'src/app/services/web3.service';
import { delay } from 'src/app/utils/delay';
import { environment } from 'src/environments/environment';
import { zeroAddress, parseAbiItem } from 'viem';
import { NextIdProfile } from '../models';
import { NextIdService } from '../services/next-id.service';
import { getEthersSigner } from '../utils/ethers-wagmi-adapter';
import secp256k1 from 'secp256k1';
import EthCrypto from 'eth-crypto';

const P2pABI = require( "../../assets/abis/p2p.json");

const { randomBytes } = require('crypto')


function test(){
  // or require('secp256k1/elliptic')
//   if you want to use pure js implementation in node

// generate message to sign
// message should have 32-byte length, if you have some other length you can hash message
// for example `msg = sha256(rawMessage)`
const msg = randomBytes(32)

// generate privKey
let privKey
do {
  privKey = randomBytes(32)
} while (!secp256k1.privateKeyVerify(privKey))

// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey)

// sign the message
const sigObj = secp256k1.ecdsaSign(msg, privKey)

// verify the signature
console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey))
}



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

  profiles?: NextIdProfile[];
  unsubscribeChain: any;

  constructor(private formBuilder: FormBuilder,
    public w3s: Web3Service,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastService: AppToastService,
    private p2p: P2pService,
    private nextIdService: NextIdService) {
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

    this.unsubscribeChain =  combineLatest([ this.w3s.chainId$, this.w3s.account$]).subscribe(async ([chainId, account])=>{
      if(!(chainId && account)) return

      // let avatarPrivKey
      // do {
      //   avatarPrivKey = randomBytes(32)
      // } while (!secp256k1.privateKeyVerify(avatarPrivKey))

      // console.log('priv key1:', avatarPrivKey.toString('hex') , ', length: ', avatarPrivKey.toString('hex').length, ' ,  len2: ', '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07'.length)
      // console.log('priv key:', Buffer.from(avatarPrivKey, 'hex').toString())

      // const publicKey = EthCrypto.publicKeyByPrivateKey( '0x' + avatarPrivKey.toString('hex')
      //   //'0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07'
      // );

      
      // console.log('pub key:', publicKey)

      // // const testPubKey = secp256k1.publicKeyCreate( avatarPrivKey )
      // // Buffer.from(testPubKey).toString('hex')
      // // console.log('pub key:', testPubKey)

      
      this.p2pContract = await this.p2p.getP2PContract()      
      this.alreadyRegistered = await this.p2pContract.read.isRegistered([this.w3s.account])

      this.nextIdService.getProfiles(this.w3s.account!).subscribe((profs)=>{
        this.profiles= profs
      }) 
      
    })
    
  }

  
  ngOnDestroy(){
    this.unsubscribeChain?.unsubscribe();
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

  async bindEthereum() {
    await this.nextIdService.bindEthereum(this.w3s.account!)
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


  async registerNextId(){
    // or require('secp256k1/elliptic')
    //   if you want to use pure js implementation in node

    // generate message to sign
    // message should have 32-byte length, if you have some other length you can hash message
    // for example `msg = sha256(rawMessage)`
    const msg = randomBytes(32)

    // generate privKey
    let privKey
    let pubKey
    do {
      privKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(privKey))

    // get the public key in a compressed format
    pubKey = secp256k1.publicKeyCreate(privKey)

    // sign the message
    const sigObj = secp256k1.ecdsaSign(msg, privKey)

    // verify the signature
    console.log(secp256k1.ecdsaVerify(sigObj.signature, msg, pubKey))
  }

  
}


