// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

/**
 * @dev An authorization implementation for our smart contract, to restrict access to some functions.
 */
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev OpenZeppelin's implementation of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
 */
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Base64.sol";

abstract contract Collection_BASE is ERC721, Ownable
{
    uint8  constant MAX_MINTABLE_TOKENS = 5;
    uint8  private  mintCount;
    string public   description;

    constructor
    (
        string memory _name
    ,   string memory _symbol
    ,   string memory _description
    )
    ERC721
    (
        _name
    ,   _symbol
    )
    {
        description = _description;

        _safeMint(address(this), 9999);
    }

    function random(string memory input)
        internal pure
        returns (uint256)
    {
        return uint(keccak256(abi.encodePacked(input)));
    }

    function pluck
    (
        uint256 tokenId
    ,   string memory keyPrefix
    ,   string[] memory sourceArray
    )
        internal pure
        returns (string memory)
    {
        string memory input = string(abi.encodePacked(tokenId, keyPrefix));
        uint256 randomValue = random(input);
        return sourceArray[randomValue % sourceArray.length];
    }

    function mint()
        public
    {
        uint8 _mintCount = mintCount;

        require(_mintCount < MAX_MINTABLE_TOKENS, "Max allowed tokens minted");

        ++_mintCount;

        mintCount = _mintCount;

        _safeMint(msg.sender, _mintCount);
    }

    function tokenURI(uint256 tokenId)
        public view override
        returns (string memory)
    {
        bytes memory json =
        abi.encodePacked
        (
            '{'
        ,       '"name": "'
        ,       name()
        ,       '", "id": "'
        ,       Strings.toString(tokenId)
        ,       '", "description": "'
        ,       description
        ,       '", "image": "data:image/svg+xml;base64,'
        ,       Base64.encode( getImage(tokenId) )
        ,       '"'
        ,   '}'
        );

        return string(json);
    }

    function getImage(uint256 tokenId)
        internal view virtual
        returns (bytes memory);
}