vaultApp.controller('CreateVaultController',[
	'$scope',
	'Vault',
	'User',
	'MIN_LOCKTIME_INTERVAL',
	function($scope,$Vault,$User,MIN_LOCKTIME_INTERVAL){

		$scope.accounts = $User.getAccounts();

		$scope.registerVault = function(){

			$scope.$emit("ClearMessages");

			// timelock interval in seconds
			var timelockInterval = $("#timeUnit").val()*$scope.locktimeInterval;

			if($scope.createVaultForm.$invalid){
				$scope.$emit("AppError", "Please fix form" );
				return;
			}

			if(timelockInterval > MIN_LOCKTIME_INTERVAL){
				//console.log("registerVault(" + $scope.accountToCreate.address + "," + timelockInterval + ")");
				
				$Vault.createVault(
					$scope.createAccount.address,
					timelockInterval,
					function(err,vaultAddress){
						if(err){
							$scope.$emit("AppError",err.toString());
						}else{
							$scope.$emit("Success","Created vault at " + vaultAddress);
						}
					}
				);

			}else{
				$scope.$emit("AppError", "Locktime interval (" + timelockInterval + " seconds) must be greater than " + MIN_LOCKTIME_INTERVAL + " seconds" );
			}
			
		};

	}
]);