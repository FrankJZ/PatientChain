pragma solidity ^0.4.15;

import "./MessageOracle.sol";

/**
 * @title This is a sample contract for learning Ethereum and Solidity.
 * @author Scotiabank DF Blockchain Team
 */

contract HelloEthereum {

    /* Events - START */
    // Indexed arguments in a event are made filterable in the user interface.
    // Only up to 3 indexed arguments are allowed.
    event MainDevChanged(address indexed oldMainDev, address indexed newMainDev);
    event MessageOracleChanged(address oldMessageOracle, address indexed newMessageOracle);
    event PersonRegistered(address indexed account, string name);
    event HiEthereum(address indexed account, string name, bytes32 message);
    /* Events - END */

    /* Enum & Strut - START */
    enum Gender {
        Male,
        Female,
        Undisclosed
    }

    struct Person {
        string name;
        address account;
        Gender gender;
        uint age;
        bool registered;
        uint lastTimeSaidHi;
    }
    /* Enum & Strut - END */

    /* State Variables - START */
    // Constant state variable that cannot be changed later.
    uint constant SAY_HI_LOCK_DURATION = 10 seconds;

    address public mainDev;
    // Mapping from addresses to struct Person.
    mapping (address => Person) public people;

    uint private creationTime;
    // A state variable for keeping track of and talking to MessageOracle which is another smart contract.
    MessageOracle private messageOracle;
    /* State Variables - END */

    /* Modifiers - START */
    modifier onlyMainDev {
        // Require if the shortcut for if (...) throw. Here, we 
        // are restricting the message sender to be the mainDev
        // and throw otherwise which will revert all state changes.
        require(msg.sender == mainDev);

        // _; is the placeholder for where the function codes will be inserted in.
        // Note: more codes can be placed after _; in valid use case as a post-process.
        _;
    }

    modifier onlyRegisteredPerson { 
        require(people[msg.sender].registered);
        _;
    }

    modifier onlyEligiblePerson { 
        require(people[msg.sender].lastTimeSaidHi + SAY_HI_LOCK_DURATION <= now);
        _; 
    }

    // Function arguments can be passed into a modifier, _gender in this case.
    modifier onlyValidGender(uint _gender) { 
        require(uint(Gender.Undisclosed) >= _gender);
        _;
    }
    /* Modifiers - END */

    /* Constructor - START */
    function HelloEthereum (address _messageOracleAddr) public {
        // msg.sender is the direct sender of this message, but not necessarily 
        // the original sender of the transaction. mainDev will be the creator
        // of this smart contract in the beginning.
        mainDev = msg.sender;
        // now is an alias for block.timestamp, which is current block timestamp 
        // as seconds since unix epoch.
        creationTime = now;
        // Initialize the messageOracle smart contract variable with the provided address.
        // Note that this is not creating a new smart contract but using a existing one and 
        // this is line neither verifies if the given address is for a contract nor if it is 
        // an actual messageOracle contract.
        messageOracle = MessageOracle(_messageOracleAddr);
    }
    /* Constructor - END */

    /* Public Functions - START */
    /** @dev Change the mainDev. Only accessible by the mainDev.
      *
      * @param _newMainDev Address of the new mainDev.
      *
      * @return true if execution succeeded, false otherwise.
      */
    function changeMainDev(address _newMainDev) onlyMainDev public returns(bool) {
        address _oldMainDev = mainDev;
        mainDev = _newMainDev;

        // This is how we log a specific event in solidity.
        // Note that 'this' in the line below refers to the address of this smart
        // contract. This variable is not available in the constructor though as 
        // the contract has not been deployed yet and has not acquired an address.
        MainDevChanged(_oldMainDev, _newMainDev);

        return true;
    }

    /** @dev Change the messageOracle. Only accessible by the mainDev.
      *
      * @param _messageOracleAddr Address of the new messageOracle.
      *
      * @return true if execution succeeded, false otherwise.
      */
    function setMessageOracle(address _messageOracleAddr) onlyMainDev public returns(bool) {
        address _oldMessageOracleAddr = messageOracle;
        messageOracle = MessageOracle(_messageOracleAddr);

        MessageOracleChanged(_oldMessageOracleAddr, _messageOracleAddr);

        return true;
    }

    /** @dev Register a new person. Only accessible by the mainDev.
      *
      * @param _name Name of the person.
      * ...
      * @param _gender Gender of the person. 0 - Male, 1 - Female, 2 - Undisclosed, all other values will not be accepted.
      * ...
      *
      * @return true if execution succeeded, false otherwise.
      */
    function register(string _name, uint _gender, uint _age) onlyValidGender(_gender) public returns(bool) {
        // Set each individual field in the target Person struct. Since people is
        // a mapping from addresses to Person, the struct needs not to be manually
        // initialized.
        people[msg.sender].name = _name;
        people[msg.sender].gender = Gender(_gender);
        people[msg.sender].age = _age;
        people[msg.sender].registered = true;
        people[msg.sender].account = msg.sender;

        PersonRegistered(msg.sender, _name);

        return true;
    }

    /** @dev Say hi to ethereum. Only accessible by registered people and can only be called once by the same person in every 10 seconds.
      *
      * @return true if execution succeeded, false otherwise.
      */
    // When multiple modifiers are put onto the same function, they are called in sequence 
    // and then the actual function codes get run.
    function sayHi() onlyRegisteredPerson onlyEligiblePerson public returns(bool) {
        // Calling a internal function.
        updateSayHiTime();

        bytes32 _message = bytes32(0);
        if (isContract(messageOracle)) {
            _message = messageOracle.getMessage();
        }
        HiEthereum(msg.sender, people[msg.sender].name, _message);

        return true;
    }

    /* Constant Function - START */
    /** @return the creation time of this smart contract.
      */
    function getCreationTime() public constant returns(uint) {
        return creationTime;
    }

    /** @return true if the given address is registered, false otherwise.
      */
    function isPersonRegistered(address _account) public constant returns(bool) {
        return people[_account].registered;
    }
    /* Constant Function - END */
    /* Public Functions - END */

    /* Internal Functions - START */
    function updateSayHiTime() internal {
        people[msg.sender].lastTimeSaidHi = now;
    }

    function isContract(address _addr) internal constant returns (bool) {
        uint _size;
        assembly { _size := extcodesize(_addr) }
        return _size > 0;
    }
    /* Internal Functions - END */
}
