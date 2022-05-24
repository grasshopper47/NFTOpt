// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

/**
 * @dev OpenZeppelin's interface of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
 */
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTOpt {

    /// @notice Invalid option ID
    error INVALID_OPTION_ID(uint256 id);

    /// @notice Invalid NFT token ID
    error INVALID_TOKEN_ID(uint256 id);

    /// @notice Invalid NFT contract address
    error NOT_AN_INTERFACE_OF(string interfaceName, address contractAddress);

    /// @notice Invalid premium amount
    error INVALID_PREMIUM_AMOUNT(uint256 premium);

    /// @notice Invalid strike price
    error INVALID_STRIKE_PRICE_AMOUNT(uint256 strikePrice);

    /// @notice Missing requested funds from balancce
    error MISSING_FUNDS_TO_PAY_REQUESTED_AMOUNT(uint256 requestedAmount);

    /// @notice Invalid interval
    error INVALID_EXPIRATION_INTERVAL(uint32 interval);

    /// @notice Address do not have permission to execute action
    error NOT_AUTHORIZED(address providedAddress, string reason);

    /// @notice Contract address needs approval from owner to transfer NFT
    error NFT_NOT_APPROVED(address nftAddress, uint256 nftId);

    /// @notice Address is not owner of the NFT
    error NFT_NOT_OWNER(address presumableOwnerAddress);

    /// @notice Current option state is not allowed for this transaction
    error INVALID_OPTION_STATE(OptionState currentState, OptionState neededState);

    /// @notice Current timestamp does not allow for option exercise
    error EXERCISE_WINDOW_IS_CLOSED(uint256 expirationTimestamp);

    /// @notice Current timestamp does not allow for option exercise
    error OPTION_REQUEST_ALREADY_FULFILLED(address fulfillerAddress);

    /// @notice Insufficient funds in escrow to withdrawal
    error INSUFFICIENT_FUNDS();

    /// @notice Failed to transfer funds from escrow to msg.sender
    error FUNDS_TRANSFER_FAILED();

    /// @notice Buyer always != seller
    error CANNOT_HAVE_BUYER_SAME_AS_SELLER();

    error UNSIGNED_INTEGER_OVERFLOW();

    enum OptionState  {REQUEST, OPEN, CLOSED}
    enum OptionFlavor {EUROPEAN, AMERICAN}

    struct Option {
        address payable      buyer;
        address payable      seller;
        address              nftContract;
        uint32               interval;
        uint256              startDate;
        uint256              premium;
        uint256              strikePrice;
        uint256              nftId;
        OptionFlavor flavor;
        OptionState state;
    }

    uint256                    public optionID;
    mapping(uint256 => Option) public options;

    event Received(address, uint);
    event Fallback(address, uint);
    event NewRequest(address, uint);
    event Exercised(uint);
    event Filled(address, uint);
    event Canceled(address, uint);

    receive() external payable
    {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable
    {
        emit Fallback(msg.sender, msg.value);
    }

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    function _detect_if_contract_implements_ERC721(address _token)
    internal
    returns (bool)
    {
        /// @dev Testing by trying to call two methods: ownerOf, getApproved
        ///      Sent with 0 gas, expecting error, so as to avoid incurring extra costs

        bool _error;

        bytes memory data =
        abi.encodeWithSelector
        (
            bytes4(keccak256("ownerOf(uint256)"))   // encoded method name and comma-separated list of parameter types
        ,   0                                       // values for parameters
        );

        assembly
        {
            _error := call
            (
                0,                // gas remaining
                _token,           // destination address
                0,                // no value
                add(data, 32),    // input buffer (starts after the first 32 bytes in the `data` array)
                mload(data),      // input length (loaded from the first 32 bytes in the `data` array)
                0,                // output buffer
                0                 // output length
            )
        }

        if (_error) { return false; }

        data = abi.encodeWithSelector(bytes4(keccak256("getApproved(uint256)")), 0);

        assembly
        {
            _error := call
            (
                0,
                _token,
                0,
                add(data, 32),
                mload(data),
                0,
                0
            )
        }

        return !_error;
    }

    function publishOptionRequest
    (
        address      _nftContract
    ,   uint256      _nftId
    ,   uint256      _strikePrice
    ,   uint32       _interval
    ,   OptionFlavor _flavor
    )
    external
    payable
    {
        if (!_detect_if_contract_implements_ERC721(_nftContract))
        {
            revert NOT_AN_INTERFACE_OF("ERC-721", _nftContract);
        }

        if (_nftId == 0)
        {
            revert INVALID_TOKEN_ID(_nftId);
        }

        if (IERC721(_nftContract).ownerOf(_nftId) != msg.sender)
        {
            revert NFT_NOT_OWNER(msg.sender);
        }

        if (msg.value == 0)
        {
            revert INVALID_PREMIUM_AMOUNT(0);
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

        options[++optionID] =
        Option
        ({
            buyer       : payable(msg.sender)
        ,   seller      : payable(address(0))
        ,   nftContract : _nftContract
        ,   nftId       : _nftId
        ,   startDate   : 0
        ,   interval    : _interval
        ,   premium     : msg.value
        ,   strikePrice : _strikePrice
        ,   flavor      : OptionFlavor(_flavor)
        ,   state       : OptionState.REQUEST
        });

        emit NewRequest(msg.sender, optionID);
    }

    function withdrawOptionRequest(uint256 _optionId)
    external
    payable
    {
        // TODO: update this with the correct implementation (wrote this here only for testing)
        options[_optionId].state = OptionState.CLOSED;
    }

    function createOption(uint256 _optionId)
    external
    payable
    {
        Option memory option = options[_optionId];

        if
        (
            option.buyer       == address(0) ||
            option.nftContract == address(0) ||
            option.nftId       == 0          ||
            option.interval    == 0          ||
            option.premium     == 0          ||
            option.strikePrice == 0
        )
        {
            revert INVALID_OPTION_ID(_optionId);
        }

        if (option.seller != address(0))
        {
            revert OPTION_REQUEST_ALREADY_FULFILLED(option.seller);
        }

        if (option.state != OptionState.REQUEST)
        {
            revert INVALID_OPTION_STATE(option.state, OptionState.REQUEST);
        }

        if (option.buyer == msg.sender)
        {
            revert CANNOT_HAVE_BUYER_SAME_AS_SELLER();
        }

        if (getBalance() < option.premium)
        {
            revert MISSING_FUNDS_TO_PAY_REQUESTED_AMOUNT(option.premium);
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

        emit Filled(msg.sender, _optionId);
    }

    function cancelOption(uint256 _optionId)
    external
    payable
    {
        Option memory option = options[_optionId];

        if
        (
            option.buyer       == address(0) ||
            option.nftContract == address(0) ||
            option.nftId       == 0          ||
            option.interval    == 0          ||
            option.premium     == 0          ||
            option.strikePrice == 0
        )
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
            revert NOT_AUTHORIZED(msg.sender, "Only Buyer or Seller can cancel");
        }

        /// @dev Restrict calling rights of seller: permit only after expiration
        if
        (
            expirationDate >= block.timestamp &&
            option.buyer != msg.sender
        )
        {
            revert NOT_AUTHORIZED(msg.sender, "Only Buyer can cancel");
        }

        (bool success,) = option.seller.call{value: option.strikePrice}("");
        if (!success)
        {
            revert FUNDS_TRANSFER_FAILED();
        }

        options[_optionId].state = OptionState.CLOSED;

        emit Canceled(msg.sender, _optionId);
    }

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
            revert NOT_AUTHORIZED(msg.sender, "Only Buyer can exercise");
        }

        /// @dev Check for NFT access and ownership
        IERC721 nftContract = IERC721(option.nftContract);

        if (nftContract.ownerOf(option.nftId) != msg.sender)
        {
            revert NFT_NOT_OWNER(msg.sender);
        }

        if (nftContract.getApproved(option.nftId) != address(this))
        {
            revert NFT_NOT_APPROVED(option.nftContract, option.nftId);
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

        options[_optionId].state = OptionState.CLOSED;

        emit Exercised(_optionId);
    }
}
