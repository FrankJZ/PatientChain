var HelloEthereum = artifacts.require("./HelloEthereum.sol");
var MessageOracle = artifacts.require("./MessageOracle.sol");

module.exports = function(deployer) {
    MessageOracle.deployed().then(function(messageOracle) {
        deployer.deploy(HelloEthereum, messageOracle.address);
    });
};
