// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

/// @dev OpenZeppelin's interface of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./InterfaceDetector.sol";

contract NFTOpt {

    using InterfaceDetector for address;

    /// @dev -- SCAFFOLDING ---------------------------
    enum OptionState  { PUBLISHED, WITHDRAWN, OPEN, CANCELED, EXERCISED }
    enum OptionFlavor { EUROPEAN, AMERICAN }

    struct Request
    {
        uint256         premium;
        uint256         strikePrice;
        uint256         nftId;
        address         nftContract;
        OptionFlavor    flavor;
        uint32          interval;
        address payable buyer;
    }

    struct Option
    {
        Request         request;

        address payable seller;
        OptionState     state;
        uint256         startDate;
    }

    /// @dev -- STACK ---------------------------------
    string constant             private _msg_OnlyBuyerCanCall         = "Only Buyer can call this method";
    string constant             private _msg_OnlyBuyerOrSellerCanCall = "Only Buyer or Seller can call this method";

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
    function getBalance() public view returns (uint256)
    {
        return address(this).balance;
    }

    /// @custom:author PeterA
    /// @notice Checks if the supplied prototype has valid field values
    /// @param _request: the Option instance to check
    function _exists(Request memory _request)
    private pure
    returns (bool)
    {
        return _request.buyer       != address(0) &&
               _request.nftContract != address(0) &&
               _request.nftId       != 0          &&
               _request.interval    != 0          &&
               _request.premium     != 0          &&
               _request.strikePrice != 0;
    }

    /// @custom:author PeterA
    /// @notice Publishes a request for an option in the marketplace
    /// @param _nftContract: address of NFT contract of token
    /// @param _nftTokenID: ID of NFT token from specified contract
    /// @param _strikePrice: floor price of NFT to insure against
    /// @param _interval: time the option is to be available for, in seconds
    /// @param _flavor: EUROPEAN or AMERICAN
    function publishOptionRequest
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
        if (_nftTokenID == 0)                     revert INVALID_TOKEN_ID(_nftTokenID);
        if (!_nftContract.isInterfaceOf_ERC721()) revert NOT_AN_INTERFACE_OF("ERC-721", _nftContract);

        /// @dev Check for NFT ownership
        IERC721 _instance = IERC721(_nftContract);
        if (_instance.ownerOf(_nftTokenID) != msg.sender) revert NFT_NOT_OWNER(msg.sender);

        if (msg.value == 0)     revert INVALID_PREMIUM_AMOUNT(0);
        if (_strikePrice == 0) revert INVALID_STRIKE_PRICE_AMOUNT(0);
        if (_interval == 0)    revert INVALID_EXPIRATION_INTERVAL(0);

        /// @dev Optimize for gas by caching id
        uint256 requestID_ = 0;

        /// @dev Optimize for gas by caching array length
        uint256 length_ = requestDeletedIDs.length;

        /// @dev Reuse first available slot in map for requests
        if (length_ != 0)
        {
            requestID_ = requestDeletedIDs[length_ - 1];
            requestDeletedIDs.pop();
        }
        else requestID_ = requestID;

        /// @dev Update storage
        requests[requestID_] =
        Request
        ({
            buyer       : payable(msg.sender)
        ,   nftContract : _nftContract
        ,   nftId       : _nftTokenID
        ,   interval    : _interval
        ,   premium     : msg.value
        ,   strikePrice : _strikePrice
        ,   flavor      : OptionFlavor(_flavor)
        });

        emit Published(requestID_);

        /// @dev Update counter when needed
        if (length_ == 0) requestID = ++requestID_;
    }

    /// @custom:author GregVanDell and LuisImagiire
    /// @notice Removes a published option request from the marketplace
    /// @param _requestID: id of the option request to remove
    function withdrawOptionRequest(uint256 _requestID)
    external
    {
        Request memory request_ = requests[_requestID];

        if(!_exists(request_))               revert INVALID_REQUEST_ID(_requestID);
        if (request_.buyer != msg.sender)    revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerCanCall);
        if (getBalance() < request_.premium) revert INSUFFICIENT_FUNDS();

        /// @dev Update storage
        delete requests[_requestID];

        requestDeletedIDs.push(_requestID);

        emit Withdrawn(_requestID);

        /// @dev Transfer premium back to buyer
        (bool success,) = request_.buyer.call{ value : request_.premium }("");
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
        Request memory request_ = requests[_requestID];

        if (!_exists(request_))                revert INVALID_REQUEST_ID(_requestID);
        if (request_.buyer == msg.sender)      revert BUYER_MUST_DIFFER_FROM_SELLER();
        if (getBalance() < request_.premium)   revert INSUFFICIENT_FUNDS();
        if (msg.value != request_.strikePrice) revert INVALID_STRIKE_PRICE_AMOUNT(request_.strikePrice);

        /// @dev Update storage
        delete requests[_requestID];

        /// @dev Optimize for gas by caching id
        uint256 optionID_ = optionID;

        options[optionID_] =
        Option
        ({
            request   : request_
        ,   seller    : payable(msg.sender)
        ,   startDate : block.timestamp
        ,   state     : OptionState.OPEN
        });

        emit Opened(optionID_);

        optionID = ++optionID_;

        /// @dev Transfer premium to caller
        (bool success,) = msg.sender.call{ value : request_.premium }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author ShababAli
    /// @notice Cancels an active option and returns strike price to seller
    /// @param _optionID: id of the option to cancel
    function cancelOption(uint256 _optionID)
    external
    {
        Option memory option_ = options[_optionID];

        if(!_exists(option_.request))          revert INVALID_OPTION_ID(_optionID);
        if (option_.state != OptionState.OPEN) revert INVALID_OPTION_STATE(option_.state, OptionState.OPEN);

        IERC721 nftContract = IERC721(option_.request.nftContract);
        if (nftContract.getApproved(option_.request.nftId) == address(this)) revert NOT_AUTHORIZED(msg.sender, "Cancel while approved contract to transfer NFT");

        /// @dev Restrict calling rights to buyer (permitted anytime) or seller (restricted)
        bool isSeller = msg.sender == option_.seller;

        if (!isSeller && msg.sender != option_.request.buyer) revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerOrSellerCanCall);

        /// @dev Restrict calling rights of seller: permit only after expiration
        uint256 expirationDate_ = option_.startDate + option_.request.interval;

        if (isSeller && expirationDate_ >= block.timestamp)   revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerCanCall);

        options[_optionID].state = OptionState.CANCELED;

        emit Canceled(_optionID);

        (bool success,) = option_.seller.call{ value : option_.request.strikePrice }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author LuisImagiire
    /// @notice Exercises an active option when msg.sender is allowed to execute
    /// @param _optionID: id of the option to exercise
    function exerciseOption(uint256 _optionID)
    external
    {
        Option memory option_ = options[_optionID];

        if (option_.request.buyer == address(0))        revert INVALID_OPTION_ID(_optionID);
        if (option_.request.buyer != msg.sender)        revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerCanCall);
        if (option_.state != OptionState.OPEN)          revert INVALID_OPTION_STATE(option_.state, OptionState.OPEN);
        if (getBalance() < option_.request.strikePrice) revert INSUFFICIENT_FUNDS();

        /// @dev Check for NFT access and ownership
        IERC721 nftContract = IERC721(option_.request.nftContract);

        if (nftContract.ownerOf(option_.request.nftId) != msg.sender)        revert NFT_NOT_OWNER(msg.sender);
        if (nftContract.getApproved(option_.request.nftId) != address(this)) revert NOT_APPROVED_TO_TRANSFER_NFT(option_.request.nftContract, option_.request.nftId);

        /// @dev Check that interval is valid
        if (option_.startDate + option_.request.interval < option_.startDate) revert UNSIGNED_INTEGER_OVERFLOW();

        /// @dev Check that option can be exercised
        uint256 expirationDate_ = option_.startDate + option_.request.interval;

        bool isExpired =
        block.timestamp > expirationDate_
        || (
            option_.request.flavor == OptionFlavor.EUROPEAN &&
            (expirationDate_ - 1 days) > block.timestamp
        );

        if (isExpired) revert EXERCISE_WINDOW_IS_CLOSED(expirationDate_);

        nftContract.transferFrom
        ({
            to      : option_.seller
        ,   from    : msg.sender
        ,   tokenId : option_.request.nftId
        });

        options[_optionID].state = OptionState.EXERCISED;

        emit Exercised(_optionID);

        (bool success,) = msg.sender.call{ value : option_.request.strikePrice }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @dev -- CUSTOM ERRORS -------------------------

    /// @dev -- Option Property
    error INVALID_REQUEST_ID(uint256 id);
    error INVALID_OPTION_ID(uint256 id);
    error INVALID_TOKEN_ID(uint256 id);
    error INVALID_PREMIUM_AMOUNT(uint256 premium);
    error INVALID_STRIKE_PRICE_AMOUNT(uint256 strikePrice);
    error INVALID_EXPIRATION_INTERVAL(uint32 interval);
    error INVALID_OPTION_STATE(OptionState currentState, OptionState neededState);

    /// @dev -- Account
    error NOT_AUTHORIZED(address user, string reason);
    error NOT_APPROVED_TO_TRANSFER_NFT(address nftContract, uint256 nftId);
    error NFT_NOT_OWNER(address presumedOwner);

    /// @dev -- Option Action
    error BUYER_MUST_DIFFER_FROM_SELLER();
    error EXERCISE_WINDOW_IS_CLOSED(uint256 expirationTimestamp);

    /// @dev -- Funds-related
    error INSUFFICIENT_FUNDS();
    error FUNDS_TRANSFER_FAILED();

    /// @dev -- General
    error NOT_AN_INTERFACE_OF(string interfaceName, address contractAddress);
    error UNSIGNED_INTEGER_OVERFLOW();
}