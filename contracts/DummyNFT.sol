// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

/**
 * @dev An authorization implementation for our smart contract, to restrict access to some functions.
 */
import "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @dev OpenZeppelin's implementation of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
 */
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DummyNFT is ERC721("NFT_Dummy", "A Collection of NFTs"), Ownable {

    address private _owner;

    constructor (address _buyer)
    {
        _owner = _buyer;

        for (uint i = 1; i != 21; ++i) { _safeMint(_buyer, i); }
    }

    function ownerOf(uint256 tokenId)
    public
    view
    override(ERC721)
    returns (address)
    {
        if (tokenId == 25) { return address(this); }

        return _owner;
    }
}