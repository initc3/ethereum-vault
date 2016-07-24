vaultApp.controller('VaultsController',[
	'$scope',
	'$rootScope',
	'Vault',
	'User',
	function($scope,$rootScope,$Vault,$User){

		$scope.accounts = $User.getAccounts();
		$scope.selectedAccountIndex = -1;
		$scope.selectedAccountAddress = "--";
		$scope.transactions = [];
		$scope.vaults = [];

		$scope.updateVaults = function(){
		
			$scope.vaults = $Vault.getVaults();

		};

		$scope.selectVault = function(index){
			$scope.selectedAccountIndex = index;
			if(index < $scope.vaults.length){
				var v = $scope.vaults[index].contract;
				$scope.selectedAccountAddress = v.address;
				v.allEvents({
					//fromBlock: $Vault.getVaultRegistryBlockNumber()
				}, function(events){
					$scope.transactions = events;
				});
				$rootScope.$broadcast("SelectedVault",v.address);
			}
		};

		$scope.showDepositModal = function(){
			$("#depositModal").openModal();
		};

		$scope.showWithdrawModal = function(){
			$("#withdrawModal").openModal();
		};

		$scope.updateVaults();

	}
]);