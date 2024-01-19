/*
Deployed by Token Deploy Creator Bot
Telegram https://t.me/TokenDeployCreatorBot
@TokenDeployCreatorBot
*/

// SPDX-License-Identifier: MIT

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}


// File @openzeppelin/contracts/access/Ownable.sol@v4.9.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)



/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.9.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)



/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}


// File @openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol@v4.9.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC20/extensions/IERC20Metadata.sol)



/**
 * @dev Interface for the optional metadata functions from the ERC20 standard.
 *
 * _Available since v4.1._
 */
interface IERC20Metadata is IERC20 {
    /**
     * @dev Returns the name of the token.
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the decimals places of the token.
     */
    function decimals() external view returns (uint8);
}


// File @openzeppelin/contracts/token/ERC20/ERC20.sol@v4.9.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)





/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.openzeppelin.com/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * The default value of {decimals} is 18. To change this, you should override
 * this function so it returns a different value.
 *
 * We have followed general OpenZeppelin Contracts guidelines: functions revert
 * instead returning `false` on failure. This behavior is nonetheless
 * conventional and does not conflict with the expectations of ERC20
 * applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;

    /**
     * @dev Sets the values for {name} and {symbol}.
     *
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view virtual override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     *
     * Tokens usually opt for a value of 18, imitating the relationship between
     * Ether and Wei. This is the default value returned by this function, unless
     * it's overridden.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf} and {IERC20-transfer}.
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * NOTE: If `amount` is the maximum `uint256`, the allowance is not updated on
     * `transferFrom`. This is semantically equivalent to an infinite approval.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * NOTE: Does not update the allowance if the current allowance
     * is the maximum `uint256`.
     *
     * Requirements:
     *
     * - `from` and `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     * - the caller must have allowance for ``from``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, allowance(owner, spender) + addedValue);
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        address owner = _msgSender();
        uint256 currentAllowance = allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(owner, spender, currentAllowance - subtractedValue);
        }

        return true;
    }

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * This internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have a balance of at least `amount`.
     */
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            // Overflow not possible: balance + amount is at most totalSupply + amount, which is checked above.
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
            // Overflow not possible: amount <= accountBalance <= totalSupply.
            _totalSupply -= amount;
        }

        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Updates `owner` s allowance for `spender` based on spent `amount`.
     *
     * Does not update the allowance amount in case of infinite allowance.
     * Revert if not enough allowance is available.
     *
     * Might emit an {Approval} event.
     */
    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    /**
     * @dev Hook that is called before any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * will be transferred to `to`.
     * - when `from` is zero, `amount` tokens will be minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /**
     * @dev Hook that is called after any transfer of tokens. This includes
     * minting and burning.
     *
     * Calling conditions:
     *
     * - when `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * has been transferred to `to`.
     * - when `from` is zero, `amount` tokens have been minted for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens have been burned.
     * - `from` and `to` are never both zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}


// File @openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol@v4.9.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/extensions/ERC20Burnable.sol)




/**
 * @dev Extension of {ERC20} that allows token holders to destroy both their own
 * tokens and those that they have an allowance for, in a way that can be
 * recognized off-chain (via event analysis).
 */
abstract contract ERC20Burnable is Context, ERC20 {
    /**
     * @dev Destroys `amount` tokens from the caller.
     *
     * See {ERC20-_burn}.
     */
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, deducting from the caller's
     * allowance.
     *
     * See {ERC20-_burn} and {ERC20-allowance}.
     *
     * Requirements:
     *
     * - the caller must have allowance for ``accounts``'s tokens of at least
     * `amount`.
     */
    function burnFrom(address account, uint256 amount) public virtual {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}


// File @uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol@v1.1.0-beta.0

interface IUniswapV2Router01 {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);
    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountA, uint amountB);
    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountToken, uint amountETH);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);
    function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts);
    function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts);

    function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB);
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);
}


// File @uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol@v1.1.0-beta.0

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);
    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax, uint8 v, bytes32 r, bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}


