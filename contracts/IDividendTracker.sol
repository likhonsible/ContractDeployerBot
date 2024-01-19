// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IDividendTracker {
    function excludeFromDividends(address account) external;

    function setBalance(address payable account, uint256 newBalance) external;

    function process(uint256 gas) external returns (uint256, uint256, uint256);

    function distributeDividends(uint256 amount) external;

    function rewardsToken() external view returns (address);
}
