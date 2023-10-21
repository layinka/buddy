import { ethers } from "ethers";

export default async function parseEventLogs(provider: any,transactionHash: string, abi: any[], eventName: string  ){
    
      try {
        const receipt = await provider.getTransactionReceipt(transactionHash);

        if (!receipt) {
          console.error('PARSEEVENTLOG: Transaction receipt not found');
          return undefined;
        }

        const logs = receipt.logs;
        // console.log('logs', logs);

        
        
        let iface = new ethers.utils.Interface(abi);
        const eventLogs = logs
          .map((log: any) => {
            try{
              const event = iface.parseLog(log);
            //   console.log('event', event);
              if (event && event.name === eventName) {
                return event;
              }
              
            }catch(err){
            //   console.error('Error Parse::: ', err)
            }
            return undefined
          })
          .filter((log: any) => log !== undefined)
        

        // console.log('Event Logs:', eventLogs);
        return eventLogs;
      } catch (error) {
        // console.error('Error: ', error);
      }

      return undefined;
}