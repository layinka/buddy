export const PaymentMethods = [

]

export const FiatCurrencies: {
    [currencyCode: string]: {
        name: string,
        id:  number,
        code?: string,

        icon?: string
    }     
  } = {
    'NGN': {
        name: 'Nigerian Naira',
        code: 'NGN',
        id: 0
    },
    'USD': {
        name: 'US Dollar',
        code: 'USD',
        id: 1
    }
  }