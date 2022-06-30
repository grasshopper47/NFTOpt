// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./_BASE.sol";

contract SP_NFT is Collection_BASE("Saumo Pal's Bell Collection", "SP_NFT", "This is a bell")
{
    string[] private bellHangerColor =
    [
        "red"
    ,   "yellow"
    ,   "orange"
    ,   "green"
    ,   "blue"
    ,   "purple"
    ];

    string[] private bellTongueColor =
    [
        "blue"
    ,   "orange"
    ,   "red"
    ,   "green"
    ,   "purple"
    ,   "yellow"
    ];

    string[] private bellColor =
    [
        "purple"
    ,   "blue"
    ,   "green"
    ,   "orange"
    ,   "yellow"
    ,   "red"
    ];

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        return abi.encodePacked
        (
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" width="200" height="200" viewBox="-100 -100 200 200">'

        ,   '<g stroke="#001514" stroke-width="2">'

        ,       '<circle cx="0" cy="-45" r="7" style="fill:'
        ,       pluck(tokenId, "bellHangerColor", bellHangerColor)
        ,       '"/>'

        ,       '<circle cx="0" cy="50" r="10" style="fill:'
        ,       pluck(tokenId, "bellColor", bellColor)
        ,       '"/>'

        ,       '<path d="M -50 40 L -50 50 L 50 50 L 50 40 Q 40 40 40 10 C 40 -60 -40 -60 -40 10 Q -40 40 -50 40" style="fill:'
        ,       pluck(tokenId, "bellTongueColor", bellTongueColor)
        ,       '"/>'

        ,   '</g>'

        ,   '</svg>'
        );
    }
}
