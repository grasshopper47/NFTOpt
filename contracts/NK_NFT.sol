// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "./CollectionNFT_BASE.sol";

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract NK_NFT is CollectionNFT_BASE("Nikita's ART", "NART")
{
    string[] private rectColors = [
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple"
    ];

    string[] private circleColors = [
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple"
    ];

    string[] private circleSizes = [
    'small',
    'medium',
    'big'
    ];

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function pluck(uint256 tokenId, string memory keyPrefix, string[] memory sourceArray) internal pure returns (string memory) {
        string memory input = string(abi.encodePacked(keyPrefix, Strings.toString(tokenId)));
        return sourceArray[random(input) % sourceArray.length];
    }

    function getCircleColor(uint256 tokenId) internal view returns (string memory) {
        return pluck(tokenId, 'circleColor', circleColors);
    }

    function getRectColor(uint256 tokenId) internal view returns (string memory) {
        return pluck(tokenId, 'rectColor', rectColors);
    }

    function getCircleSize(uint256 tokenId) internal view returns (string memory) {
        return pluck(tokenId, 'circleSize', circleSizes);
    }

    function tokenURI(uint256 tokenId) override public view returns (string memory) {
        string memory svgStart = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 100 100"><rect width="100" height="100" fill="white" />';

        string memory rectStart = '<rect x="20" y="80" width="60" height="20" style="fill:';
        string memory rectColor = getRectColor(tokenId);
        string memory rectEnd = '\" />';

        string memory circleSize = getCircleSize(tokenId);
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
        string memory circleColor = getCircleColor(tokenId);
        string memory circleEnd = '\" />';
        string memory svgEnd = '</svg>';

        string memory image = string(abi.encodePacked(svgStart, rectStart, rectColor, rectEnd, circleStart, circleColor, circleEnd, svgEnd));
        string memory metadata = string(abi.encodePacked('{"name": "Art #', Strings.toString(tokenId), '", "description": "Expensive piece of art", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(image)), '"}'));

        return string(abi.encodePacked('data:application/json;base64,', Base64.encode(bytes(metadata))));
    }

    function stringsEqual(string memory s1, string memory s2) private pure returns (bool) {
        return bytes(s1).length == bytes(s2).length && keccak256(bytes(s1)) == keccak256(bytes(s2));
    }
}