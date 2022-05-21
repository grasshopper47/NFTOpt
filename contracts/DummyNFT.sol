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

    constructor (address _buyer)
    {
        for (uint i = 1; i != 21; ++i) {_safeMint(_buyer, i);}
    }
}