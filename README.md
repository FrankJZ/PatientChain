After cloning the demo repository, please follow the steps below to setup the ethereum dev environment. 

**Note: Make sure you are on G-Link**
**The below instructions are for MAC users**

To start with, you will need to install some tools:

### For all environments

1. Node JS Latest Current v8.8.1 (https://nodejs.org/en/download/)
2. Editor (Sublime Text, Atom or Visual Studio Code)
3. Download Ethereum-Solidity package/plugin for the chosen editor :
    * Ethereum package for Sublime Text
    * atom-solidity-linter for Atom
    * solidity for VS Code
    
### For windows 

Install git command-line tool

npm install -g --production windows-build-tools 

**Note: cygwin terminal is recommended command line tool for windows. Truffle has issues when used through command prompt.**

**Now to install testrpc & web3, run the below command:**

npm install -g ethereumjs-testrpc

**Install truffle**

npm install -g truffle

**Now to install the repository specific dependencies. Change the directory in your terminal to the cloned repo:**

npm install

That's it. Now you are all set to start blockchaining!!!

**Start testrpc**

Below command would start testrpc on localhost:8545 with 20 accounts.

```
testrpc -a 20
```

**To compile the contract**

truffle compile

**To deploy the contract**

truffle deploy (Save the address at which the contract is deployed for future use). Below is the highlighted text of address on terminal:

```
Using network 'development'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0xb8835c7b4b7f9274ad8d2e08605dc0a21b5815d42b101087f99efef19deef317
  Migrations: 0x533675db9fbaf0e1438bb787946f3fd3e44aab88
Saving successful migration to network...
  ... 0x5ff5defa179f3033dce3515fa3e6cd26942171d724510091d7d721080e3c1195
Saving artifacts...
Running migration: 2_helloEthereum_migration.js
  Deploying HelloEthereum...
  ... 0x14b509d7e4353edfc77460c887ca210da47036c7237cd72ec0576de248cd364b
  HelloEthereum: 0xabfb01a7dd39cfeaa733061e5823d0beee7ed287
  ---------------------------------------------------------
Saving successful migration to network...
  ... 0x761b17755241169ad99cce5730480e854b948cb363c1a981396ab5c77d914f74
Saving artifacts...

```
**Interactive node console**

At the terminal type node, this will start the interactive node console. Now we initialize web3 object. 

```
> Web3 = require('web3')

Ouput:
{ [Function: Web3]
  providers: 
   { HttpProvider: [Function: HttpProvider],
     IpcProvider: [Function: IpcProvider] } }
     
> web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

```
**To test the initialization**

```
> web3.eth.accounts

Ouput:
[ '0xfbe5ae36d2108833a53b5211d3feea7131708611',
  '0x1f22caee8af53c86079f9038801db12db6ab4afc',
  '0x6e83e231ccd7bd42b27ecda94e82375ab9ab5db5',
  '0x380a47c02ecdf4173d6817a2c544ee3351020ba9',
  '0xe3b90832a4d618708bd8ac116e14fe07d8b57f45',
  '0xc4afe320dde07e84be25bc621ce192a1b7dc186b',
  '0x10d5de17d2ba64ff2816c30600a953c253acad2e',
  '0x494cefa9d1a8a6a194567e4f167c409e4734f917',
  '0xc315865bc76b37cc0f1b99876412464e4b32087b',
  '0x43fcaa087e796dc31f692023d30ece05d7f3cbc4',
  '0x724db495e3002b41c4ed16fe867bb593e8c3b77c',
  '0x70d56dbd33fbb049346f4d3951e7d2ff80a11b87',
  '0xc5ee5ed46c47f0ed887331cacb59f950d59900d8',
  '0x1b890ffc94bf4badf05c500f856620d7bb54afe8',
  '0xb8e597924ceb748046186154d3b6aa7a4619da51',
  '0x6482007817e96d3d36d37f65180993ed1f7374e0',
  '0x2267be4362a358c1467f0c5a5fe4d07ce9007152',
  '0x1ba07828f8d9c3f36ed221416e44058105c32af4',
  '0x2b8fb3e92700929b5ac6bec7fae21d321f110f0d',
  '0x884dae28a3ed5f9ca716d1ee3549084bc1732937' ]
```
**To test the contract, now we need abi(descriptions of functions and events of the 
  contract) and contract deployed address

If you check the build folder in the repo, you have a contracts folder under which you have the compiled json file for the HelloEthereum contract. In the json file, you should a key that says "abi". Copy the whole abi array value. Go to the terminal and assign it to a variable. 

```
> var abi = <copied abi array>

> var contract = web3.eth.contract(abi)

> var contractInstance = contract.at("0x5f35c0fe291735c0d92e2515929fece8ac43e668") -> Deployed address

```
**Start experimenting with methods in contract**

```
> contractInstance.getCreationTime().toLocaleString()

Ouput: 
'1509376829'

> contractInstance.isPersonRegistered(web3.eth.accounts[1])

Output:
false

> contractInstance.register('User1', web3.eth.accounts[1], 1234, 0, 23, {from: web3.eth.accounts[0], gas: 145000})

Output:
'0x3f108301f136d5adb841f5e27cd81e1e10ef531f9da7450ae44787ca957a6f20'

> contractInstance.isPersonRegistered(web3.eth.accounts[1])

Output:
true

> contractInstance.sayHi({from: web3.eth.accounts[1]})

Output:
'0x7d6b7e7879f10be53cacbace5722176628ade7ba2c8f4677f0b2131f50ce6fcf'
```
