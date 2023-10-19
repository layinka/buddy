// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { p2pAddresses } from "./p2p-addresses";


export const environment = {
  production: false,
  walletConnectProjectId: "4deab0af02ccba3c9813a2bb585e4a07",
  eventManagerAddress:  "0x2B0d36FACD61B71CC05ab8F3D2355ec3631C0dd5",
  eventHelperAddress: "0xb2fd4d66a204676DC71d49819CE41480780Bf195",
  // apiUrl: 'https://localhost:3123/',
  apiUrl: 'https://test-tb.heirtrust.com/',
  faucetAddress: "0x6A75daCCA1fAeFec99F20f88866b4a3F6cD61467", // "0x59b670e9fA9D0A427751Af201D676719a970857b",
  p2pContractAddress: p2pAddresses
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
