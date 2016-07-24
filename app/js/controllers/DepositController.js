vaultApp.controller('DepositController',[
	'$scope',	
	'$timeout',
	'Vault',
	'User',
	function($scope,$timeout,$Vault,$User){

		$scope.accounts = $User.getAccounts();
		$scope.vaultAddress = null;

		$scope.$on("SelectedVault",function($event,vaultAddress){
			$scope.vaultAddress = vaultAddress;
		});
		
		$scope.deposit = function(){

			var amount = parseInt($("#etherUnits").val())*$scope.depositAmount;

			if($scope.vaultAddress && $scope.vaultAddress.length > 0 
				&& amount > 0 
				&& $scope.depositForm.$valid){

				$Vault.deposit(
					$scope.vaultAddress, 
					$scope.depositFromAccount.address, 
					amount, 
					function(err,txHash){
						if(err){
							$rootScope.$emit("AppErr",err.toString());
						}else{
							var tx = web3.eth.getTransaction(txHash);
							$rootScope.$emit("Success","Deposited " + tx.value + " wei into" + tx.to);
						}
					}
				);

			}

		};
	}
]);