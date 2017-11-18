
# Congee
Congee is unit test runner for Ethereum smart contracts, which enables the developer to write tests in JSON format.

## Prerequisites
* [testrpc](https://github.com/ethereumjs/testrpc) or [geth](https://github.com/ethereum/go-ethereum/wiki/geth)
* [truffle](http://truffleframework.com/)

You can follow up the other README.md in the root folder of this demo project to set up testrpc/geth and truffle. 

## Getting Started
* Before running the tests, you will need to make sure you blockchain network is running. For running tests against local testrpc, you may use command```testrpc -a 20```. This will created 20 accounts for running the tests.
* Modify the truffle.js file in the root as following.

```
module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
```
You may refer to the truffle official website for details about this configuration file. To put it simply, we are here naming the network as **development** and specify it running at **localhost:8545** with mathing any network id. Note that 8545 is the default port used by testrpc.

* Make sure you contracts codes are sitting in **./contracts** where truffle compiler will be looking for them.

## Writer the Tests
### Config.js
This is the node module defines variables/functions you can use in the actual tests. Variables/functions you exported from this file can be directly accessed with "**config.\***"

Function init is required to be exported from config.js. This function should initialize the contract you are testing and return it. This function is executed before each test so you do not have to worry state changes in the testing contract. Each test is running against fresh contract.

You may refer to ./HelloEthereum/config.js for an example.

### Structure of the JSON test file

A typical uint test would look like following. An example can be found in test/HelloEthereum/sayHi.json.

* **name**: description of test.
* **initialConditions**: Preconditions for setting up the test. To be more precise, a list of commands.
* **executions**: The execution flow of the actual test. 4 types of execution are supported for now: assert, cmd, wait and assign.
	* assert: 
		* cmd - the actual command to be evaluated and asserted.
		* value - with placeholder "**:result**", this field defines how the returned value should be parsed, e.g. :result.toNumber() for BigNumber. This field can be ignored if no special parsing is required.
		* expected - value for expectation.
		* error - error message to be displayed in case of failure.
	* cmd:
		* cmd - the actual command to be executed.
		* events - the List of events expected to be seen.
			* name - the name of the event.
			* args - the arguments of the event. "**\***" can be used for argument value indicating we are just making sure that field exist in the event but do not care its value.
        * throw - flag for expecting whether or not the command should throw. Can be ignored if not.
	* wait:
		* duration - Length of wait in seconds.
	* assign
		* cmd - the actual command to be executed. 
		* var - the variable name for the assignment.

```
[
    {
        "name": "demo testing.",
        "initialConditions": [
            "...",
            "..."
        ],
        "executions": [
            {
                "type": "assert",
                "cmd": "...",
                "value": "...",
                "expected": "...",
                "error": "..."
            },
            {
                "type": "cmd",
                "cmd": "...",
                "events": [
                    {
                        "name":"...",
                        "args": {
                            "...": "..."
                        }
                    }
                ],
                "throw": true false
            },
            {
                "type": "wait",
                "duration": 10
            },
            {
                "type": "assign",
                "cmd": "...",
                "var": "..."
            }
        ]
    }
]
```

You may refer to ./HelloEthereum/sayHi.json for an example.

## Running the Tests

You may execute ```truffle test --network development``` to run all tests in the root folder.

To run only specific test belongs to specific contract, you may also execute ```truffle test --network development --test contractName:testName```, e.g. ```truffle test --network development --test HelloEthereum:sayHi```. All tests for that contract will be run if only contractName is provided.












