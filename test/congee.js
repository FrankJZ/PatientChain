const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const args = require('optimist').argv;
const accts = web3.eth.accounts;
const configFile = "config.js";

let testCnt, testFunc;
if (typeof args.test === "string") {
    let testCntTestFunc = args.test.split(":");
    testCnt = testCntTestFunc[0].toLowerCase();
    if (testCntTestFunc.length >= 2) {
        testFunc = testCntTestFunc[1].toLowerCase();
    }
}

let timeout = 30000; // Default timeout for each test
if (typeof args.timeout === "number") {
    timeout = args.timeout;
}

fs.readdirSync(__dirname).forEach(function(dir) {
    if (!fs.lstatSync(path.join(__dirname, dir)).isDirectory()) return;
    if (testCnt && dir.toLowerCase() != testCnt) return;

    let directory = path.join(__dirname, dir);
    let config = require(path.join(directory, configFile));
    if (!config.init) {
        throw "init function is required for config.js but missing in " + path.join(directory, configFile);
    }

    const txFrom = { from: config.mainDev };

    fs.readdirSync(directory).forEach((file) => {
        // Skip the config file
        if (file == configFile) return;
        if (testFunc && file.toLowerCase() != testFunc + "\.json") return;

        let re = new RegExp(/^.*?_?([^_]+)\.json$/gi);
        let exec = re.exec(file);

        assert.notEqual(exec, null, `Tests json file - "${file}" not named properly!`);
        let func = exec[1];
        assert.equal(!func, false, `Tests json file - "${file}" not named properly!`);

        let tests = JSON.parse(fs.readFileSync(path.join(directory, file), 'UTF-8'));
        let testTitle = dir + "-" + func;
        contract(testTitle, () => {
            let cnt;

            beforeEach('Distribute ether to each testing account to make sure they all have enough ether to proceed', function() {
                accts.forEach(function(acct) {    
                    if (web3.fromWei(web3.eth.getBalance(acct), 'ether') < 5) {
                        web3.eth.sendTransaction({
                            from: accts[0],
                            to: acct,
                            value: web3.toWei(5, "ether")
                        });
                    }
                });
            });

            beforeEach('Initialize the contract(s) to be tested', async function() {
                cnt = await config.init();
            });
            
            tests.forEach((test) => {
                it(test.name, (done) => {
                    (async () => {
                        // Set up initial conditions
                        if (test.initialConditions) {
                            for (let i = 0; i < test.initialConditions.length; i++) {
                                let initialCondition = test.initialConditions[i];
                                try {
                                    assert.equal(await eval(convertCmdToCall(initialCondition)), true, "Fail to execute initial condition: " + initialCondition);
                                } catch(err) {
                                    assert.equal(false, true, "Fail to execute initial condition: " + initialCondition);
                                }

                                await eval(initialCondition)
                            }
                        }

                        if (!test.executions) {
                            assert.equal(false, true, "executions is required field for test json.");
                        }

                        for (let i = 0; i < test.executions.length; i++) {
                            let execution = test.executions[i];
                            if (execution.type === "wait") {
                                await wait(execution.duration);
                            } else if (execution.type === "cmd") {
                                await assertThrow(execution);
                                if (execution.throw) {
                                    continue;
                                }
                                let output = await eval(execution.cmd);
                                if (execution.events) {
                                    assertEvents(output.logs, execution.events);
                                }
                            } else if (execution.type === "assert") {
                                await checkAssertion(execution);
                            } else if (execution.type === "assign") {
                                let tempVar = await eval(execution.cmd);
                                eval(`${execution.var} = tempVar`);
                            } else {
                                console.log(`Invalid type of execution found: "${execution.type}"!`);
                            }
                        }

                        done();
                    })();
                }).timeout(timeout);

                /* Helper functions for testing - START */
                function convertCmdToCall(cmd) {
                    let index = cmd.indexOf("(");
                    return cmd.substring(0, index) + ".call" + cmd.substring(index);
                }

                function wait(seconds) {
                    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
                }

                async function assertThrow(execution) {
                    if (!execution.throw) {
                        execution.throw = false;
                    }

                    let notThrown;
                    let throwErrorMsg = execution.throw ? `Expecting command "${execution.cmd}" to throw but it did not!`: `Unexpected throw from command "${execution.cmd}"!`;
                    try {
                        notThrown = await eval(convertCmdToCall(execution.cmd));
                    } catch (err) {
                        assert.equal(true, execution.throw, throwErrorMsg);
                    }
                    assert.equal(!notThrown, execution.throw, throwErrorMsg);
                }

                function assertEvents(actualEvents, expectedEvents) {
                    let notFoundExpectedEvents = []
                    if (expectedEvents) {
                        expectedEvents.forEach((expectedEvent) => {
                            let expectedEventFound = _.some(actualEvents, (actualEvent) => {
                                return eventEqual(actualEvent, expectedEvent);
                            });

                            if (!expectedEventFound) {
                                notFoundExpectedEvents.push(expectedEvent);
                            }
                        });

                        assert.equal(notFoundExpectedEvents.length, 0, buildNotFoundEventsMsg(notFoundExpectedEvents));
                    }
                }

                function eventEqual(actualEvent, expectedEvent) {
                    if (expectedEvent.name != actualEvent.event) {
                        return false;
                    }

                    for (let key in actualEvent.args) {
                        if (!actualEvent.args.hasOwnProperty(key)) {
                            continue;
                        }

                        if (expectedEvent.args[key] === "*") {
                            continue;
                        }

                        let expectedVal, actualVal;

                        if (typeof expectedEvent.args[key] === "number" && typeof actualEvent.args[key] === "object") {
                            expectedVal = expectedEvent.args[key];
                            actualVal = actualEvent.args[key].toNumber();
                        } else {
                            expectedVal = eval(expectedEvent.args[key]);
                            actualVal = actualEvent.args[key];
                        }
                        
                        if (typeof expectedVal === "undefined"
                         || typeof actualVal === "undefined"
                         || expectedVal != actualVal) {
                            return false;
                        }
                    }

                    return true;
                }

                function buildNotFoundEventsMsg(notFoundExpectedEvents) {
                    var msg = "The following events are not triggered or arguments are not as expected -\n";
                    _.forEach(notFoundExpectedEvents, function(event) {
                        msg += '\tEvent: ' + event.name + '\n\tArguments :\n';
                        _.forEach(event.args, function(value, key) {
                            msg += '\t  ' + key + ': ' + value + '\n';
                        })
                    });
                    return msg + "\n";
                }

                async function checkAssertion(assertion) {
                    let actual = await eval(assertion.cmd);

                    if (!assertion.value) {
                        assertion.value = ':result';
                    }
                    actual = eval(assertion.value.replace(':result', 'actual'));
                    let expected = eval(assertion.expected);

                    if (Array.isArray(actual) && Array.isArray(expected)) {
                        assert.equal(actual.length, expected.length, assertion.error);

                        for (let i = 0; i < actual.length; i++) {
                            if (typeof expected[i] === "number" && typeof actual[i] === "object") {
                                actual[i] = actual[i].toNumber();
                            }
                            if (expected[i] !== "*") {
                                assert.equal(actual[i], expected[i], assertion.error);
                            }
                        }
                    } else {
                        assert.equal(actual, expected, assertion.error);
                    }

                }
                /* Helper functions for testing - END */
            });
        });
    });
});

