// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.15;

/// @dev OpenZeppelin's interface of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./InterfaceDetector.sol";

contract NFTOpt {

    using InterfaceDetector for address;

    /// @dev -- SCAFFOLDING ---------------------------

    enum STATES  { PUBLISHED, OPEN, CANCELED, EXERCISED }
    enum FLAVORS { EUROPEAN, AMERICAN }

    struct Option
    {
        uint256 premium;
        uint256 strikePrice;
        uint256 startDate;
        uint256 nftId;
        address buyer;
        address seller;
        address nftContract;
        uint32  interval;
        STATES  state;
        FLAVORS flavor;
    }

    /// @dev -- STACK ---------------------------------
    string constant _msg_OnlyBuyer = "Only Buyer can call this method";

    uint256[]                   private deletedIDs;

    uint256                     public optionID;
    mapping(uint256 => Option)  public options;

    /// @dev -- EVENTS --------------------------------

    event Published (uint256 indexed);
    event Exercised (uint256 indexed);
    event Opened    (uint256 indexed);
    event Canceled  (uint256 indexed);
    event Withdrawn (uint256 indexed);

    /// @dev -- METHODS -------------------------------

    /// @custom:author PeterA
    /// @notice Publishes a option for an option in the marketplace
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
    ,   FLAVORS _flavor
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
        uint256 length_ = deletedIDs.length;

        /// @dev Optimize for gas by caching id
        uint256 optionID_ = optionID;

        /// @dev Reuse first available slot in map for options
        if (length_ != 0)
        {
            unchecked { optionID_ = deletedIDs[length_ - 1]; }
            deletedIDs.pop();
        }

        /// @dev Update storage
        Option storage option = options[optionID_];

        option.buyer       = msg.sender;
        option.nftContract = _nftContract;
        option.nftId       = _nftTokenID;
        option.interval    = _interval;
        option.premium     = msg.value;
        option.strikePrice = _strikePrice;
        option.flavor      = _flavor;

        emit Published(optionID_);

        /// @dev Update counter when needed; WRT overflow: only happens for the very last item, so acceptable
        if (length_ == 0) { unchecked { optionID = ++optionID_; } }
    }

    /// @custom:author GregVanDell and LuisImagiire
    /// @notice Removes a published option option from the marketplace
    /// @param _optionID: id of the option option to remove
    function withdrawRequest(uint256 _optionID)
    external
    {
        address buyer_ = options[_optionID].buyer;
        if (buyer_ == address(0)) revert INVALID_ID(_optionID);
        if (buyer_ != msg.sender) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        STATES state_ = options[_optionID].state;
        if (state_ != STATES.PUBLISHED) revert INVALID_OPTION_STATE(state_, STATES.PUBLISHED);

        /// @dev Update storage by marking as "invalid"
        options[_optionID].buyer = address(0);
        deletedIDs.push(_optionID);

        emit Withdrawn(_optionID);

        /// @dev Transfer premium back to buyer
        (bool success,) = buyer_.call{ value : options[_optionID].premium }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author StefanaM
    /// @notice Create (enables) an option from a published option from the marketplace
    ///         by sending strike price to contract and premium to msg.sender
    /// @param _optionID: id of the option option from which to create the option
    function createOption(uint256 _optionID)
    external
    payable
    {
        address buyer_ = options[_optionID].buyer;
        if (buyer_ == address(0)) revert INVALID_ID(_optionID);
        if (buyer_ == msg.sender) revert BUYER_MUST_DIFFER_FROM_SELLER();

        uint strikePrice_ = options[_optionID].strikePrice;
        if (msg.value != strikePrice_) revert INVALID_STRIKE_PRICE_AMOUNT(strikePrice_);

        /// @dev TODO: perhaps check that interval + block.timestamp don't overflow
        // if (block.timestamp + options[_optionID].interval < block.timestamp) revert UNSIGNED_INTEGER_OVERFLOW();

        /// @dev Update storage -- options
        Option storage option_ = options[_optionID];

        option_.startDate = block.timestamp;
        option_.seller    = msg.sender;
        option_.state     = STATES.OPEN;

        emit Opened(_optionID);

        /// @dev Transfer premium to caller
        (bool success,) = msg.sender.call{ value : options[_optionID].premium }("");
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

        STATES state_ = options[_optionID].state;
        if (state_ != STATES.OPEN) revert INVALID_OPTION_STATE(state_, STATES.OPEN);

        address buyer_ = options[_optionID].buyer;

        /// @dev Restrict calling rights to buyer (permitted anytime) or seller (restricted)
        bool isSeller = msg.sender == seller_;
        if (!isSeller && msg.sender != buyer_) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        /// @dev Restrict calling rights of seller: permit only after expiration
        uint256 expirationDate_;
        unchecked { expirationDate_ = options[_optionID].startDate + options[_optionID].interval; }
        if (expirationDate_ >= block.timestamp && buyer_ != msg.sender) revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        /// @dev Update storage
        options[_optionID].state = STATES.CANCELED;

        emit Canceled(_optionID);

        (bool success,) = seller_.call{ value : options[_optionID].strikePrice }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @custom:author LuisImagiire
    /// @notice Exercises an active option when msg.sender is allowed to execute
    /// @param _optionID: id of the option to exercise
    function exerciseOption(uint256 _optionID)
    external
    {
        if (options[_optionID].seller == address(0)) revert INVALID_ID(_optionID);
        if (options[_optionID].buyer != msg.sender)  revert NOT_AUTHORIZED(_msg_OnlyBuyer);

        STATES state_ = options[_optionID].state;
        if (state_ != STATES.OPEN) revert INVALID_OPTION_STATE(state_, STATES.OPEN);

        /// @dev Check for NFT access and ownership
        uint256 nftId_ = options[_optionID].nftId;
        IERC721 nftContract = IERC721(options[_optionID].nftContract);
        if (nftContract.ownerOf(nftId_) != msg.sender)        revert NFT_NOT_OWNER(msg.sender);
        if (nftContract.getApproved(nftId_) != address(this)) revert NOT_APPROVED_TO_TRANSFER_NFT(address(nftContract), nftId_);

        /// @dev Check that option can be exercised
        uint256 expirationDate_;
        unchecked { expirationDate_ = options[_optionID].startDate + options[_optionID].interval; }

        bool isExpired =
        block.timestamp > expirationDate_
        || (
            options[_optionID].flavor == FLAVORS.EUROPEAN &&
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
        options[_optionID].state = STATES.EXERCISED;

        emit Exercised(_optionID);

        (bool success,) = msg.sender.call{ value : options[_optionID].strikePrice }("");
        if (!success) revert FUNDS_TRANSFER_FAILED();
    }

    /// @dev -- CUSTOM ERRORS -------------------------

    /// @dev -- Option Property
    error INVALID_ID(uint256 id);
    error INVALID_TOKEN_ID(uint256 id);
    error INVALID_PREMIUM_AMOUNT(uint256 amount);
    error INVALID_STRIKE_PRICE_AMOUNT(uint256 amount);
    error INVALID_EXPIRATION_INTERVAL(uint32 interval);
    error INVALID_OPTION_STATE(STATES currentState, STATES neededState);

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
