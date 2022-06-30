// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./_BASE.sol";

contract THP_NFT is Collection_BASE("Thomas Hepner NFT Collection", "THP_NFT", "Web3 enables a new data economy: an ecosystem of data-centric protocols and applications, disrupting the data monopolies built in Big Tech.")
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

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        return abi.encodePacked
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

        ,   '<g class="'
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

        ,   '<text x="350" y="600" class="base">'
        ,   pluck(tokenId, "PROJECT", projects)
        ,   '</text>'

        ,   '<text x="490" y="100" class="base">'
        ,   pluck(tokenId, "NAME", names)
        ,   '</text>'

        ,   '</svg>'
        );
    }
}
