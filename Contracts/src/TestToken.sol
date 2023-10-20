// SPDX-License-Identifier: AGPL-1.0
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
	constructor(string memory name, string memory symbol) ERC20(name, symbol) {
		_mint(msg.sender, 100000000 * 10 ** 18);
		_mint(0xa55980aB0C3aeFB871af97462CdbBECB41aEed09, 100000 * 10 ** 18);
		_mint(0x4ABda0097D7545dE58608F7E36e0C1cac68b4943, 100000 * 10 ** 18);
		_mint(0x5A2770f69AF30370D60B416ad31FF538839112F6, 100000 * 10 ** 18);
		_mint(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 100000 * 10 ** 18);
	}
}
