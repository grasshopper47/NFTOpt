// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Option
{
    // -- STACK  ------------------------------
    address private buyer;
    address private seller;
    address private nft;
    uint    private strike_price;
    uint    private premium_price;
    uint    private alive_date;
    uint    private expiration_date;

    // -- CONSTRUCTORS ------------------------
    constructor()
    { }

    // -- METHODS  ----------------------------
    function createOption()
    external
    {
        buyer = msg.sender;
    }

    function createCollateral()
    external
    {
        seller = msg.sender;
    }

    function getBuyer()
    external
    view
    returns (address)
    {
        return buyer;
    }

    function getSeller()
    external
    view
    returns (address)
    {
        return seller;
    }
}