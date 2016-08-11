/**
 * Defines controller for vault details tab
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.controller('VaultsController',[
    '$scope',
    '$rootScope',
    '$timeout',
    '$interval',
    'Vault',    
    'VAULT_REGISTRY_TX',
    'USING_MIST',
    'DEFAULT_GAS',
    function($scope,$rootScope,$timeout,$interval,$Vault,$VAULT_REGISTRY_TX,$USING_MIST,$DEFAULT_GAS){

        if(!$USING_MIST) {   
            return;
        }
        
        $scope.accounts = [];
        $scope.vaults = $Vault.getVaults();             
        $scope.vaultEvents = [];   
        $scope.vaultCreated = "--";                 
        $scope.vaultBalance = "--";

        angular.forEach(web3.eth.accounts,function(a){
            $scope.accounts.push({
                address: a
            });
        });           

        $scope.$watch("selectedVault",function(newVault,oldVault){
            if(newVault != oldVault){
                // stop watching previous vaults's events
                if(oldVault){
                    var prevVault = $Vault.getContract(oldVault.address);
                    prevVault.allEvents().stopWatching();
                    // empty events
                    $scope.vaultEvents.splice(0,$scope.vaultEvents.length);
                }               

                // watch events since vault was created
                var vault = $Vault.getContract(newVault.address);  
                var b = web3.eth.getTransactionReceipt(newVault.transactionHash);                  
                vault.allEvents({
                    fromBlock: b.blockNumber
                }).watch(function(err,e){
                    if(!err){
                        var block = web3.eth.getBlock(e.blockNumber);
                        var notFound = true;
                        if($scope.vaultEvents.length > 0 ){
                            var first = $scope.vaultEvents[0];
                            notFound = first.transactionHash != e.transactionHash;
                        }
                        if(notFound){
                            $scope.vaultEvents.splice(0,0,{
                                timestamp: block.timestamp*1000,
                                event: e.event,
                                args: e.args,
                                transactionHash: e.transactionHash
                            });

                            $scope.$emit("ConfirmedTransaction",e.transactionHash);
                        }                   
                    }else{
                        $scope.$emit("AppError",err.toString());
                    }     

                    $scope.updateView();               
                });                             

                var vaultRegistryContract = web3.eth.contract(VaultRegistryAbi);
                var vaultRegistryTx = web3.eth.getTransactionReceipt($VAULT_REGISTRY_TX);
                var vaultRegistry = vaultRegistryContract.at(vaultRegistryTx.contractAddress);
                vaultRegistry.allEvents({
                    fromBlock: vaultRegistryTx.blockNumber
                }).get(function(err,log){
                    if(err){
                        $scope.$emit("AppError","Unable to retrieve VaultRegistry events.");
                    }else{
                        $scope.isRegistered = false;
                        angular.forEach(log,function(e){
                            // ignore 0x
                            if(e.event == "VaultRegistered"){
                                if(e.args.vault == $scope.selectedVault.address){
                                    $scope.isRegistered = true;
                                }
                            }
                        });              
                    }
                });              

                $scope.updateView();

                $rootScope.$broadcast("SelectedVault",newVault.address);   

                $timeout(function(){
                    $scope.$apply();
                },1000);                         
            }
        });

        $scope.updateView = function(){

            // update status of vault
            if($scope.selectedVault){
                                
                var vault = $Vault.getContract($scope.selectedVault.address);

                vault.withdrawalAmount(function(err,amt){
                    if(!err){
                        $scope.withdrawalAmount = amt;
                    }else{
                        $scope.$emit("AppError",err.toString());
                    }
                });
               
                vault.withdrawalUnlockTime(function(err,timestamp){
                    if(!err){
                        var now = new Date();
                        $scope.canAbort = timestamp.times(1000).cmp(now.getTime()) >= 0;
                    }else{
                        $scope.$emit("AppError",err.toString());
                    }
                });               

                var tx = web3.eth.getTransactionReceipt($scope.selectedVault.transactionHash);
                var block = web3.eth.getBlock(tx.blockNumber);
                $scope.vaultCreated =  block.timestamp*1000;

                // update balances
                var b = web3.eth.getBalance($scope.selectedVault.address);
                $scope.vaultBalance = b.toFormat();                            
            }
        };

        $interval(function(){
            $scope.updateView();
        },1000*60);        

        $scope.showDepositModal = function(){
            $scope.$applyAsync(function(){
                $("#depositModal").openModal();
            });
        };

        $scope.showWithdrawModal = function(){
            $scope.$applyAsync(function(){
                $("#withdrawModal").openModal();
            });
        };
        
        $scope.showAlertsModal = function(){     
            if(!$scope.isRegistered){       
                $scope.$applyAsync(function(){              
                    $("#alertsModal").openModal();              
                });           
            }                                                                                                  
        };

        $scope.getAscii = function(key,text){
            if(key == "eventName" && text.substring(0,2) == "0x"){
                return web3.toAscii(text);
            }else{
                return text.toString();
            }
        };

        $scope.settle = function(){
            
            var vault = $Vault.getContract($scope.selectedVault.address);

            if(web3.eth.accounts.length > 0){
                vault.settle({
                    from: web3.eth.accounts[0]
                },function(err,txHash){
                    if(err){
                        $scope.$emit("AppError",err.toString());
                    }
                });            
            }
        };

        $scope.abort = function(){
            
            var vault = $Vault.getContract($scope.selectedVault.address);

            if(web3.eth.accounts.length > 0){
                vault.abort({
                    from: web3.eth.accounts[0],
                    gas: $DEFAULT_GAS
                },function(err,txHash){
                    if(err){
                        $scope.$emit("AppError",err.toString());
                    }
                });            
            }
        };

    }
]);