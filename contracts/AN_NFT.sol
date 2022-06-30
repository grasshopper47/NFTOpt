// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./CollectionNFT_BASE.sol";

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AN_NFT is CollectionNFT_BASE("Anil N's Pokemon Collection", "AN_NFT")
{
    string[] private pokemon =
    [
        "Mimikyu"
    ,   "Charizard"
    ,   "Gengar"
    ,   "Umbreon"
    ,   "Squirtle"
    ,   "Mudkip"
    ,   "Metagross"
    ,   "Greninja"
    ,   "Celebi"
    ];

    string[] private colors =
    [
        "f6bd60"
    ,   "f7ede2"
    ,   "f5cac3"
    ,   "84a59d"
    ,   "84a59d"
    ,   "f28482"
    ,   "2ec4b6"
    ,   "669bbc"
    ,   "f1c0e8"
    ,   "355070"
    ,   "6d597a"
    ,   "e56b6f"
    ];

    function getGreyColor(uint _tokenId) private pure returns (string memory)
    {
        uint256 rand = random( string(abi.encodePacked("FONT COLOR", Strings.toString(_tokenId))) );

        return Strings.toString(rand % 256);
    }

    function random(string memory _input) internal pure returns (uint256)
    {
        return uint(keccak256(abi.encodePacked(_input)));
    }

    function pluck
    (
        uint256 _tokenId
    ,   string memory _keyPrefix
    ,   string[] memory _sourceArray
    )
    internal pure returns (string memory)
    {
        uint256 rand = random(
            string(abi.encodePacked(_keyPrefix, Strings.toString(_tokenId)))
        );

        return _sourceArray[rand % _sourceArray.length];
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory output =
        string
        (
            abi.encodePacked
            (
                '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 100 100">'

            ,   '<style>.base { fill: rgb('
            ,   getGreyColor(_tokenId)
            ,   ","
            ,   getGreyColor(_tokenId)
            ,   ","
            ,   getGreyColor(_tokenId)
            ,   '); '
            ,   'font-family: serif; font-size: 14px; }'
            ,   '</style>'

            ,   '<rect width="100" height="100" fill="#'
            ,   pluck(_tokenId, "COLOR", colors)
            ,   '"/>'

            ,   '<text x="10" y="20" class="base">'
            ,   pluck(_tokenId, "POKEMON", pokemon)
            ,   '</text>'

            ,   '</svg>'
            )
        );

        string memory json = Base64.encode
        (
            abi.encodePacked
            (
                '{"name": "Pokemon #'
            ,   Strings.toString(_tokenId)
            ,   '", "description": "Pokemon around the world are tired of working for the top 1%. Time for the Pokemon revolution!", "image": "data:image/svg+xml;base64,'
            ,   Base64.encode(bytes(output))
            ,   '"}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}