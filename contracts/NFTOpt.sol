// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

contract NFTOpt {

    enum OptionState  { REQUEST, OPEN, CLOSED }
    enum OptionFlavor { EUROPEAN, AMERICAN }

    struct Option {
        address      buyer;
        address      seller;
        address      nftContract;
        uint         nftId;
        uint         startDate;
        uint         interval;
        uint         premium;
        uint         strikePrice;
        OptionFlavor flavor;
        OptionState  state;
    }

    uint                    public optionID;
    mapping(uint => Option) public options;

    event Filled(address, uint);

    function getBalance() public view returns (uint)
    {
        return address(this).balance;
    }

    function publishOptionRequest
    (
        address _nftContract
    ,   uint _nftId
    ,   uint _strikePrice
    ,   uint _interval
    ,   OptionFlavor _flavor
    )
    external
    payable
    {
        // TODO: update this with the correct implementation (wrote this here only for testing)
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
        require(options[_optionId].buyer != address(0), "Option with the specified id does not exist");
        require(options[_optionId].seller == address(0), "Option is already fulfilled by a seller");
        require(options[_optionId].state == OptionState.REQUEST, "Option is not in the request state");
        require(options[_optionId].buyer != msg.sender, "Seller is the same as buyer");
        require(address(msg.sender).balance >= options[_optionId].strikePrice, "Seller does not have enough balance");
        require(getBalance() <= options[_optionId].premium, "Not enough funds to pay the premium to the seller");

        options[_optionId].seller = msg.sender;
        options[_optionId].startDate = block.timestamp;
        options[_optionId].state = OptionState.OPEN;

        emit Filled(msg.sender, _optionId);

        (bool success,) = msg.sender.call{value: options[_optionId].premium}("");
        require(success, "Transaction failed");
    }

    function cancelOption(uint32 _optionId)
    external
    payable
    {
        // TODO: update this with the correct implementation (wrote this here only for testing)
        options[_optionId].state = OptionState.CLOSED;

    }

    function exerciseOption(uint32 _optionId)
    external
    payable
    {

    }
}
