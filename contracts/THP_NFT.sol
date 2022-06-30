// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./CollectionNFT_BASE.sol";

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract THP_NFT is CollectionNFT_BASE("Thomas Hepner NFT Collection", "THP_NFT")
{
    string[] private backgroundColors = ["st0", "st2"];

    string[] private logoColors = ["st0", "st1"];

    string[] private names =
    [
        "Web3 Data Economy Index"
    ,   "D4 DATA Index"
    ,   "D4 DATA Token"
    ,   "Web3 Data Index"
    ];

    string[] private projects =
    [
        "Filecoin"
    ,   "Chainlink"
    ,   "The Graph"
    ,   "Basic Attention Token"
    ,   "Livepeer"
    ,   "Ethereum Name Service"
    ,   "Ocean Protocol"
    ,   "Numeraire"
    ,   "Arweave"
    ,   "Helium"
    ,   "Handshake"
    ];

    function random(string memory input)
    internal pure returns (uint256)
    {
        return uint(keccak256(abi.encode(input)));
    }

    function pluck
    (
        uint256 tokenId
    ,   string memory keyPrefix
    ,   string[] memory sourceArray
    )
    internal pure returns (string memory)
    {
        uint randomNumber = random( string(abi.encodePacked(keyPrefix, Strings.toString(tokenId))) );

        return sourceArray[randomNumber % sourceArray.length];
    }

    function tokenURI(uint256 tokenId)
    public view override returns (string memory)
    {
        string memory logo =
        string
        (
            abi.encodePacked
            (
                '<g class="'
            ,   pluck(tokenId, "LOGO", logoColors)
            ,   '">'
            ,       '<rect x="727.5" y="298.2" width="25" height="25"/>'
            ,       '<rect x="627.5" y="298.2" width="75" height="25"/>'
            ,       '<rect x="552.5" y="223.2" width="75" height="25"/>'
            ,       '<rect x="627.5" y="398.2" width="125" height="25"/>'
            ,       '<rect x="577.5" y="423.2" width="25" height="25"/>'
            ,       '<rect x="502.5" y="223.2" width="25" height="25"/>'
            ,       '<rect x="577.5" y="373.2" width="50" height="25"/>'
            ,       '<rect x="527.5" y="373.2" width="25" height="25"/>'
            ,       '<rect x="602.5" y="448.2" width="100" height="25"/>'
            ,       '<rect x="502.5" y="473.2" width="100" height="25"/>'
            ,       '<rect x="502.5" y="323.2" width="125" height="25"/>'
            ,       '<rect x="527.5" y="273.2" width="75" height="25"/>'
            ,       '<rect x="652.5" y="348.2" width="125" height="25"/>'
            ,       '<rect x="627.5" y="248.2" width="75" height="25"/>'
            ,       '<rect x="502.5" y="423.2" width="50" height="25"/>'
            ,   '</g>'
            )
        );

        string memory output =
        string
        (
            abi.encodePacked
            (
                '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1280 720" style="enable-background:new 0 0 1280 720;" xml:space="preserve">'

            ,   '<style type="text/css">'
            ,       ' .st0 { fill:#FFFFFF; }'
            ,       ' .st1 { fill:#000000; }'
            ,       ' .st2 { fill:#FF0029; }'
            ,       ' .base { fill: black; font-family: arial; font-size: 36px; }'
            ,   '</style>'

            ,   '<rect x="-10" y="-10" class="'
            ,   pluck(tokenId, "COLOR", backgroundColors)
            ,   '" width="1300" height="740" />'

            ,   logo

            ,   '<text x="350" y="600" class="base">'
            ,   pluck(tokenId, "PROJECT", projects)
            ,   '</text>'

            ,   '<text x="490" y="100" class="base">'
            ,   pluck(tokenId, "NAME", names)
            ,   '</text>'

            ,   '</svg>'
            )
        );

        string memory json =
        Base64.encode
        (
            abi.encodePacked
            (
                '{"name": "DATA #'
            ,   Strings.toString(tokenId)
            ,   '", "description": "Web3 enables a new data economy. The Web3 data economy is an ecosystem of data-centric protocols and applications disrupting the data monopolies built in Big Tech. DATA provides exposure to the growth of the Web3 data economy in a single token.", "image": "data:image/svg+xml;base64,'
            ,   Base64.encode(bytes(output))
            ,   '"}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
