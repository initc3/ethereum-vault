
vaultApp.factory('Vault', [
	'$rootScope',
	'$http',
	function($rootScope,$http) {

		if(!window.localStorage){
			$rootScope.$broadcast("AppWarning","Local storage is not supported. Some features of the application may not work properly.");
		}

		var vaultRegistryContract = web3.eth.contract(VaultRegistry.abi);
		var vaultContract = web3.eth.contract(Vault.abi);
		var vaultRegistry = vaultRegistryContract.at(VaultRegistry.address);

		function getVaults(addressesOnly){
			var txt = window.localStorage.getItem("vaults");
			if(txt){
				var vaults = JSON.parse(txt);
				if(angular.isArray(vaults)){
					if(addressesOnly){
						return vaults;
					}else{
						var result = [];
						angular.forEach(vaults,function(addr){
							var v = vaultContract.at(addr);
							result.push({
								contract: v,
								balance: 0 // TODO: web3.eth.getBalance(v.address)
							});
						});
						return result;
					}
				}
			}else{
				return [];
			}
		}

		return {
			createVault: function(address,timelockInterval,cb){

				vaultRegistry.registerVault.sendTransaction(timelockInterval,{
					from: address
				},function(err,vaultAddress){
					if(!err){
						var vaults = getVaults(true);
						vaults.push(vaultAddress);
						var data = JSON.stringify(vaults);
						window.localStorage.setItem("vaults",data);
					}
					if(angular.isFunction(cb)){
						cb.call(null,err,address);
					}
				});

			},
			deposit: function(vaultAddress, fromAccount, amount, cb){

				web3.eth.sendTransaction({
					from: fromAccount,
					to: vaultAddress,
					value: amount
				},function(err, txHash){	
					if(angular.isFunction(cb)){
						cb.call(null, err, txHash);
					}			
				});

			},
			getVaults: getVaults
		};

	}
]);