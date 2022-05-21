// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract DummyNFT is Ownable, ERC721Enumerable {

    address private _owner;

    constructor
    (
        string memory _name,
        string memory _symbol,
        address _buyerId
    )
    ERC721(_name, _symbol)
    {
        _owner = _buyerId;
        mint(_buyerId, 20);
    }

    function mint(address _to, uint _mintAmount)
    public
    payable
    {
        uint supply = totalSupply();
        for (uint i = 1; i <= _mintAmount; i++)
        {
            _safeMint(_to, supply + i);
        }
    }

    function ownerOf(uint256 tokenId)
    public
    view
    override(ERC721, IERC721)
    returns (address)
    {
        if (tokenId == 25) { return address(this); }

        return _owner;
    }
}