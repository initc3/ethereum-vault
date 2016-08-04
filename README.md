# Ethereum Vault #

An implementation of convenants in Ethereum. See
[Bitcoin Convenants paper](http://fc16.ifca.ai/bitcoin/papers/MES16.pdf) for 
inspiration.

## Design ##
DApp was built using [AngularJS](https://angularjs.org/) and 
[Materialize](http://materializecss.com/). Vaults created by user are stored 
in local storage of the Mist browser. Vaults are *not* automatically registered
in the registry. 

## Installation ##

Prerequisites: [npm](https://www.npmjs.com/) and [Mist browser](https://github.com/ethereum/mist/releases)

1. ```npm install```
2. Start Ethereum client on a private network. 

	```
	geth --dev --rpc --rpcapi "db,eth,net,web3" --rpcport "8545" --rpccorsdomain "*" --nodiscover --datadir "/tmp/testchain" --mine --minerthreads 1 --etherbase "0"
	```

	Note: You must create an account in order to set the etherbase.
3. Deploy ```app/contracts/VaultRegistry.sol``` to Ethereum blockchain. We recommend using the Ethereum wallet to do this. 
4. Update ```VAULT_REGISTRY_TX``` in ```app/js/constants.js``` to the transaction hash of the transaction in which the VaultRegistry was created.
5. Run ```grunt dev```.
6. Open Mist browser and navigate to http://localhost:8000. You can specify the webserver to run on a
different port in ```config/server.yml```