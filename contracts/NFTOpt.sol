// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract NFTOpt {

    enum OptionState { REQUEST, OPEN, CLOSED }

    struct Option {
        address     buyer;
        address     seller;
        address     nftContract;
        uint        nftId;
        uint        startDate;
        uint        expirationInterval;
        uint        premium;
        uint        strikePrice;
        bool        isEuropean; // false = isAmerican
        OptionState state;
    }

    uint32 private optionID;
    mapping(uint => Option) public options;

    function createOptionRequest(address _nftContract, uint _nftId, uint _premium, uint _strikePrice, bool _isEuropean)
    external
    payable
    {

    }

    function cancelOptionRequest(uint32 _optionId)
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
