// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

/// @dev OpenZeppelin's interface of EIP-721 https://eips.ethereum.org/EIPS/eip-721.
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

library InterfaceDetector {

    function implements_ERC721_ownerOf(address _self)
    external
    returns (bool)
    {
        /// @dev Testing by trying to call two methods: ownerOf, getApproved
        ///      Sent with 0 gas, expecting error, so as to avoid incurring extra costs

        bool _error;

        bytes memory data =
        abi.encodeWithSelector
        (
            bytes4(keccak256("ownerOf(uint256)"))   // encoded method name and comma-separated list of parameter types
        ,   0                                       // values for parameters
        );

        assembly
        {
            _error := call
            (
                0,              // gas remaining
                _self,          // destination address
                0,              // no value
                add(data, 32),  // input buffer (starts after the first 32 bytes in the `data` array)
                mload(data),    // input length (loaded from the first 32 bytes in the `data` array)
                0,              // output buffer
                0               // output length
            )
        }

        return !_error;
    }

    function implements_ERC721_getApproved(address _self)
    external
    returns (bool)
    {
        bool _error;

        bytes memory data =
        abi.encodeWithSelector
        (
            bytes4(keccak256("getApproved(uint256)"))
        ,   0
        );

        assembly { _error := call(0, _self, 0, add(data, 32), mload(data), 0, 0) }

        return !_error;
    }

    function implements_ERC721_transferFrom(address _self)
    external
    returns (bool)
    {
        bool _error;

        bytes memory data =
        abi.encodeWithSelector
        (
            bytes4(keccak256("transferFrom(address, address, uint256)"))
        ,   0, 0, 0
        );

        assembly { _error := call(0, _self, 0, add(data, 32), mload(data), 0, 0) }

        return !_error;
    }
}