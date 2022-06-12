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

    struct Option {
        address payable buyer;
        OptionFlavor    flavor;
        address payable seller;
        OptionState     state;
        address         nftContract;
        uint32          interval;
        uint256         startDate;
        uint256         premium;
        uint256         strikePrice;
        uint256         nftId;
    }

    /// @dev -- STACK ---------------------------------
    string constant            private _msg_OnlyBuyerCanCall         = "Only Buyer can call this method";
    string constant            private _msg_OnlyBuyerOrSellerCanCall = "Only Buyer or Seller can call this method";

    uint256                    public optionID;
    mapping(uint256 => Option) public options;

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
    /// @notice Checks if the supplied option has valid field values
    /// @param _option: the Option instance to check
    function _exists(Option memory _option)
    private pure
    returns (bool)
    {
        return _option.buyer       != address(0) &&
               _option.nftContract != address(0) &&
               _option.nftId       != 0          &&
               _option.interval    != 0          &&
               _option.premium     != 0          &&
               _option.strikePrice != 0;
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
        if (!_nftContract.isInterfaceOf_ERC721())
        {
            revert NOT_AN_INTERFACE_OF("ERC-721", _nftContract);
        }

        if (_nftTokenID == 0)
        {
            revert INVALID_TOKEN_ID(_nftTokenID);
        }

        if (IERC721(_nftContract).ownerOf(_nftTokenID) != msg.sender)
        {
            revert NFT_NOT_OWNER(msg.sender);
        }

        if (msg.value == 0)
        {
            revert INVALID_PREMIUM_AMOUNT(0);
        }

        if (_strikePrice == 0)
        {
            revert INVALID_STRIKE_PRICE_AMOUNT(0);
        }

        if (_interval == 0)
        {
            revert INVALID_EXPIRATION_INTERVAL(0);
        }

        /// @dev Optimize for gas by caching id
        uint256 _optionID = optionID;

        options[_optionID] =
        Option
        ({
            buyer       : payable(msg.sender)
        ,   seller      : payable(address(0))
        ,   nftContract : _nftContract
        ,   nftId       : _nftTokenID
        ,   startDate   : 0
        ,   interval    : _interval
        ,   premium     : msg.value
        ,   strikePrice : _strikePrice
        ,   flavor      : OptionFlavor(_flavor)
        ,   state       : OptionState.PUBLISHED
        });

        emit Published(_optionID);

        ++optionID;
    }

    /// @custom:author GregVanDell and LuisImagiire
    /// @notice Removes a published option request from the marketplace
    /// @param _optionId: id of the option request to remove
    function withdrawOptionRequest(uint256 _optionId)
    external
    payable
    {
        Option memory option = options[_optionId];

        if(!_exists(option))
        {
            revert INVALID_OPTION_ID(_optionId);
        }

        if (option.state != OptionState.PUBLISHED)
        {
            revert INVALID_OPTION_STATE(option.state, OptionState.PUBLISHED);
        }

        if (option.buyer != msg.sender)
        {
            revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerCanCall);
        }

        if (getBalance() < option.premium)
        {
            revert INSUFFICIENT_FUNDS();
        }

        (bool success,) = option.buyer.call{value: option.premium}("");
        if (!success)
        {
            revert FUNDS_TRANSFER_FAILED();
        }

        options[_optionId].state = OptionState.WITHDRAWN;

        emit Withdrawn(_optionId);
    }

    /// @custom:author StefanaM
    /// @notice Create (enables) an option from a published request from the marketplace
    ///         by sending strike price to contract and premium to msg.sender
    /// @param _optionId: id of the option request from which to create the option
    function createOption(uint256 _optionId)
    external
    payable
    {
        Option memory option = options[_optionId];

        if(!_exists(option))
        {
            revert INVALID_OPTION_ID(_optionId);
        }

        if (option.seller != address(0))
        {
            revert OPTION_REQUEST_ALREADY_FULFILLED(option.seller);
        }

        if (option.state != OptionState.PUBLISHED)
        {
            revert INVALID_OPTION_STATE(option.state, OptionState.PUBLISHED);
        }

        if (option.buyer == msg.sender)
        {
            revert BUYER_MUST_DIFFER_FROM_SELLER();
        }

        if (getBalance() < option.premium)
        {
            revert INSUFFICIENT_FUNDS();
        }

        if (msg.value != option.strikePrice)
        {
            revert INVALID_STRIKE_PRICE_AMOUNT(option.strikePrice);
        }

        if (block.timestamp + option.interval < block.timestamp)
        {
            revert UNSIGNED_INTEGER_OVERFLOW();
        }

        option.seller    = payable(msg.sender);
        option.startDate = block.timestamp;
        option.state     = OptionState.OPEN;

        options[_optionId] = option;

        (bool success,) = msg.sender.call{value: option.premium}("");
        if (!success)
        {
            revert FUNDS_TRANSFER_FAILED();
        }

        emit Opened(_optionId);
    }

    /// @custom:author ShababAli
    /// @notice Cancels an active option and returns strike price to seller
    /// @param _optionId: id of the option to cancel
    function cancelOption(uint256 _optionId)
    external
    payable
    {
        Option memory option = options[_optionId];

        if(!_exists(option))
        {
            revert INVALID_OPTION_ID(_optionId);
        }

        if (option.state != OptionState.OPEN)
        {
            revert INVALID_OPTION_STATE(option.state, OptionState.OPEN);
        }

        if (option.startDate + option.interval < option.startDate)
        {
            revert UNSIGNED_INTEGER_OVERFLOW();
        }

        uint256 expirationDate = option.startDate + option.interval;

        /// @dev Restrict calling rights to buyer (permitted anytime) or seller (restricted)
        if
        (
            option.buyer != msg.sender &&
            option.seller != msg.sender
        )
        {
            revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerOrSellerCanCall);
        }

        /// @dev Restrict calling rights of seller: permit only after expiration
        if
        (
            expirationDate >= block.timestamp &&
            option.buyer != msg.sender
        )
        {
            revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerCanCall);
        }

        (bool success,) = option.seller.call{value: option.strikePrice}("");
        if (!success)
        {
            revert FUNDS_TRANSFER_FAILED();
        }

        options[_optionId].state = OptionState.CANCELED;

        emit Canceled(_optionId);
    }

    /// @custom:author LuisImagiire
    /// @notice Exercises an active option when msg.sender is allowed to execute
    /// @param _optionId: id of the option to exercise
    function exerciseOption(uint256 _optionId)
    external
    payable
    {
        Option memory option = options[_optionId];

        if (option.buyer == address(0))
        {
            revert INVALID_OPTION_ID(_optionId);
        }

        if (option.state != OptionState.OPEN)
        {
            revert INVALID_OPTION_STATE(option.state, OptionState.OPEN);
        }

        /// @dev Restrict calling rights to buyer only
        if (option.buyer != msg.sender)
        {
            revert NOT_AUTHORIZED(msg.sender, _msg_OnlyBuyerCanCall);
        }

        /// @dev Check for NFT access and ownership
        IERC721 nftContract = IERC721(option.nftContract);

        if (nftContract.ownerOf(option.nftId) != msg.sender)
        {
            revert NFT_NOT_OWNER(msg.sender);
        }

        if (nftContract.getApproved(option.nftId) != address(this))
        {
            revert NOT_APPROVED_TO_TRANSFER_NFT(option.nftContract, option.nftId);
        }

        if (option.startDate + option.interval < option.startDate)
        {
            revert UNSIGNED_INTEGER_OVERFLOW();
        }

        /// @dev Check for time restrictions
        uint256 expirationDate = option.startDate + option.interval;
        if
        (
            block.timestamp > expirationDate ||
            (option.flavor == OptionFlavor.EUROPEAN && (expirationDate - 1 days) > block.timestamp)
        )
        {
            revert EXERCISE_WINDOW_IS_CLOSED(expirationDate);
        }

        if (getBalance() < option.strikePrice)
        {
            revert INSUFFICIENT_FUNDS();
        }

        (bool success,) = msg.sender.call{value: option.strikePrice}("");
        if (!success)
        {
            revert FUNDS_TRANSFER_FAILED();
        }

        nftContract.transferFrom
        ({
            to      : option.seller
        ,   from    : msg.sender
        ,   tokenId : option.nftId
        });

        options[_optionId].state = OptionState.EXERCISED;

        emit Exercised(_optionId);
    }

    /// @dev -- CUSTOM ERRORS -------------------------

    /// @dev -- Option Property
    error INVALID_OPTION_ID(uint256 id);
    error INVALID_TOKEN_ID(uint256 id);
    error INVALID_PREMIUM_AMOUNT(uint256 premium);
    error INVALID_STRIKE_PRICE_AMOUNT(uint256 strikePrice);
    error INVALID_EXPIRATION_INTERVAL(uint32 interval);

    /// @dev -- Account
    error NOT_AUTHORIZED(address user, string reason);
    error NOT_APPROVED_TO_TRANSFER_NFT(address nftContract, uint256 nftId);
    error NFT_NOT_OWNER(address presumedOwner);

    /// @dev -- Option Action
    error BUYER_MUST_DIFFER_FROM_SELLER();
    error EXERCISE_WINDOW_IS_CLOSED(uint256 expirationTimestamp);
    error OPTION_REQUEST_ALREADY_FULFILLED(address fulfillerAddress);
    error INVALID_OPTION_STATE(OptionState currentState, OptionState neededState);

    /// @dev -- Funds-related
    error INSUFFICIENT_FUNDS();
    error FUNDS_TRANSFER_FAILED();

    /// @dev -- General
    error NOT_AN_INTERFACE_OF(string interfaceName, address contractAddress);
    error UNSIGNED_INTEGER_OVERFLOW();
}