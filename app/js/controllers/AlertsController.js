/**
 * Controller for Alert Modal
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.controller('AlertsController',[
    '$scope',       
    'VAULT_REGISTRY_TX',
    function($scope,$VAULT_REGISTRY_TX){

        if(typeof web3 === 'undefined') {   
            return;
        }

        $scope.vaultAddress = "0x00000000000000000000";

        $scope.$on("SelectedVault",function($event,vaultAddress){
            $scope.vaultAddress = vaultAddress;                 
        });

        var vaultRegistryContract = web3.eth.contract(VaultRegistryAbi);
        var vaultRegistryTx = web3.eth.getTransactionReceipt($VAULT_REGISTRY_TX);
        var vaultRegistry = vaultRegistryContract.at(vaultRegistryTx.contractAddress); 
        $scope.vaultRegistryAddress = vaultRegistryTx.contractAddress;

        $scope.registerVault = function(){

            if(!$scope.alertsForm.$valid){
                $scope.$emit("AppError","Fix form.");
                return;
            }

            if(web3.eth.accounts.length == 0){
                $scope.$emit("AppError","Fix form.");
                return;
            }       

            vaultRegistry.registerVault($scope.vaultAddress,{  
                from: web3.eth.accounts[0],
                gas: 900000
            },function(err,txHash){
                if(err){
                    $scope.$emit("AppError",err.toString());
                }else{
                    // TODO: register email with trusted service
                    $scope.$applyAsync(function(){
                        $("#alertsModal").closeModal();
                    });
                }
            });                 
        };

    }
]);