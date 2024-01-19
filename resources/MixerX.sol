// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

contract MixerX is Ownable, ReentrancyGuard, Pausable {
    struct DepositInfo {
        bool locked;
        uint256 amount;
        address token;
    }
    mapping(bytes32 => DepositInfo) public depositInfos;

    mapping(uint32 => uint32) public deposits;
    mapping(uint32 => uint32) public withdraws;

    uint32 public constant TIME_HISTORY_SIZE = 10;

    event Deposit(bytes32 indexed);
    event Withdrawal(bytes32 indexed, address indexed);

    constructor() {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function sig2hash(
        string memory _msg,
        bytes memory _sig
    ) private pure returns (bytes32) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
        bytes32 payloadHash = keccak256(abi.encode(_msg));
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", payloadHash)
        );
        return keccak256(abi.encode(ecrecover(messageHash, v, r, s)));
    }

    function deposit(
        bytes calldata _sig,
        address token,
        uint256 denomination
    ) external payable nonReentrant whenNotPaused {
        bytes32 _hash = sig2hash("deposit", _sig);
        require(
            !depositInfos[_hash].locked,
            "The commitment has been submitted"
        );

        if (token == address(0))
            require(
                msg.value == denomination,
                "Please send `mixDenomination` ETH along with transaction"
            );
        else {
            require(
                msg.value == 0,
                "ETH value is supposed to be 0 for ERC20 instance"
            );
            IERC20(token).transferFrom(msg.sender, address(this), denomination);
        }

        deposits[0] = deposits[0] < TIME_HISTORY_SIZE ? deposits[0] + 1 : 1;
        deposits[deposits[0]] = uint32(block.timestamp);

        depositInfos[_hash].locked = true;
        depositInfos[_hash].amount = denomination;
        depositInfos[_hash].token = token;

        emit Deposit(_hash);
    }

    function withdraw(
        bytes calldata _sig,
        address payable _recipient,
        uint256 _gas
    ) external payable nonReentrant whenNotPaused {
        bytes32 _hash = sig2hash("withdraw", _sig);
        require(
            depositInfos[_hash].locked,
            "The commitment has not been submitted"
        );

        uint256 denomination = depositInfos[_hash].amount;
        uint256 fee = (denomination - _gas) / 100;
        address token = depositInfos[_hash].token;

        if (msg.sender == _recipient) _gas = 0;
        if (token == address(0)) {
            require(
                msg.value == 0,
                "Message value is supposed to be zero for ETH instance"
            );
            require(
                address(this).balance >= denomination,
                "Insufficient balance"
            );

            (bool success, ) = _recipient.call{
                value: denomination - fee - _gas
            }("");
            require(success, "payment to _recipient did not go thru");

            if (_gas > 0) {
                (success, ) = msg.sender.call{value: _gas}("");
                require(success, "payment to _relayer did not go thru");
            }
        } else {
            require(
                IERC20(token).balanceOf(address(this)) >= denomination,
                "Insufficient balance"
            );

            IERC20(token).transfer(_recipient, denomination - fee - _gas);
            if (_gas > 0) IERC20(token).transfer(msg.sender, _gas);
        }

        withdraws[0] = withdraws[0] < TIME_HISTORY_SIZE ? withdraws[0] + 1 : 1;
        withdraws[withdraws[0]] = uint32(block.timestamp);
        depositInfos[_hash].locked = false;

        emit Withdrawal(_hash, _recipient);
    }

    function adminWithdraw(
        address token,
        address _recipient,
        uint amount
    ) public onlyOwner whenNotPaused {
        if (token == address(0)) {
            require(amount <= address(this).balance, "Insufficient balance");
            (bool success, ) = _recipient.call{value: amount}("");
            require(success, "payment to _recipient did not go thru");
        } else {
            require(
                amount <= IERC20(token).balanceOf(address(this)),
                "Insufficient balance"
            );
            IERC20(token).transfer(_recipient, amount);
        }
    }
}
