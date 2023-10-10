import { Injectable } from '@angular/core';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/html'
import { configureChains, createConfig, getAccount, getNetwork, watchAccount, watchNetwork } from '@wagmi/core'
import { arbitrum, hardhat, mainnet, polygon, scrollSepolia, scrollTestnet, mantle, mantleTestnet } from '@wagmi/core/chains'
import { BehaviorSubject } from 'rxjs';

const projectId = '2539776ca1c175425265b3c233b9ed66'

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  chains = [scrollSepolia, scrollTestnet,mantle, mantleTestnet, polygon, hardhat]

  web3modal: Web3Modal|undefined;
  ethereumClient?: EthereumClient;

  private _chainId$ = new BehaviorSubject<number |undefined>(undefined);

  public chainId$ = this._chainId$.asObservable();

  public get chainId(){
    return this._chainId$.value;
  }

  private _account$ = new BehaviorSubject<string |undefined>(undefined);

  public account$ = this._account$.asObservable();

  public get account(){
    return this._account$.value;
  }

  unWatchNetwork?: any;
  unWatchAccount?: any;
  
  constructor() {
    const { publicClient } = configureChains(this.chains, [w3mProvider({ projectId })])

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains: this.chains }),
      publicClient
    })
    this.ethereumClient = new EthereumClient(wagmiConfig, this.chains)
    this.web3modal = new Web3Modal({ 
      projectId,
      enableNetworkView: true,
      themeMode: 'light',
      // enableExplorer: 
     }, this.ethereumClient)

    setTimeout(()=>{
      const {chain, chains} = getNetwork()
      if(chain && !chain.unsupported){
        this._chainId$.next(chain.id)
      }

      const {address, isConnected} = getAccount();
      if(isConnected){
        this._account$.next(address)
      }

      this.unWatchNetwork = watchNetwork((network)=>{
        if(network.chain && !network.chain.unsupported){
          this._chainId$.next(network.chain?.id)
        }else{
          this._chainId$.next(undefined)
        }
      });

      this.unWatchAccount = watchAccount((account)=>{
        if(account && account.isConnected){
          this._account$.next(account.address);
        }else{
          this._account$.next(undefined)
        }
      })
    }, 200)
  }



}
