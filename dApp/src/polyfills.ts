/***************************************************************************************************
 * APPLICATION IMPORTS
 */
import { Buffer } from 'buffer';
// import { SignalConstants} from 'os'
// import * as osConstants from 'constants';

(window as any)['global'] = window;

(window as any).process = {
    env: { DEBUG: undefined },
};


// @ts-ignore
window.Buffer = Buffer;

// os.constants = osConstants

