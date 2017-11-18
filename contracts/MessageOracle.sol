pragma solidity ^0.4.15;

contract MessageOracle {

    /* Events - START */
    event MainDevChanged(address indexed oldMainDev, address indexed newMainDev);
    event MessageAdded(bytes32 message);
    /* Events - END */

    /* Modifiers - START */
    modifier onlyMainDev {
        require(msg.sender == mainDev);
        _;
    }
    /* Modifiers - END */

    address public mainDev;
    bytes32[] public messages;

    /* Constructor - START */
    function MessageOracle() public {
        mainDev = msg.sender;

        messages.push("I'd rather be a bird than a fish");
        messages.push("The lake is a long way from here");
        messages.push("Christmas is coming");
        messages.push("Don't step on the broken glass");
        messages.push("I hear that Nancy is very pretty");
        messages.push("We have a lot of rain in June");
        messages.push("Two seats were vacant");
        messages.push("Please wait outside of the house");
        messages.push("She did her best to help him");
        messages.push("The stranger officiates the meal");
    }
    /* Constructor - END */

    function changeMainDev(address _newMainDev) onlyMainDev public returns(bool) {
        address _oldMainDev = mainDev;
        mainDev = _newMainDev;

        MainDevChanged(_oldMainDev, _newMainDev);

        return true;
    }

    function addMessage(bytes32 _message) onlyMainDev public returns(bool) {
        messages.push(_message);

        MessageAdded(_message);

        return true;
    }

    function getMessage() public constant returns(bytes32) {
        return messages[uint(keccak256(tx.origin, block.number)) % messages.length];
    }
}