/**
 * Defines controller for withdraw modal
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.controller('WithdrawController',[
	'$scope',
	'$rootScope',	
	'Vault',	
	'USING_MIST',
	'DEFAULT_GAS',
	function($scope,$rootScope,$Vault,$USING_MIST,$DEFAULT_GAS){

		if(!$USING_MIST) {   
			return;
		}
		
		$scope.accounts = [];
		$scope.vaults = $Vault.getVaults();		
		$scope.vaultAddress = null;		

		angular.forEach(web3.eth.accounts,function(a){
			$scope.accounts.push({
				address: a
			});
		});

		$scope.$on("SelectedVault",function($event,vaultAddress){
			$scope.vaultAddress = vaultAddress;
			var b = web3.eth.getBalance(vaultAddress);
			$scope.vaultBalance = b.toFormat();
		});
		
		$scope.withdraw = function(){

			if($scope.vaultAddress && $scope.vaultAddress.length > 0 
				&& $scope.withdrawAmount
				&& $scope.depositToAccount.address > 0
				&& $scope.withdrawForm.$valid){

				var amount = new BigNumber($scope.withdrawAmount).times(parseInt($scope.etherUnits));

				// check amount to withdraw is greater than zero
				if(amount.comparedTo(0) <= 0){
					$scope.error ="Expected withdrawal amount to be greater than zero.";
					return;
				}

				var vaultBalance = web3.eth.getBalance($scope.vaultAddress);
				if(amount.comparedTo(vaultBalance) > 0){
					$scope.error = "Expected withdrawal amount to be less than vault balance.";
					return;
				}

				if(web3.eth.accounts.length == 0){
					$scope.error = "Please associate some accounts with this DApp.";
					return;
				}
				
				var vault = $Vault.getContract($scope.vaultAddress);
                vault.initiateWithdrawal(amount,$scope.depositToAccount.address,{
                    from: web3.eth.accounts[0],
                    gas: $DEFAULT_GAS,
                    to: $scope.vaultAddress
                },function(err,txHash){
                	if(err){
						$scope.$emit("AppErr",err.toString());
					}else{
						$scope.withdrawAmount = "";
						$scope.$applyAsync(function(){
							$("#withdrawModal").closeModal();
						});
					}		                    
                });				

			}

		};
	}
]);