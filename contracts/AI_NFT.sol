// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./CollectionNFT_BASE.sol";

contract AI_NFT is CollectionNFT_BASE("Anupriya Inumella's Melon Collection", "AI_NFT", "This is a watermelon")
{
    string[] private bodyColour =
    [
        "red"
    ,   "yellow"
    ,   "green"
    ,   "blue"
    ,   "orange"
    ,   "purple"
    ];

    string[] private firstBaseLayerColour =
    [
        "red"
    ,   "yellow"
    ,   "green"
    ,   "blue"
    ,   "orange"
    ,   "purple"
    ];

    string[] private secondBaseLayerColour =
    [
        "red"
    ,   "yellow"
    ,   "green"
    ,   "blue"
    ,   "orange"
    ,   "purple"
    ];

    function createSeed(string memory x, string memory y)
        private pure
        returns (string memory)
    {
        return
        string
        (
            abi.encodePacked
            (
                '<ellipse style="fill:#563824;" cx="'
            ,   x
            ,   '" cy="'
            ,   y
            ,   '" rx="12.307" ry="21.949"/>'
            )
        );
    }

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        return abi.encodePacked
        (
            '<svg xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="xMinYMin meet" viewBox="0 0 511.998 511.998">'

        ,   '<g>'
        ,       '<path style="fill:'
        ,           pluck(tokenId, "bodyColour", bodyColour)
        ,           '" d="M471.734,441.241L276.208,14.207c-8.696-18.999-35.71-18.926-44.31,0.116L39.104,441.241H471.734z"/>'

        ,       '<polygon style="fill:'
        ,           pluck(tokenId, "firstBaseLayerColour", firstBaseLayerColour)
        ,           '" points="39.104,441.241 471.734,441.241 480.36,460.947 30.534,460.947"/>'

        ,       '<path style="fill:'
        ,           pluck(tokenId, "secondBaseLayerColour", secondBaseLayerColour)
        ,           '" d="M30.534,460.947l-12.165,24.575c-6.034,12.188,2.835,26.477,16.436,26.477H477.19c13.891,0,22.739-14.843,16.134-27.057l-12.968-23.994H30.534z"/>'
        ,   '</g>'

            '<g>'
        ,       createSeed("262.51", "114.534")
        ,       createSeed("301.377", "202.667")
        ,       createSeed("261.547", "245.782")
        ,       createSeed("227.261", "268.591")
        ,       createSeed("343.032", "290.523")
        ,       createSeed("214.947", "180.727")
        ,       createSeed("173.624", "290.523")
        ,       createSeed("273.861", "334.435")
        ,   '</g>'

        ,   '</svg>'
        );
    }
}