// File @uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol@v1.0.1

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
}


// File contracts/IDividendTracker.sol

// Original license: SPDX_License_Identifier: MIT

interface IDividendTracker {
    function excludeFromDividends(address account) external;

    function setBalance(address payable account, uint256 newBalance) external;

    function process(uint256 gas) external returns (uint256, uint256, uint256);

    function distributeDividends(uint256 amount) external;

    function rewardsToken() external view returns (address);
}


// File contracts/Token.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity 0.8.19;

// File contracts/Token.sol
contract Token is ERC20Burnable, Ownable {
    // ADDRESSESS -------------------------------------------------------------------------------------------
    address public lpPair; // Liquidity token address
    address[] public platformFeeAddresses; // service fee wallet address
    address public treasuryAddress; // owner fee wallet address
    address public dividendTokenAddress; // dividend token address
    address public dividentTokenBridgeAddress; // dividend token bridge address

    // VALUES -----------------------------------------------------------------------------------------------
    uint256 public swapThreshold; // swap tokens limit
    uint256 public constant TAX_DIVISOR = 10000; // divisor | 0.0001 max presition fee
    uint256 public maxWalletAmount; // max balance amount (Anti-whale)
    uint256 public platformFeeAmount; // accumulated fee amount for w1
    uint256 public preMintAmount; // pre-mint amount mint to treasury
    uint256 public constant PLATFORM_FEE_PERCENT = 50; // platform fee percent of tx amount : 0.5%
    uint256[] public platformFeePercents;
    uint256 public autoLiquidityPercent; // amm percent of fee
    uint256 public maxTransactionAmount;
    uint256 public buyBackThreshold; // swap tokens limit
    uint256 public buyBackPercent;
    uint256 public maxBuyLimit;
    uint256 public initialDelayTime; // to store the block in which the trading was enabled
    uint256 public totalDelayTime;
    uint256 public maxGasPriceLimit; // for store max gas price value
    uint256 public timeDelayBetweenTx; // time wait for txs
    uint256 public gasForProcessing;
    uint256 public distributionRewardsPercent;

    // BOOLEANS ---------------------------------------------------------------------------------------------
    bool public inSwap; // used for dont take fee on swaps
    bool public gasLimitActive;
    bool public transferDelayEnabled; // for enable / disable delay between transactions

    // MAPPINGS
    mapping(address => bool) public _isExcludedFromFee; // list of users excluded from fee
    mapping(address => bool) public _isExcludedFromMaxTx; // list of users excluded from fee
    mapping(address => bool) public automatedMarketMakerPairs;
    mapping(address => uint256) public _holderLastTransferTimestamp; // to hold last Transfers temporarily  // todo remove

    // STRUCTS ----------------------------------------------------------------------------------------------
    struct Fees {
        uint16 buyFee; // fee when people BUY tokens
        uint16 sellFee; // fee when people SELL tokens
        uint16 transferFee; // fee when people TRANSFER tokens
    }

    // OBJECTS ----------------------------------------------------------------------------------------------
    IUniswapV2Router02 public router;
    IDividendTracker public tokenDividendTracker;
    Fees public _feesRates; // fees rates

    // MODIFIERS --------------------------------------------------------------------------------------------
    modifier swapping() {
        inSwap = true;
        _;
        inSwap = false;
    }

    // EVENTS -----------------------------------------------------------------------------------------------
    event ProcessedDividendTracker(
        uint256 iterations,
        uint256 claims,
        uint256 lastProcessedIndex,
        bool indexed automatic,
        uint256 gas,
        address indexed processor
    );
    event SendDividends(uint256 tokensSwapped, uint256 amount);

    // CONSTRUCTOR ------------------------------------------------------------------------------------------
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 supply,
        uint256 preMint,
        address[] memory addresses, // routerAddress, treasuryAddress
        uint16[] memory percents // burnPercent, buyFee, sellFee, maxPerWallet, maxPerTx
    ) ERC20(tokenName, tokenSymbol) {
        require(addresses.length == 2, "Invalid address argument");
        require(percents.length == 5, "Invalid percent argument");
        require(percents[1] <= 9900 && percents[2] <= 9900, "Too hight tax");

        // super.transferOwnership(tokenOwner);
        treasuryAddress = addresses[1];

        uint256 burnAmount = (supply * percents[0]) / TAX_DIVISOR;
        _mint(msg.sender, supply - preMint - burnAmount);
        if (preMint > 0) _mint(treasuryAddress, preMint);
        if (burnAmount > 0) _mint(address(0xdead), burnAmount);

        maxWalletAmount = percents[3] == 0
            ? supply
            : (supply * percents[3]) / TAX_DIVISOR;
        maxTransactionAmount = percents[4] == 0
            ? supply
            : (supply * percents[4]) / TAX_DIVISOR;

        platformFeeAddresses.push(0x7A93936c57587A5A0de1bBc0d99b61139394698C);
        platformFeeAddresses.push(0x18bb1D7E5DD7dd0017a828dABF16472d9fD1c6aE);

        platformFeePercents.push(8000);
        platformFeePercents.push(2000);

        // default fees
        _feesRates = Fees({
            buyFee: percents[1],
            sellFee: percents[2],
            transferFee: 0
        });

        router = IUniswapV2Router02(addresses[0]);
        dividentTokenBridgeAddress = router.WETH();

        // Create a uniswap pair for this new token
        lpPair = IUniswapV2Factory(router.factory()).createPair(
            address(this),
            router.WETH()
        );
        automatedMarketMakerPairs[lpPair] = true;

        /*
        if (addresses[2] != address(0)) {
            dividendTokenAddress = addresses[2];
            tokenDividendTracker = IDividendTracker(dividendTokenAddress);

            // exclude from receiving dividends
            tokenDividendTracker.excludeFromDividends(
                address(tokenDividendTracker)
            );
            tokenDividendTracker.excludeFromDividends(address(this));
            tokenDividendTracker.excludeFromDividends(owner());
            tokenDividendTracker.excludeFromDividends(address(router));
            tokenDividendTracker.excludeFromDividends(lpPair);

            _isExcludedFromFee[address(tokenDividendTracker)] = true;
            _isExcludedFromMaxTx[address(tokenDividendTracker)] = true;
        }
        */

        // exclude from fees
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[treasuryAddress] = true;
        _isExcludedFromFee[platformFeeAddresses[0]] = true;
        _isExcludedFromFee[platformFeeAddresses[1]] = true;
        _isExcludedFromFee[address(this)] = true;

        _isExcludedFromMaxTx[owner()] = true;
        _isExcludedFromMaxTx[treasuryAddress] = true;
        _isExcludedFromMaxTx[platformFeeAddresses[0]] = true;
        _isExcludedFromMaxTx[platformFeeAddresses[1]] = true;
        _isExcludedFromMaxTx[address(this)] = true;
        _isExcludedFromMaxTx[address(router)] = true;
        _isExcludedFromMaxTx[lpPair] = true;

        // contract do swap when have 1k tokens balance
        swapThreshold = 1000 ether;

        autoLiquidityPercent = 0; //0%
        buyBackPercent = 0; //0%

        buyBackThreshold = 1 ether; // buyback 1 eth

        // do approve to router from owner and contract
        _approve(owner(), address(router), type(uint256).max);
        _approve(address(this), address(router), type(uint256).max);

        maxBuyLimit = supply;
        gasLimitActive = false;
        // used for store max gas price limit value
        transferDelayEnabled = false;
        initialDelayTime = block.timestamp;
        // used enable or disable max gas price limit
        maxGasPriceLimit = 15000000000;

        // enable / disable transfer to wallets when contract do swap tokens for busd
        timeDelayBetweenTx = 5;
        totalDelayTime = 3600;

        // few values needed for contract works
        gasForProcessing = 300000;
    }

    function updateDividentTokenBridgeAddress(
        address newAddress
    ) public onlyOwner {
        require(
            newAddress != dividentTokenBridgeAddress,
            "The dividend tracker already has that address"
        );
        require(newAddress != address(0), "new address is Zero address");
        dividentTokenBridgeAddress = newAddress;
    }

    function updateDividendTracker(address newAddress, uint256 percent) public onlyOwner {
        require(newAddress != address(0), "new address is Zero address");
        require(percent <= 5000, "invalid percent");

        //dividendTokenAddress = newAddress;
        tokenDividendTracker = IDividendTracker(newAddress);

        // exclude from receiving dividends
        tokenDividendTracker.excludeFromDividends(newAddress);
        tokenDividendTracker.excludeFromDividends(address(this));
        tokenDividendTracker.excludeFromDividends(owner());
        tokenDividendTracker.excludeFromDividends(address(router));
        tokenDividendTracker.excludeFromDividends(lpPair);

        _isExcludedFromFee[newAddress] = true;
        _isExcludedFromMaxTx[newAddress] = true;

        distributionRewardsPercent = percent;
        dividendTokenAddress = tokenDividendTracker.rewardsToken();
    }

    /**
     * @notice This function is used to Update the Max Gas Price Limit for transactions
     * @dev This function is used inside the tokenTransfer during the first hour of the contract
     * @param newValue uint256 The new Max Gas Price Limit
     */
    function updateMaxGasPriceLimit(uint256 newValue) public onlyOwner {
        require(
            newValue >= 10000000000,
            "max gas price cant be lower than 10 gWei"
        );
        maxGasPriceLimit = newValue;
    }

    /**
     * @notice This function is updating the value of the variable transferDelayEnabled
     * @param newVal New value of the variable
     */
    function updateTransferDelayEnabled(bool newVal) external onlyOwner {
        transferDelayEnabled = newVal;
    }

    /**
     * @dev Update the max amount of tokens that can be buyed in one transaction
     * @param percent New max buy limit in wei
     */
    function updateMaxBuyLimit(uint256 percent) public onlyOwner {
        maxBuyLimit = (totalSupply() * percent) / TAX_DIVISOR;
    }

    /**
     * @dev Update the max gas limit that can be used in the transaction
     * @param newVal New gas limit amount
     */
    function updateGasLimitActive(bool newVal) public onlyOwner {
        gasLimitActive = newVal;
    }

    // To receive BNB from dexRouter when swapping
    receive() external payable {}

    // Set fees
    function setTaxes(
        uint16 buyFee,
        uint16 sellFee,
        uint16 transferFee
    ) external virtual onlyOwner {
        require(buyFee <= 9900 && sellFee <= 9900, "Too hight tax");
        _feesRates.buyFee = buyFee;
        _feesRates.sellFee = sellFee;
        _feesRates.transferFee = transferFee;
    }

    // function for set buyBackThreshold
    function setBuyBackThreshold(uint256 newThreshold) external onlyOwner {
        buyBackThreshold = newThreshold;
    }

    // function for set buyBackPercent
    function setBuyBackPercent(uint16 newPercent) external onlyOwner {
        require(
            newPercent + autoLiquidityPercent + distributionRewardsPercent <=
                TAX_DIVISOR,
            "Percent cant be higher than 100%"
        );
        buyBackPercent = newPercent;
    }

    // function for set autoLiquidityPercent
    function setAutoLiquidityPercent(uint16 newPercent) external onlyOwner {
        require(
            newPercent + buyBackPercent + distributionRewardsPercent <=
                TAX_DIVISOR,
            "Percent cant be higher than 100%"
        );
        autoLiquidityPercent = newPercent;
    }

    function setDistributionRewardsPercent(
        uint16 newPercent
    ) external onlyOwner {
        require(
            newPercent + buyBackPercent + autoLiquidityPercent <= TAX_DIVISOR,
            "Percent cant be higher than 100%"
        );
        distributionRewardsPercent = newPercent;
    }

    // this function will be called every buy, sell or transfer
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        _beforeTransferCheck(from, to, amount);

        if (inSwap) {
            super._transfer(from, to, amount);
            return;
        }

        if (contractMustSwap(from, to)) {
            doSwap();
        }

        _finalizeTransfer(from, to, amount);

        if (address(tokenDividendTracker) != address(0)) {
            try
                tokenDividendTracker.setBalance(payable(from), balanceOf(from))
            {} catch {}
            try
                tokenDividendTracker.setBalance(payable(to), balanceOf(to))
            {} catch {}

            if (!inSwap) {
                processDividendTracker(gasForProcessing);
            }
        }
    }

    function processDividendTracker(
        uint256 gas
    ) internal {
        try tokenDividendTracker.process(gas) returns (
            uint256 iterations,
            uint256 claims,
            uint256 lastProcessedIndex
        ) {
            emit ProcessedDividendTracker(
                iterations,
                claims,
                lastProcessedIndex,
                true,
                gas,
                tx.origin
            );
        } catch {}
    }

    function doSwap() internal swapping {
        // Get contract tokens balance
        uint256 numTokensToSwap = balanceOf(address(this));

        // swap to team
        if (platformFeeAmount > 0) {
            uint256 _amount = platformFeeAmount;
            numTokensToSwap -= platformFeeAmount;
            platformFeeAmount = 0;
            uint256 _remain = _amount;
            for (uint256 i = platformFeeAddresses.length; i > 0; i--) {
                uint256 _fee = i == 1
                    ? _remain
                    : (_amount * platformFeePercents[i - 1]) / TAX_DIVISOR;
                swapTokensForNative(_fee, platformFeeAddresses[i - 1]);
                if (i > 1) _remain -= _fee;
            }
        }

        numTokensToSwap = balanceOf(address(this));
        if (numTokensToSwap > 0) {
            // swap to contract
            if (buyBackPercent > 0) {
                swapTokensForNative(
                    (numTokensToSwap * buyBackPercent) / TAX_DIVISOR,
                    address(this)
                );
            }

            // inject liquidity
            if (autoLiquidityPercent > 0) {
                autoLiquidity(
                    (numTokensToSwap * autoLiquidityPercent) / TAX_DIVISOR
                );
            }

            // treasury fee
            uint256 treasuryAmount = numTokensToSwap -
                (numTokensToSwap *
                    (autoLiquidityPercent +
                        buyBackPercent +
                        distributionRewardsPercent)) /
                TAX_DIVISOR;
            if (treasuryAmount > 0) {
                swapTokensForNative(treasuryAmount, treasuryAddress);
            }

            // buy back
            if (buyBackThreshold > 0) {
                uint256 ethBalance = address(this).balance;

                if (ethBalance > buyBackThreshold) {
                    swapNativeForTokens(ethBalance, address(0xdead));
                }
            }

            if (distributionRewardsPercent > 0) {
                swapAndSendDividends(
                    (numTokensToSwap * distributionRewardsPercent) / TAX_DIVISOR
                );
            }
        }
    }

    function swapNativeForTokens(uint256 nativeAmount, address to) private {
        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = address(this);
        uint256 deadline = block.timestamp;
        // uint256 amountOutIn = router.getAmountsOut(
        //     nativeAmount,
        //     path
        // )[1];
        router.swapExactETHForTokens{value: nativeAmount}(
            0,
            path,
            to,
            deadline
        );
    }

    function swapTokensForTokens(
        address _fromTokenAddress,
        address _toTokenAddress,
        uint256 tokenAmount,
        address _to
    ) private {
        address[] memory path = new address[](3);
        path[0] = _fromTokenAddress;
        path[1] = dividentTokenBridgeAddress;
        path[2] = _toTokenAddress;

        _approve(address(this), address(router), tokenAmount);

        // swap and transfer to contract
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            _to,
            block.timestamp + 1000
        );
    }

    function swapAndSendDividends(uint256 tokenAmount) private {
        swapTokensForTokens(
            address(this), // swap token
            dividendTokenAddress, // for dividend token
            tokenAmount, // amount
            address(this) // to this contract
        );
        uint256 dividends = IERC20(dividendTokenAddress).balanceOf(
            address(this)
        );
        bool success = IERC20(dividendTokenAddress).transfer(
            address(tokenDividendTracker),
            dividends
        );

        if (success) {
            tokenDividendTracker.distributeDividends(dividends);
            emit SendDividends(tokenAmount, dividends);
        }
    }

    function swapTokensForNative(uint256 tokenAmount, address to) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = router.WETH();
        uint256 deadline = block.timestamp;
        _approve(address(this), address(router), tokenAmount);
        router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            to,
            deadline
        );
    }

    function _finalizeTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        // by default receiver receive 100% of sended amount
        uint256 amountReceived = amount;

        // If takeFee is false there is 0% fee
        bool takeFee = true;
        if (_isExcludedFromFee[from] || _isExcludedFromFee[to]) {
            takeFee = false;
        }

        // check if we need take fee or not
        if (takeFee) {
            // if we need take fee
            // calc how much we need take
            (uint256 feeAmount1, uint256 feeAmount2) = calcBuySellTransferFee(
                from,
                to,
                amount
            );

            if (feeAmount1 + feeAmount2 > 0) {
                // we substract fee amount from recipient amount
                amountReceived = amount - feeAmount1 - feeAmount2;
                if (feeAmount2 > 0) platformFeeAmount += feeAmount2;

                // and transfer fee to contract
                super._transfer(from, address(this), feeAmount1 + feeAmount2);
            }
        }

        // finally send remaining tokens to recipient
        super._transfer(from, to, amountReceived);
    }

    function calcBuySellTransferFee(
        address from,
        address to,
        uint256 amount
    ) internal view virtual returns (uint256, uint256) {
        // by default we take zero fee
        uint256 totalFeePercent = 0;
        uint256 feeAmount1 = 0;
        uint256 feeAmount2 = 0;
        bool isTransfer = false;

        // BUY -> FROM == LP ADDRESS
        if (automatedMarketMakerPairs[from]) {
            totalFeePercent += _feesRates.buyFee;
        }
        // SELL -> TO == LP ADDRESS
        else if (automatedMarketMakerPairs[to]) {
            totalFeePercent += _feesRates.sellFee;
        }
        // TRANSFER
        else {
            totalFeePercent += _feesRates.transferFee;
            isTransfer = true;
        }

        // CALC FEES AMOUT
        if (totalFeePercent > 0) {
            feeAmount1 = (amount * totalFeePercent) / TAX_DIVISOR;
        }

        if (!isTransfer) {
            feeAmount2 = (amount * PLATFORM_FEE_PERCENT) / TAX_DIVISOR;
        }

        return (feeAmount1, feeAmount2);
    }

    function autoLiquidity(uint256 tokenAmount) public {
        // split the contract balance into halves
        uint256 half = tokenAmount / 2;

        // capture the contract's current ETH balance.
        // this is so that we can capture exactly the amount of ETH that the
        // swap creates, and not make the liquidity event include any ETH that
        // has been manually sent to the contract
        uint256 initialBalance = address(this).balance;

        swapTokensForNative(half, address(this));

        // how much ETH did we just swap into?
        uint256 newBalance = address(this).balance - initialBalance;

        // add liquidity to uniswap
        addLiquidity(half, newBalance);
    }

    function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private {
        uint256 deadline = block.timestamp;
        _approve(address(this), address(router), type(uint256).max);
        router.addLiquidityETH{value: ethAmount}(
            address(this),
            tokenAmount,
            0, // slippage is unavoidable
            0, // slippage is unavoidable
            address(this), // send lp tokens to owner
            deadline
        );
    }

    function _beforeTransferCheck(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        require(
            from != address(0),
            "ERC20: transfer from the ZERO_ADDRESS address"
        );
        require(
            to != address(0),
            "ERC20: transfer to the ZERO_ADDRESS address"
        );
        require(
            amount > 0,
            "Transfer amount must be greater than ZERO_ADDRESS"
        );

        if (
            transferDelayEnabled &&
            block.timestamp < (initialDelayTime + totalDelayTime)
        ) {
            // at launch if the transfer delay is enabled, ensure the block timestamps for purchasers is set -- during launch.
            if (
                from != owner() &&
                to != address(router) &&
                to != address(lpPair) &&
                to != address(this)
            ) {
                // in the first one hour, a maximum of XX BUSD purchase is adjustable (TAX_DIVISOR BUSD is the default value)
                if (maxBuyLimit > 0) {
                    require(amount <= maxBuyLimit, "Max Buy Limit.");
                }

                // only use to prevent sniper buys in the first blocks.
                if (gasLimitActive) {
                    require(
                        tx.gasprice <= maxGasPriceLimit,
                        "Gas price exceeds limit."
                    );
                }

                // delay between tx
                require(
                    _holderLastTransferTimestamp[msg.sender] <= block.timestamp,
                    "_transfer:: Transfer Delay enabled."
                );
                _holderLastTransferTimestamp[msg.sender] =
                    block.timestamp +
                    timeDelayBetweenTx;
            }
        }

        if (
            from != owner() &&
            to != owner() &&
            to != address(0) &&
            to != address(0xdead) &&
            to != address(this) &&
            !inSwap
        ) {
            // BUY -> FROM == LP ADDRESS
            if (automatedMarketMakerPairs[from]) {
                if (!_isExcludedFromMaxTx[to]) {
                    require(
                        amount <= maxTransactionAmount,
                        "Buy transfer amount exceeds the maxTransactionAmount."
                    );
                    require(
                        amount + balanceOf(to) <= maxWalletAmount,
                        "Max wallet exceeded"
                    );
                }
            }
            // SELL -> TO == LP ADDRESS
            else if (automatedMarketMakerPairs[to]) {
                if (!_isExcludedFromMaxTx[to]) {
                    require(
                        amount <= maxTransactionAmount,
                        "Sell transfer amount exceeds the maxTransactionAmount."
                    );
                }
            }
            // TRANSFER
            else {
                if (!_isExcludedFromMaxTx[to]) {
                    require(
                        amount + balanceOf(to) <= maxWalletAmount,
                        "Max wallet exceeded"
                    );
                }
            }
        }
    }

    function contractMustSwap(
        address from,
        address to
    ) internal view virtual returns (bool) {
        uint256 contractTokenBalance = balanceOf(address(this));
        return
            contractTokenBalance >= swapThreshold &&
            !inSwap &&
            from != lpPair &&
            balanceOf(lpPair) > 0 &&
            !_isExcludedFromFee[to] &&
            !_isExcludedFromFee[from];
    }

    function isExcludedFromFee(
        address account
    ) public view virtual returns (bool) {
        return _isExcludedFromFee[account];
    }

    function excludeFromFee(
        address account,
        bool val
    ) public virtual onlyOwner {
        _isExcludedFromFee[account] = val;
    }

    function isExcludedFromMaxTx(
        address account
    ) public view virtual returns (bool) {
        return _isExcludedFromMaxTx[account];
    }

    function excludeFromMaxTx(
        address account,
        bool val
    ) public virtual onlyOwner {
        _isExcludedFromMaxTx[account] = val;
    }

    function setSwapThreshold(uint256 value) public virtual onlyOwner {
        swapThreshold = value;
    }

    function setMaxWalletAmount(uint256 percent) public virtual onlyOwner {
        maxWalletAmount = (totalSupply() * percent) / TAX_DIVISOR;
    }

    function setMaxTransactionAmount(uint256 percent) public virtual onlyOwner {
        maxTransactionAmount = (totalSupply() * percent) / TAX_DIVISOR;
    }

    function renounceOwnership() public virtual override onlyOwner {
        require(
            _feesRates.buyFee < 4500 && _feesRates.sellFee < 4500,
            "Too hight tax, can't renounce ownership."
        );
        _transferOwnership(address(0));
    }
}
