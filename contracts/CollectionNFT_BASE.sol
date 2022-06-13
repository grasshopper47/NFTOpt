// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

/**
 * @dev An authorization implementation for our smart contract, to restrict access to some functions.
 */
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev OpenZeppelin's implementation of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
 */
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CollectionNFT_BASE is ERC721, Ownable
{
    uint8 private mintCount;
    uint8 public MAX_MINTABLE_TOKENS = 5;

    constructor
    (
        string memory _name
    ,   string memory _symbol
    )
    ERC721
    (
        _name
    ,   _symbol
    )
    {
        _safeMint(address(this), 9999);
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
}