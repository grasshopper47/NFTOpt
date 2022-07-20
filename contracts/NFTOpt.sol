// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

/// @dev OpenZeppelin's interface of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./InterfaceDetector.sol";

contract NFTOpt {

    using InterfaceDetector for address;

    /// @dev -- SCAFFOLDING ---------------------------

    enum OptionState  { OPEN, CANCELED, EXERCISED }
    enum OptionFlavor { EUROPEAN, AMERICAN }

    struct Request
    {
        uint256      premium;
        uint256      strikePrice;
        uint256      nftId;
        uint256      startDate;
        address      nftContract;
        OptionFlavor flavor;
        uint32       interval;
        address      buyer;
    }

    struct Option
    {
        uint256     requestID;
        address     seller;
        OptionState state;
    }

    /// @dev -- STACK ---------------------------------
    string constant _msg_OnlyBuyer = "Only Buyer can call this method";

    uint256[]                   private requestDeletedIDs;
    uint256                     public requestID;
    mapping(uint256 => Request) public requests;

    uint256                     public optionID;
    mapping(uint256 => Option)  public options;

    /// @dev -- EVENTS --------------------------------

    event Published (uint256);
    event Exercised (uint256);
    event Opened    (uint256);
    event Canceled  (uint256);
    event Withdrawn (uint256);

    /// @dev -- METHODS -------------------------------

    /// @custom:author PeterA
    /// @notice Publishes a request for an option in the marketplace
    /// @param _nftContract: address of NFT contract of token
    /// @param _nftTokenID: ID of NFT token from specified contract
    /// @param _strikePrice: floor price of NFT to insure against
    /// @param _interval: time the option is to be available for, in seconds
    /// @param _flavor: EUROPEAN or AMERICAN
    function publishRequest
    (
        address      _nftContract
    ,   uint256      _nftTokenID
    ,   uint256      _strikePrice
    ,   uint32       _interval
    ,   OptionFlavor _flavor
    )
    external
    payable
    {
        if (_nftTokenID == 0)                               revert INVALID_TOKEN_ID(_nftTokenID);
        if (!_nftContract.implements_ERC721_ownerOf())      revert MISSING_IMPLEMENTATION("ownerOf", _nftContract);
        if (!_nftContract.implements_ERC721_getApproved())  revert MISSING_IMPLEMENTATION("getApproved", _nftContract);
        if (!_nftContract.implements_ERC721_transferFrom()) revert MISSING_IMPLEMENTATION("transferFrom", _nftContract);

        /// @dev Check for NFT ownership
        IERC721 _instance = IERC721(_nftContract);
        if (_instance.ownerOf(_nftTokenID) != msg.sender) revert NFT_NOT_OWNER(msg.sender);

        if (msg.value == 0)                            revert INVALID_PREMIUM_AMOUNT(0);
        if (_strikePrice == 0)                         revert INVALID_STRIKE_PRICE_AMOUNT(0);
        if (msg.value >= _strikePrice)                 revert INVALID_PREMIUM_AMOUNT(_strikePrice);
        if (_interval < 86400 || _interval > 2592000 ) revert INVALID_EXPIRATION_INTERVAL(_interval); // [1, 30] days, in seconds

        /// @dev Optimize for gas by caching array length
        uint256 length_ = requestDeletedIDs.length;

        /// @dev Optimize for gas by caching id
        uint256 requestID_ = requestID;

        /// @dev Reuse first available slot in map for requests
        if (length_ != 0)
        {
            unchecked { requestID_ = requestDeletedIDs[length_ - 1]; }
            requestDeletedIDs.pop();
        }

        /// @dev Update storage
        Request storage request = requests[requestID_];

        request.buyer       = msg.sender;
        request.nftContract = _nftContract;
        request.nftId       = _nftTokenID;
        request.interval    = _interval;
        request.premium     = msg.value;
        request.strikePrice = _strikePrice;
        request.flavor      = _flavor;

        emit Published(requestID_);

        /// @dev Update counter when needed; WRT overflow: only happens for the very last item, so acceptable
        if (length_ == 0) { unchecked { requestID = ++requestID_; } }
    }

    /// @custom:author GregVanDell and LuisImagiire
    /// @notice Removes a published option request from the marketplace
    /// @param _requestID: id of the option request to remove
    function withdrawRequest(uint256 _requestID)
    external
    {
        address buyer_ = requests[_requestID].buyer;
        if (buyer_ == address(0)) revert INVALID_ID(_requestID);
        if (buyer_ != msg.sender) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        if (requests[_requestID].startDate != 0) revert INVALID_OPTION_STATE(OptionState.OPEN, OptionState.OPEN);

        /// @dev Update storage by marking as "invalid"
        requests[_requestID].buyer = address(0);
        requestDeletedIDs.push(_requestID);

        emit Withdrawn(_requestID);

        /// @dev Transfer premium back to buyer
        (bool success,) = buyer_.call{ value : requests[_requestID].premium }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author StefanaM
    /// @notice Create (enables) an option from a published request from the marketplace
    ///         by sending strike price to contract and premium to msg.sender
    /// @param _requestID: id of the option request from which to create the option
    function createOption(uint256 _requestID)
    external
    payable
    {
        address buyer_ = requests[_requestID].buyer;
        if (buyer_ == address(0)) revert INVALID_ID(_requestID);
        if (buyer_ == msg.sender) revert BUYER_MUST_DIFFER_FROM_SELLER();

        uint strikePrice_ = requests[_requestID].strikePrice;
        if (msg.value != strikePrice_) revert INVALID_STRIKE_PRICE_AMOUNT(strikePrice_);

        /// @dev TODO: perhaps check that interval + block.timestamp don't overflow
        // if (block.timestamp + requests[_requestID].interval < block.timestamp) revert UNSIGNED_INTEGER_OVERFLOW();

        /// @dev Update storage -- requests
        requests[_requestID].startDate = block.timestamp;

        /// @dev Optimize for gas by caching id
        uint256 optionID_ = optionID;

        /// @dev Update storage -- options
        Option storage option_ = options[optionID_];

        option_.requestID = _requestID;
        option_.seller    = msg.sender;
        option_.state     = OptionState.OPEN;

        emit Opened(optionID_);

        /// @dev overflow only happens for the very last item, so acceptable
        unchecked { optionID = ++optionID_; }

        /// @dev Transfer premium to caller
        (bool success,) = msg.sender.call{ value : requests[_requestID].premium }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author ShababAli
    /// @notice Cancels an active option and returns strike price to seller
    /// @param _optionID: id of the option to cancel
    function cancelOption(uint256 _optionID)
    external
    {
        address seller_ = options[_optionID].seller;
        if (seller_ == address(0)) revert INVALID_ID(_optionID);

        OptionState state_ = options[_optionID].state;
        if (state_ != OptionState.OPEN) revert INVALID_OPTION_STATE(state_, OptionState.OPEN);

        uint256 requestID_ = options[_optionID].requestID;
        address buyer_     = requests[requestID_].buyer;

        /// @dev Restrict calling rights to buyer (permitted anytime) or seller (restricted)
        bool isSeller = msg.sender == seller_;
        if (!isSeller && msg.sender != buyer_) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        /// @dev Restrict calling rights of seller: permit only after expiration
        uint256 expirationDate_;
        unchecked { expirationDate_ = requests[requestID_].startDate + requests[requestID_].interval; }
        if (expirationDate_ >= block.timestamp && buyer_ != msg.sender) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        /// @dev Update storage
        options[_optionID].state = OptionState.CANCELED;

        emit Canceled(_optionID);

        (bool success,) = seller_.call{ value : requests[requestID_].strikePrice }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author LuisImagiire
    /// @notice Exercises an active option when msg.sender is allowed to execute
    /// @param _optionID: id of the option to exercise
    function exerciseOption(uint256 _optionID)
    external
    {
        if (options[_optionID].seller == address(0)) revert INVALID_ID(_optionID);

        uint256 requestID_ = options[_optionID].requestID;
        if (requests[requestID_].buyer != msg.sender) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        OptionState state_ = options[_optionID].state;
        if (state_ != OptionState.OPEN) revert INVALID_OPTION_STATE(state_, OptionState.OPEN);

        /// @dev Check for NFT access and ownership
        uint256 nftId_ = requests[requestID_].nftId;
        IERC721 nftContract = IERC721(requests[requestID_].nftContract);
        if (nftContract.ownerOf(nftId_) != msg.sender)        revert NFT_NOT_OWNER(msg.sender);
        if (nftContract.getApproved(nftId_) != address(this)) revert NOT_APPROVED_TO_TRANSFER_NFT(address(nftContract), nftId_);

        /// @dev Check that option can be exercised
        uint256 expirationDate_;
        unchecked { expirationDate_ = requests[requestID_].startDate + requests[requestID_].interval; }

        bool isExpired =
        block.timestamp > expirationDate_
        || (
            requests[requestID_].flavor == OptionFlavor.EUROPEAN &&
            (expirationDate_ - 1 days) > block.timestamp
        );

        if (isExpired) revert EXERCISE_WINDOW_IS_CLOSED(expirationDate_);

        /// @dev Transfer NFT to caller
        nftContract.transferFrom
        (
            msg.sender
        ,   options[_optionID].seller
        ,   nftId_
        );

        /// @dev Update storage
        options[_optionID].state = OptionState.EXERCISED;

        emit Exercised(_optionID);

        (bool success,) = msg.sender.call{ value : requests[requestID_].strikePrice }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @dev -- CUSTOM ERRORS -------------------------

    /// @dev -- Option Property
    error INVALID_ID(uint256 id);
    error INVALID_TOKEN_ID(uint256 id);
    error INVALID_PREMIUM_AMOUNT(uint256 amount);
    error INVALID_STRIKE_PRICE_AMOUNT(uint256 amount);
    error INVALID_EXPIRATION_INTERVAL(uint32 interval);
    error INVALID_OPTION_STATE(OptionState currentState, OptionState neededState);

    /// @dev -- Account
    error NOT_AUTHORIZED(string reason);
    error NOT_APPROVED_TO_TRANSFER_NFT(address nftContract, uint256 nftId);
    error NFT_NOT_OWNER(address presumedOwner);

    /// @dev -- Option Action
    error BUYER_MUST_DIFFER_FROM_SELLER();
    error EXERCISE_WINDOW_IS_CLOSED(uint256 expirationTimestamp);

    /// @dev -- General
    error FUNDS_TRANSFER_FAILED();
    error MISSING_IMPLEMENTATION(string methodName, address contractAddress);
    error UNSIGNED_INTEGER_OVERFLOW();
}
