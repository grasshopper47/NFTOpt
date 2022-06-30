// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "./_BASE.sol";

contract NK_NFT is Collection_BASE("Nikita's ART", "NART", "Expensive piece of art")
{
    string[] private rectColors =
    [
        "red"
    ,   "green"
    ,   "blue"
    ,   "yellow"
    ,   "orange"
    ,   "purple"
    ];

    string[] private circleColors =
    [
        "red"
    ,   "green"
    ,   "blue"
    ,   "yellow"
    ,   "orange"
    ,   "purple"
    ];

    string[] private circleSizes =
    [
        'small'
    ,   'medium'
    ,   'big'
    ];

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        string memory circleSize = pluck(tokenId + 1, 'circleSize', circleSizes);
        string memory circleStart;
        if (stringsEqual(circleSize, 'small')) {
            circleStart = '<circle cx="50" cy="75" r="5" style="fill:';
        }
        else if (stringsEqual(circleSize, 'medium')) {
            circleStart = '<circle cx="50" cy="70" r="10" style="fill:';
        }
        else {
            circleStart = '<circle cx="50" cy="60" r="20" style="fill:';
        }

        return abi.encodePacked
        (
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 100 100"><rect width="100" height="100" fill="white" />'
        ,   '<rect x="20" y="80" width="60" height="20" style="fill:'
        ,   pluck(tokenId, 'rectColor', rectColors)
        ,   '\" />'
        ,   circleStart
        ,   pluck(tokenId, 'circleColor', circleColors)
        ,   '\" />'
        ,   '</svg>'
        );
    }

    function stringsEqual(string memory s1, string memory s2)
        private pure returns (bool)
    {
        return bytes(s1).length == bytes(s2).length && keccak256(bytes(s1)) == keccak256(bytes(s2));
    }
}