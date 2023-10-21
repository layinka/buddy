import { zeroAddress } from "viem"

export const SupportedCoins: {
    [chainId: number]: {
        address: string,
        symbol?: string,
        icon?: string
    }[]      
  } = {
    31337:[
      {
        "symbol": 'MNT',
        address: zeroAddress
      },
      {
        "symbol": "tzP2p",
        "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
      }
    ],
    5001: [ // Mantle
      {
        "symbol": 'MNT',
        address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000' //zeroAddress
      },
      {
        "symbol": "tzP2p",
        "address": "0xBF718fD6432457AEa5C0812D96b234a9f199e647"
      }
    ],
    534351: [ // Scroll Sepolia
      {
        "symbol": 'ETH',
        address: zeroAddress
      },
      {
        "symbol": "tzP2p",
        "address": "0xE3cB58467250bd4178d737A87B87dc7AE00Dad62"
      }
    ],
    1337: [
        {
            "symbol": "OKB",
            "address": zeroAddress
        },
        {
            "symbol": "mBTC",
            "address": "0x784519222BD824a09Af76E8e0030B7eDf8B71A19"
        },
        {
            "symbol": "mNGNT",
            "address": "0x91E1683e01eE48eCB484B624f347E73d9aBD1Cd0"
        },
        {
            "symbol": "mUSDT",
            "address": "0x8d89810549F665A2671AdAbbcA19c8778FfA4A3F"
        },
        {
            "symbol": "mUSDC",
            "address": "0x167EA7e57C811d867E9e006dAbb08ebb74c217F2"
        }
    ],

    9000: [
        {
            "symbol": "EVMOS",
            "address": zeroAddress
        },
        
        {
            "symbol": "mTEVMOS",
            "address": "0xCbBAFCE8575ed84ec5219e72E48Eb6a7ad2234c5"
          },
          {
            "symbol": "zP2P",
            "address": "0x15a9A0189b5d0259879764a18E166869B76aeC93"
          },
          {
            "symbol": "mUSDT",
            "address": "0xb40E51f657EFa934D43A05cd4cC9f0a11faA05d0"
          },
          {
            "symbol": "mUSDC",
            "address": "0x932102Bc1916f9d74E271dB6685aba0276f112F2"
          }
    ],

    250: [
      {
          "symbol": "FTM",
          "address": zeroAddress
      },
      
      {
          "symbol": "tzP2P",
          "address": "0xB19AAfE9aF7Eb36EE4AA32F6b73627D15164C8eB"
        },
        {
          "symbol": "USDC",
          "address": "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"
        },
        {
          "symbol": "FUSD",
          "address": "0xAd84341756Bf337f5a0164515b1f6F993D194E1f"
          }
    ],
    4002: [
      {
          "symbol": "FTM",
          "address": zeroAddress
      },
      
      {
          "symbol": "tzP2P",
          "address": "0xcf164Ad491B40d8248098471fD90aCB91b05063e"
        },
        {
          "symbol": "USDC",
          "address": "0x8d22Ee5dAF1C81bF5953D5f4A093E1847f708AdD"
        },
        // {
        //   "symbol": "USDT",
        //   "address": "0xb40E51f657EFa934D43A05cd4cC9f0a11faA05d0"
        // }
    ],
  }