//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract P2P is Ownable {
	using SafeERC20 for IERC20;
	uint256 orderId;
	uint256 listId;

	struct paymentOption {
		string appName;
		string paymentInstruction;
	}

	struct Seller {
		address payable seller;
		string name;
		string email;
	}

	struct buyRequest {
		address payable buyer;
		address payable seller;
		address tokenAddress;
		bool fulfilled;
		bool paid;
		bool cancelled;
		bool report;
		uint256 amount;
		uint256 price;
		uint256 priceCurrency;
		uint256 orderId;
		string buyerName;
		string payOption;
	}

	struct SellerList {
		address payable seller;
		address tokenAddress;
		uint256 listId;
		uint256 amount;
		uint256 locked;
		uint256 price;
		uint256 priceCurrency;
		uint256 time;
	}

	mapping(address => Seller) public sellers;

	mapping(address => paymentOption[]) public paymentsOfSeller;

	

	function register(string memory _name, string memory _email, paymentOption[] memory _payments) public {
		require(sellers[msg.sender].seller == address(0), "AlreadyRegistered");
		sellers[msg.sender] = Seller(payable(msg.sender), _name, _email);
		for (uint8 i = 0; i < _payments.length; i++) {
			paymentsOfSeller[msg.sender].push(_payments[i]);
		}
	}


	function isRegistered(address user) public view returns (bool registered) {
		registered = sellers[user].seller != address(0);
	}
}
