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
	// mapping(address => mapping(address => SellerList[])) public tokenSellerList;

	mapping(address => mapping(address => mapping(uint => SellerList))) public tokenSellerList;

	mapping(address => paymentOption[]) public paymentsOfSeller;
	mapping(address => buyRequest[]) public buyRequests;
	mapping(uint256 => buyRequest) public orders;
	mapping(address => buyRequest[]) public userRequests;

	SellerList[] public listings;

	mapping(uint => uint[]) public listingsByCurrency; // currency - listingid[]

	event BuyOrderSubmitted(uint indexed listingId, uint indexed orderId, address buyer);
	event SellListed(uint indexed listingId, address indexed tokenAddress, uint amount, uint price, uint priceCurrency);

	function register(string memory _name, string memory _email, paymentOption[] memory _payments) public {
		require(sellers[msg.sender].seller == address(0), "AlreadyRegistered");
		sellers[msg.sender] = Seller(payable(msg.sender), _name, _email);
		for (uint8 i = 0; i < _payments.length; i++) {
			paymentsOfSeller[msg.sender].push(_payments[i]);
		}
	}

	function sellToken(address tokenAddress, uint256 amount, uint256 price, uint currency) public payable {
		address sender = msg.sender;
		if (tokenAddress == address(0)) {
			require(msg.value == amount, "You must send the exact amount");
		} else {
			IERC20 token = IERC20(tokenAddress);
			token.safeTransferFrom(sender, address(this), amount); // , "Token transfer failed");
		}

		if (tokenSellerList[sender][tokenAddress][currency].seller != sender) {
			tokenSellerList[sender][tokenAddress][currency] = SellerList(
				payable(sender),
				tokenAddress,
				listId,
				amount,
				0,
				price,
				currency,
				block.timestamp
			);
			listings.push(tokenSellerList[msg.sender][tokenAddress][currency]);

			listingsByCurrency[currency].push(listId);

			emit SellListed(listId, tokenAddress, amount, price, currency);

			listId++;
		} else {
			tokenSellerList[sender][tokenAddress][currency].amount += amount;
			tokenSellerList[sender][tokenAddress][currency].price = price;
			tokenSellerList[sender][tokenAddress][currency].time = block.timestamp;
			listings[tokenSellerList[sender][tokenAddress][currency].listId] = tokenSellerList[sender][tokenAddress][
				currency
			];
		}
	}

	function buyToken(uint256 id, uint256 amount, string memory _name, string memory payOption) public {
		require(listings[id].amount >= amount, "Not enough tokens");
		SellerList memory listing = tokenSellerList[listings[id].seller][listings[id].tokenAddress][
			listings[id].priceCurrency
		];
		require(listing.seller != address(0), "Seller not found");
		buyRequests[listing.seller].push(
			buyRequest(
				payable(msg.sender),
				listings[id].seller,
				listings[id].tokenAddress,
				false,
				false,
				false,
				false,
				amount,
				listing.price,
				listing.priceCurrency,
				orderId,
				_name,
				payOption
			)
		);
		orders[orderId] = buyRequests[listing.seller][buyRequests[listing.seller].length - 1];
		userRequests[msg.sender].push(buyRequests[listing.seller][buyRequests[listing.seller].length - 1]);
		tokenSellerList[listing.seller][listing.tokenAddress][listing.priceCurrency].amount -= amount;
		tokenSellerList[listing.seller][listing.tokenAddress][listing.priceCurrency].locked += amount;

		listings[id] = tokenSellerList[listing.seller][listing.tokenAddress][listing.priceCurrency];

		emit BuyOrderSubmitted(id, orderId, msg.sender);

		orderId++;
	}

	function release(uint256 id) public {
		buyRequest memory order = orders[id];
		require(order.seller == msg.sender, "You are not the seller");
		require(order.fulfilled == false, "Order Already fulfilled");
		require(order.paid == true, "Order Not paid yet");

		tokenSellerList[order.seller][order.tokenAddress][order.priceCurrency].locked -= order.amount;
		listings[tokenSellerList[order.seller][order.tokenAddress][order.priceCurrency].listId] = tokenSellerList[
			order.seller
		][order.tokenAddress][order.priceCurrency];

		orders[id].fulfilled = true;

		address tokenAddress = order.tokenAddress;
		if (tokenAddress == address(0)) {
			// This is the current recommended method to use.
			(bool sent, bytes memory data) = order.buyer.call{value: order.amount}("");
			require(sent, "SendAmountFailed");
		} else {
			IERC20 token = IERC20(order.tokenAddress);
			token.safeTransfer(order.buyer, order.amount); // "SendAmountFailed");
		}
	}

	function markAsPaid(uint256 id) public {
		buyRequest storage order = orders[id];
		require(order.buyer == msg.sender, "You are not the buyer");
		require(order.fulfilled == false, "Order Already fulfilled");

		orders[id].paid = true;
	}

	function sellerPayments(address seller) public view returns (paymentOption[] memory) {
		return paymentsOfSeller[seller];
	}

	function listingCount() public view returns (uint) {
		return listings.length;
	}

	function allListings() public view returns (SellerList[] memory) {
		return listings;
	}

	function allListings(uint start, uint offset) public view returns (SellerList[] memory) {
		uint256 size = listings.length;
		if (start >= size) {
			start = 0;
		}
		if (start + offset > size) {
			offset = size - start;
		}
		SellerList[] memory list = new SellerList[](offset);

		for (uint256 i = start; i < start + offset; i++) {
			list[i - start] = listings[i];
		}
		return list;
	}

	function currencyListingCount(uint currency) public view returns (uint) {
		return listingsByCurrency[currency].length;
	}

	function currencyListings(uint currency, uint start, uint offset) public view returns (uint[] memory) {
		uint256 size = listingsByCurrency[currency].length;
		if (start >= size) {
			start = 0;
		}
		if (start + offset > size) {
			offset = size - start;
		}
		uint[] memory list = new uint[](offset);

		for (uint256 i = start; i < start + offset; i++) {
			list[i - start] = listingsByCurrency[currency][i];
		}
		return list;
	}

	function listingAt(uint i) public view returns (SellerList memory listing) {
		listing = listings[i];
	}

	function getRequests(address seller) public view returns (buyRequest[] memory) {
		return buyRequests[seller];
	}

	function getOrder(uint orderId) public view returns (buyRequest memory) {
		return orders[orderId];
	}

	function isRegistered(address user) public view returns (bool registered) {
		registered = sellers[user].seller != address(0);
	}
}
