import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { expand, lastValueFrom, Observable, shareReplay, switchMap, timer } from 'rxjs';
import { ecsign, toRpcSig, keccakFromString, BN, keccak256 } from 'ethereumjs-util';
import { NextIdProfile } from '../models';
import { signMessage } from '@wagmi/core';
import EthCrypto from 'eth-crypto';
import { getEthersSigner } from '../utils/ethers-wagmi-adapter';


const { randomBytes } = require('crypto')
import secp256k1 from 'secp256k1';
import { Web3Service } from './web3.service';

async function personalSign(message: Buffer, privateKey: Buffer): Promise<Buffer> {
  const messageHash = keccakFromString(`\x19Ethereum Signed Message:\n${message.length}${message}`, 256)
  const signature = ecsign(messageHash, privateKey)
  return Buffer.from(toRpcSig(signature.v, signature.r, signature.s).slice(2), 'hex')
}

// Helper for cache in Rxjs
export function dataCache(validForMs: number = 3000000) {
  return function<T>(source: Observable<T>) {
    return source.pipe(
      expand(() => timer(validForMs).pipe(switchMap(() => source))),
      shareReplay(1)
    );
  }
}


const nextIdUrl = 'https://api.web3.bio/profile'
@Injectable({
  providedIn: 'root'
})
export class NextIdService {

  private cache$: Observable<NextIdProfile[]> | undefined = undefined;

  constructor(private http: HttpClient, private w3s: Web3Service) { 
    // // generate privKey
    // let privKey
    // do {
    //   privKey = randomBytes(32)
    // } while (!secp256k1.privateKeyVerify(privKey))
    // console.log('privKey',privKey)
    // const secretKey = Buffer.from(privKey, 'hex');

    // console.log('secretKey',secretKey)

    this.w3s.account$.subscribe((account)=>{
      console.log('Account switched')
      this.cache$=undefined
    })
  }

  // getProfiles(identity: string) {
  //   this.cache$ ??= this.http.get<NextIdProfile[]>(`${nextIdUrl}/${identity}`).pipe(dataCache(100_000));
  //   return this.cache$;
  // }

  getProfiles(identity: string) {
    return this.http.get<NextIdProfile[]>(`${nextIdUrl}/${identity}`)
  }


  async getInitialPayloadForTwitter(twitterHandle: string){
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


    const request = {
      'action':'create',
      'platform':'twitter',
      'identity': twitterHandle,
      'public_key': pubKey.toString()
    }

    console.log('pub key:', request)

    const response =  await lastValueFrom(this.http.post< {
      post_content: {
          default: string;
          en_US: string;
          zh_CN: string;
      };
      sign_payload: string;
      uuid: string;
      created_at: string;
    }>(`https://proof-service.next.id/v1/proof/payload`, request))
    
    // this message come from the return attribute "sign_payload" of everytime calling API: v1/proof/payload
    const message = Buffer.from( response.sign_payload);//  Buffer.from('{\"action\":\"create\",\"created_at\":\"1656843378\",\"identity\":\"your_twitter_handle\",\"platform\":\"twitter\",\"prev\":\"KNyNFtvhlRVJh/oU6RryK2n+C2dja9aLQPjlv5VHMsQErZROojEmMAgmeEQVC094EOuHIYcv3lCYXf8d3zqDCQE=\",\"uuid\":\"353449e6-3a6f-4ac8-ae65-ba14bf466baf\"}', 'utf8');
    // ATTENTION! RUN THIS LOCALLY! NEVER SHARE YOUR PRIVATE KEY WITH ANY OTHERS OR PUBLIC!
    // replace XXX with your own Private Key for generating a signature
    // const secretKey = Buffer.from('XXX', 'hex');
    const secretKey = Buffer.from(privKey, 'hex');
    const signature = await personalSign(message, secretKey);

    console.log(`Signature: 0x${signature.toString('hex')}`);
    // For demo ONLY
    // Signature: 0xf72fe6b00be411bd70ffe1b9bf322f18529ea10e9559dd26ba10387544849fc86d712709dfb709efc3dcc0a01b6f6b9ca98bd48fe780d58921f4926c6f2c0b871b

    console.log(`Signature(base64): ${signature.toString('base64')}`);

    this.cache$ =undefined //refresh
  }


//   ### Ethereum Binding

// In this scenario, User requests Ethereum Binding on Application with identity `0xWALLET_ADDRESS`, `ProofService` will return the Avatar`sign_payload` based on the Application’s `POST /v1/proof/payload`. 

// Then, application requests user’s Avatar Private Key to generate a signature based on Avatar`sign_payload`. After that, application requests user’s Wallet Private Key to generate a signature based on Wallet`sign_payload`.

// After `ProofService`validate with `uuid` and `created_at` from `sign_payload` , then verify the Avatar and Wallet Signature. After all it will return the successful binding notification back to Application and User.
  async bindEthereum(address: string){
    // // generate privKey
    let avatarPrivKey
    do {
      avatarPrivKey = randomBytes(32)
    } while (!secp256k1.privateKeyVerify(avatarPrivKey))   
    
    // get the public key in a compressed format
    // const avatarPubKey = secp256k1.publicKeyCreate(avatarPrivKey)//
    const avatarPubKey = '0x'+ EthCrypto.publicKey.compress(EthCrypto.publicKeyByPrivateKey( avatarPrivKey.toString('hex')) );
    let link = {
      'action':'create',
      'platform':'ethereum',
      'identity': address,
      'public_key': avatarPubKey , //avatarPubKey.toString()
    }
    // console.log('link request:', link)

    const response =  await lastValueFrom(this.http.post< {
      post_content: {
          default: string;
          en_US: string;
          zh_CN: string;
      };
      sign_payload: string;
      uuid: string;
      created_at: string;
    }>(`https://proof-service.next.id/v1/proof/payload`, link))
    
    // this message come from the return attribute "sign_payload" of everytime calling API: v1/proof/payload
    const message = Buffer.from( response.sign_payload);//  
    const avatarSignature = await personalSign(message, avatarPrivKey);
    let ethSignature = await signMessage({
      message: response.sign_payload, // `\x19Ethereum Signed Message:\n${message.length}${message}`, // "\x19Ethereum Signed Message:\n" + message.length + message,
    })

    

    // console.log('ethSignature):',  ethSignature)
    // console.log('btoa( ethSignature):', btoa( ethSignature))
    // console.log('base64ed:', Buffer.from(ethSignature, 'base64').toString('base64'))
    // console.log('hexed:', Buffer.from(ethSignature, 'hex').toString('base64'))

    // Encode the signature to base64
    const signatureBuffer = Buffer.from(ethSignature.substring(2), 'hex'); // Remove '0x' prefix
    const signatureBase64 = signatureBuffer.toString('base64');
    // console.log('signatureBase64:', signatureBase64)
    //Buffer.from(str, 'base64') andbuf.toString('base64')

    const verifyRequest={
      action: 'create',
      platform: 'ethereum',
      identity: address,
      public_key: avatarPubKey,
      uuid:response.uuid,
      created_at: response.created_at,
      extra :{
        signature : avatarSignature.toString('base64'),
        wallet_signature : signatureBase64 , /// btoa( ethSignature)
      }
    }


    // console.log('verifyRequest:', verifyRequest)

    let verifyResponse=undefined
    try{
      verifyResponse =  await lastValueFrom(this.http.post(`https://proof-service.next.id/v1/proof`, verifyRequest))
    }catch(err){
      console.error('Error verifying :', err)
    }

    this.cache$=undefined
    return verifyResponse

    
  }



}
