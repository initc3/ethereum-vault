/**
 * Defines controller for the vault creation tab
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.controller('CreateVaultController',[
    '$scope',   
    'Vault',
    'MIN_LOCKTIME_INTERVAL',
    'LOCAL_STORATE_VAULT_TXS_KEY',
    function($scope,$Vault,$MIN_LOCKTIME_INTERVAL,$LOCAL_STORATE_VAULT_TXS_KEY){

        if(typeof web3 === 'undefined') {   
            return;
        }

        $scope.accounts = [];

        angular.forEach(web3.eth.accounts,function(a){
            $scope.accounts.push({
                address: a
            });
        });           

        $scope.registerVault = function(){

            $scope.$emit("ClearMessages");

            // timelock interval in seconds
            var timelockInterval = parseInt($scope.timeUnit)*$scope.locktimeInterval;

            if($scope.createVaultForm.$invalid){
                $scope.$emit("AppError", "Please fix form" );
                return;
            }

            if(timelockInterval < $MIN_LOCKTIME_INTERVAL){
                $scope.$emit("AppError", "Expected timelock to be greater than " + $MIN_LOCKTIME_INTERVAL);
                return;
            }

            var vaultContract = web3.eth.contract(VaultAbi);        
            vaultContract.new($scope.createAccount.address,timelockInterval,{
                from: $scope.createAccount.address,
                gas: 900000,
                data: VaultCode
            },function(err,contract){
                if(err){
                    $scope.$emit("AppError",err.toString());
                }else if(contract && contract.address){
                    $scope.$emit("Success","Created vault at " + contract.address);
                }else{
                    $scope.locktimeInterval = null;
                    var vaultTxs = $Vault.getVaults(true);
                    vaultTxs.push(contract.transactionHash);
                    window.localStorage.setItem($LOCAL_STORATE_VAULT_TXS_KEY,JSON.stringify(vaultTxs));
                }                    
            });
            
        };

    }
]);