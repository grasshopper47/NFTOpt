// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

contract NFTOpt {

    /// @notice Address do not have permission to execute action
    error INVALID_ADDRESS(address providedAddress);

    /// @notice Invalid option ID
    error INVALID_OPTION_ID(uint32 providedId);

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
        // send underlying (NFT) from buyer to seller
        // send collateral from escrow to buyer
        // update Option state to CLOSED
        // emit event EXERCISED
    }
}
