// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

/**
 * @dev OpenZeppelin's interface of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
 */
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTOpt {

    enum OptionState  { REQUEST, OPEN, CLOSED }
    enum OptionFlavor { EUROPEAN, AMERICAN }

    struct Option {
        address      buyer;
        address      seller;
        address      nftContract;
        uint32       nftId;
        uint32       interval;
        uint         startDate;
        uint         premium;
        uint         strikePrice;
        OptionFlavor flavor;
        OptionState  state;
    }

    uint                    public optionID;
    mapping(uint => Option) public options;

    event NewRequest(address, uint);
    event Received(address, uint);
    event Fallback(address, uint);
    event Filled(address, uint);

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
        bool success;
        bytes memory data =
        abi.encodeWithSelector
        (
            bytes4(keccak256("ownerOf(uint256)")) // encoded method name and comma-separated list of parameter types
        ,   0                                     // values for parameters
        );

        assembly
        {
            success := call
            (
                0,              // gas remaining
                _token,         // destination address
                0,              // no ether
                add(data, 32),  // input buffer (starts after the first 32 bytes in the `data` array)
                mload(data),    // input length (loaded from the first 32 bytes in the `data` array)
                0,              // output buffer
                0               // output length
            )
        }

        return !success;
    }

    function publishOptionRequest
    (
        address      _nftContract
    ,   uint32       _nftId
    ,   uint         _strikePrice
    ,   uint32       _interval
    ,   OptionFlavor _flavor
    )
    external
    payable
    {
        require (_nftContract != address(0), "NFT contract must be a valid address");
        require (_nftId > 0                , "NFT token ID must be > 0");

        require
        (
            _detect_if_contract_implements_ERC721(_nftContract)
        ,   "Provided NFT contract address must implement ERC-721 interface"
        );

        require
        (
            IERC721(_nftContract).ownerOf(_nftId) == msg.sender
        ,   "Ownership of specified NFT token is under a different wallet than the caller's"
        );

        require (msg.value > 0   , "Premium must be > 0");
        require (_strikePrice > 0, "Strike price must be > 0");
        require (_interval > 0   , "Expiration interval must be > 0");

        options[++optionID] =
        Option
        ({
            buyer       : msg.sender
        ,   seller      : address(0)
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

    function withdrawOptionRequest(uint32 _optionId)
    external
    payable
    {
        // TODO: update this with the correct implementation (wrote this here only for testing)
        options[_optionId].state = OptionState.CLOSED;
    }

    function createOption(uint32 _optionId)
    external
    payable
    {
        Option storage option = options[_optionId];

        require(option.buyer != address(0)                       , "Option with the specified id does not exist");
        require(option.seller == address(0)                      , "Option is already fulfilled by a seller");
        require(option.state == OptionState.REQUEST              , "Option is not in the request state");
        require(option.buyer != msg.sender                       , "Seller is the same as buyer");
        require(address(msg.sender).balance >= option.strikePrice, "Seller does not have enough balance");
        require(getBalance() >= option.premium                   , "Not enough funds to pay the premium to the seller");
        require(msg.value == option.strikePrice                  , "Wrong strike price provided");

        option.seller = msg.sender;
        option.startDate = block.timestamp;
        option.state = OptionState.OPEN;

        (bool success,) = msg.sender.call{value: option.premium}("");
        require(success, "Transaction failed");

        emit Filled(msg.sender, _optionId);
    }

    function cancelOption(uint32 _optionId)
    external
    payable
    {

    }

    function exerciseOption(uint32 _optionId)
    external
    payable
    {

    }
}
