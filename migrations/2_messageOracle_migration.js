var MessageOracle = artifacts.require("./MessageOracle.sol");

module.exports = function(deployer) {
  deployer.deploy(MessageOracle);
};
