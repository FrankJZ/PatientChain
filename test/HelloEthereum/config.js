const mainDev = web3.eth.accounts[10];
const name = "Someone";
const account = web3.eth.accounts[0];
const anotherAccount = web3.eth.accounts[1];
const id = 0x2f056f23d352e46300b029eed9586acd0e46f8cb082ced2a692a1e2e7d5a042f;
const gender = 2;
const age = 100;
const person = [
    name,
    gender,
    age
];
const anotherPerson = [
    "AnotherOne",
    1,
    50
];

module.exports = {
    mainDev: mainDev,
    name: name,
    account: account,
    anotherAccount: anotherAccount,
    id: id,
    gender: gender,
    age: age,
    person: person,
    anotherPerson: anotherPerson,
    init: async function() {
        const HelloEthereum = artifacts.require("HelloEthereum");
        
        let helloEthereum = await HelloEthereum.new({from: mainDev});

        return helloEthereum;
    }
}