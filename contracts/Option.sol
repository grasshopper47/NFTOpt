// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Option
{
    // -- STACK  ------------------------------
    address private owner;

    // -- CONSTRUCTORS ------------------------
    constructor()
    {
        owner = msg.sender;
    }

    // -- METHODS  ----------------------------
    function sayHello()
    external
    view
    returns (string memory)
    {
        // sanity checks
        require (msg.sender == owner, "Not an owner");

        return "Hello World";
    }
}