// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./_BASE.sol";

contract AN_NFT is Collection_BASE("Anil N's Pokemon Collection", "AN_NFT", "Pokemon around the world are tired of working for the top 1%. Time for the Pokemon revolution!")
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

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        uint256 rand = random( string(abi.encodePacked("FONT COLOR", Strings.toString(tokenId))) );
        string memory greyColor = Strings.toString(rand % 256);

        return abi.encodePacked
        (
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 100 100">'

        ,   '<style>'
        ,   '.base { fill: rgb(', greyColor,",",greyColor,",",greyColor,'); '
        ,   'font-family: serif; font-size: 14px; }'
        ,   '</style>'

        ,   '<rect width="100" height="100" fill="#'
        ,   pluck(tokenId, "COLOR", colors)
        ,   '"/>'

        ,   '<text x="10" y="20" class="base">'
        ,   pluck(tokenId, "POKEMON", pokemon)
        ,   '</text>'

        ,   '</svg>'
        );
    }
}