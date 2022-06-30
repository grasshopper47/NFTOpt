// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./CollectionNFT_BASE.sol";

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SP_NFT is CollectionNFT_BASE("Saumo Pal's Bell Collection", "SP_NFT")
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

    function random(string memory input) internal pure returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function pluck
    (
        uint256 tokenId
    ,   string memory keyPrefix
    ,   string[] memory sourceArray
    )
    internal pure returns (string memory)
    {
        string memory input = string(abi.encodePacked(tokenId, keyPrefix));
        uint256 randomValue = random(input);
        return sourceArray[randomValue % sourceArray.length];
    }

    function tokenURI(uint256 tokenId)
    override public view
    returns (string memory)
    {
        string memory output =
        string
        (
            abi.encodePacked
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
            )
        );

        string memory json =
        Base64.encode
        (
            abi.encodePacked
            (
                '{"name": "Bell #'
            ,   Strings.toString(tokenId)
            ,   '", "description": "This is a bell", "image": "data:image/svg+xml;base64,'
            ,   Base64.encode(bytes(output))
            ,   '"}'
            )
        );

        return string(abi.encodePacked('data:application/json;base64,', json));
    }
}
