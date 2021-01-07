// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * EtherSplitter
 * Splits transferred Ether
 */

contract EtherSplitter {
    address first;
    address second;
    IERC20 token;

    constructor(address _first, address _second, IERC20 _token) public {
        first = _first;
        second = _second;
        token = _token;
    }

    function splitToken() public {
        uint value = token.allowance(msg.sender, address(this));
        if (value == 0) {
            revert("Cannot split zero");
        }
        token.transferFrom(msg.sender, first, value / 2);
        token.transferFrom(msg.sender, second, value / 2);
    }
}
