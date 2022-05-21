// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract NFTOpt {

    enum OptionState  { REQUEST, OPEN, CLOSED }
    enum OptionFlavor { EUROPEAN, AMERICAN }

    struct Option {
        address      buyer;
        address      seller;
        address      nftContract;
        uint         nftId;
        uint         startDate;
        uint         expirationInterval;
        uint         premium;
        uint         strikePrice;
        OptionFlavor flavor;
        OptionState  state;
    }

    uint32  private optionID;
    uint256 private collateralAmount;

    mapping(uint => Option) public options;

    function publishOptionRequest
    (
        address _nftContract
    ,   uint _nftId
    ,   uint _premium
    ,   uint _strikePrice
    ,   OptionFlavor _flavor
    )
    external
    payable
    {

    }

    function withdrawOptionRequest(uint32 _optionId)
    external
    payable
    {
        require (options[_optionId].buyer == msg.sender , "Only buyer can withdraw option request");
        options[_optionId].state = OptionState.CLOSED;
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
