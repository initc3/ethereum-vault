/**
 * Defines controller for deposit modal
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.controller('DepositController',[
	'$scope',
	'$rootScope',
	'Vault',	
	'USING_MIST',
	function($scope,$rootScope,$Vault,$USING_MIST){

		if(!$USING_MIST) {   
			return;
		}

		$scope.accounts = [];		
		$scope.vaultAddress = null;
		$scope.accountBalance = null;

		angular.forEach(web3.eth.accounts,function(a){
			$scope.accounts.push({
				address: a
			});
		});

		$scope.$on("SelectedVault",function($event,vaultAddress){
			$scope.vaultAddress = vaultAddress;
			$scope.$applyAsync(function(scope){
	            $('select').material_select();
	        });
		});

		$scope.$watchCollection("depositFromAccount",function(newAcct,oldAcct){
			if(newAcct != oldAcct && newAcct && web3.isAddress(newAcct.address)){
				var b = web3.eth.getBalance(newAcct.address);
				$scope.accountBalance = b.toFormat();
			}
		});
		
		$scope.deposit = function(){

			$scope.error = null;

			if($scope.vaultAddress && $scope.vaultAddress.length > 0 
				&& $scope.depositAmount 
				&& $scope.depositForm.$valid){

				var amount = new BigNumber($scope.depositAmount).times(parseInt($scope.etherUnits));

				// check amount isn't negative or zero
				if(amount.comparedTo(0) <= 0){
					$scope.error = "Deposit amount needs to be greater than zero.";
					return;
				}

				// check amount isn't more than account balance
				var b = web3.eth.getBalance($scope.depositFromAccount.address);
				if(b.comparedTo(amount) < 0){
					$scope.error = "Deposit amount cannot exceed account balance.";
					return;
				}

				web3.eth.sendTransaction({
                    from: $scope.depositFromAccount.address,
                    to: $scope.vaultAddress,
                    value: amount
                },function(err, txHash){    
                    if(err){
						$scope.$emit("AppErr",err.toString());
					}else{
						$scope.$applyAsync(function(){
							$("#depositModal").closeModal();
						});
					}	
                });				

			}

		};
	}
]);