// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/Strings.sol";
import "contracts/DummyNFT.sol";

contract NFTOpt {

    /// @notice Invalid option ID
    error INVALID_OPTION_ID(uint32 providedId);

    /// @notice Address do not have permission to execute action
    error NOT_AUTHORIZED(address providedAddress);

    /// @notice Contract address needs approval from owner to transfer NFT
    error NFT_NOT_APPROVED(address nftAddress, uint32 nftId);

    /// @notice Current option state is not allowed for this transaction
    error INVALID_OPTION_STATE(OptionState currentState, OptionState neededState);

    /// @notice Current timestamp does not allow for option exercise
    error EXERCISE_WINDOW_IS_CLOSED(uint expirationTimestamp);

    /// @notice Insufficient funds in escrow to withdrawal
    error INSUFFICIENT_FUNDS();

    enum OptionState  {REQUEST, OPEN, CLOSED}
    enum OptionFlavor {EUROPEAN, AMERICAN}

    struct Option {
        address payable buyer;
        address payable seller;
        address nftContract;
        uint32 nftId;
        uint256 startDate;
        uint32 interval;
        uint premium;
        uint strikePrice;
        OptionFlavor flavor;
        OptionState state;
    }

    uint                    public optionID;
    mapping(uint => Option) public options;

    event NewRequest(address, uint);
    event Received(address, uint);
    event Fallback(address, uint);
    event Exercised(uint);

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
        , 0                                     // values for parameters
        );

        assembly
        {
            success := call
            (
            0, // gas remaining
            _token, // destination address
            0, // no ether
            add(data, 32), // input buffer (starts after the first 32 bytes in the `data` array)
            mload(data), // input length (loaded from the first 32 bytes in the `data` array)
            0, // output buffer
            0               // output length
            )
        }

        return !success;
    }

    function publishOptionRequest
    (
        address _nftContract
    , uint32 _nftId
    , uint _strikePrice
    , uint32 _interval
    , OptionFlavor _flavor
    )
    external
    payable
    {
        require(_nftContract != address(0), "NFT contract must be a valid address");
        require(_nftId > 0, "NFT token ID must be > 0");

        require
        (
            _detect_if_contract_implements_ERC721(_nftContract)
        , "Provided NFT contract address must implement ERC-721 interface"
        );

        require
        (
            DummyNFT(_nftContract).ownerOf(_nftId) == msg.sender
        , "Ownership of specified NFT token is under a different wallet than the caller's"
        );

        require(msg.value > 0, "Premium must be > 0");
        require(_strikePrice > 0, "Strike price must be > 0");
        require(_interval > 0, "Expiration interval must be > 0");

        options[++optionID] =
        Option
        ({
        buyer : payable(msg.sender)
        , seller : payable(address(0))
        , nftContract : _nftContract
        , nftId : _nftId
        , startDate : 0
        , interval : _interval
        , premium : msg.value
        , strikePrice : _strikePrice
        , flavor : OptionFlavor(_flavor)
        , state : OptionState.REQUEST
        });

        emit NewRequest(msg.sender, optionID);
    }

    function withdrawOptionRequest(uint32 _optionId)
    external
    payable
    {

    }

    function createOption(uint32 _optionId)
    external
    payable
    {
        // TODO: Substitute for real implementation
        Option storage currentOption = options[_optionId];
        currentOption.seller = payable(msg.sender);
        currentOption.state = OptionState.OPEN;
        currentOption.startDate = block.timestamp;
        currentOption.interval = 7 days;
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
        Option memory currentOption = options[_optionId];

        if (currentOption.buyer == address(0)) {
            revert INVALID_OPTION_ID({providedId : _optionId});
        }

        if (currentOption.state != OptionState.OPEN) {
            revert INVALID_OPTION_STATE(currentOption.state, OptionState.OPEN);
        }

        if (currentOption.buyer != msg.sender
        ) {
            revert NOT_AUTHORIZED({providedAddress : msg.sender});
        }

        // Check for NFT access and ownership
        DummyNFT nftContract = DummyNFT(currentOption.nftContract);

        require(nftContract.ownerOf(currentOption.nftId) == msg.sender,
            "Ownership of specified NFT token is under a different wallet than the caller's");

        if (nftContract.getApproved(currentOption.nftId) != address(this)) {
            revert  NFT_NOT_APPROVED({nftAddress : currentOption.nftContract, nftId : currentOption.nftId});
        }

        //  Check for time restrictions
        uint256 expirationDate = currentOption.startDate + currentOption.interval;
        if (block.timestamp > expirationDate ||
            (currentOption.flavor == OptionFlavor.EUROPEAN && (expirationDate - 1 days) > block.timestamp)
        ) {
            revert EXERCISE_WINDOW_IS_CLOSED(expirationDate);
        }

        // send collateral from escrow to buyer
        if(getBalance()  < currentOption.strikePrice){
           revert INSUFFICIENT_FUNDS();
        }
        currentOption.buyer.transfer(currentOption.strikePrice);

        // send underlying (NFT) from buyer to seller
        nftContract.transferFrom({from : msg.sender, to : currentOption.seller, tokenId : currentOption.nftId});

        // update Option state to CLOSED
        options[_optionId].state = OptionState.CLOSED;

        // emit event EXERCISED
        emit Exercised(_optionId);
    }
}
