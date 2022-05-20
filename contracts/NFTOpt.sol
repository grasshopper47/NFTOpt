// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/Strings.sol";

contract NFTOpt {

    enum OptionState  { REQUEST, OPEN, CLOSED }
    enum OptionFlavor { EUROPEAN, AMERICAN }

    struct Option {
        address      buyer;
        address      seller;
        address      nftContract;
        uint32       nftId;
        uint32       startDate;
        uint32       interval;
        uint         premium;
        uint         strikePrice;
        OptionFlavor flavor;
        OptionState  state;
    }

    uint private collateralAmount;

    uint                    public optionID;
    mapping(uint => Option) public options;

    // event Received(address, uint);
    // receive() external payable
    // {
    //     emit Received(msg.sender, msg.value);
    // }

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    function publishOptionRequest
    (
        address      _nftContract
    ,   uint32       _nftId
    ,   uint         _premium
    ,   uint         _strikePrice
    ,   uint32       _interval
    ,   OptionFlavor _flavor
    )
    external
    payable
    {
        require (_nftContract != address(0)    , "NFT token contract must be a valid address");
        require (_nftId > 0                    , "NFT token ID must be > 0");
        require (_premium > 0                  , "Premium must be > 0");
        require (msg.sender.balance >= _premium, "Caller is missing required funds to supply premium amount");
        require (_strikePrice > 0              , "Strike price must be > 0");
        require (_interval > 0                 , "Expiration interval must be > 0");

        options[++optionID] =
        Option
        ({
            buyer       : msg.sender
        ,   seller      : address(0)
        ,   nftContract : _nftContract
        ,   nftId       : _nftId
        ,   startDate   : 0
        ,   interval    : _interval
        ,   premium     : _premium
        ,   strikePrice : _strikePrice
        ,   flavor      : OptionFlavor(_flavor)
        ,   state       : OptionState.REQUEST
        });

        collateralAmount += _premium;

        // (bool success,) = address(this).call{value: _premium}("");
        // require(success);
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
