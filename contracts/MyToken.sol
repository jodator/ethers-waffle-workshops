// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract MyToken is IERC20 {
    using SafeMath for uint;
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowances;
    uint total;

    constructor(uint _initialBalance) public {
        total = _initialBalance;
        balances[msg.sender] = _initialBalance;
    }

    event Transfer(address sender, address recipient, uint amount);

    function totalSupply() external view override returns (uint256) {
        revert('Not Implemented');
    }

    function balanceOf(address account) external view override returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);

        return true;
    }

    function allowance(address owner, address spender) external override view returns (uint256) {
        return allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowances[msg.sender][spender] = amount;

        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external override returns (bool) {
        _transfer(sender, recipient, amount);

        return true;
    }

    function _transfer(address sender, address recipient, uint amount) private {
        require(recipient != address(0), 'Cannot transfer to address zero');
        balances[sender] = balances[sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);

        emit Transfer(msg.sender, recipient, amount);
    }
}
