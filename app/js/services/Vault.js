
/**
 * Defines service for dealing with Vaults
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.factory('Vault', [
    '$rootScope',    
    'VAULT_REGISTRY_TX',
    'LOCAL_STORATE_VAULT_TXS_KEY',
    function($rootScope,$VAULT_REGISTRY_TX,$LOCAL_STORATE_VAULT_TXS_KEY) {

        if(!window.localStorage){        
            $rootScope.$broadcast("AppWarning","This application requires local storage.");        
            return;
        }

        if(typeof web3 !== 'undefined') {               
        
            var vaultContract = web3.eth.contract(VaultAbi);
            var vaultRegistryContract = web3.eth.contract(VaultRegistryAbi);
            var vaultRegistryTx = web3.eth.getTransactionReceipt($VAULT_REGISTRY_TX);
            var vaultRegistry = vaultRegistryContract.at(vaultRegistryTx.contractAddress);        

            return {                                                                      
                getVaults: function(hashesOnly){                  

                    var txt = window.localStorage.getItem($LOCAL_STORATE_VAULT_TXS_KEY);
                    var vaultTxs = txt ? JSON.parse(txt) : [];
                    
                    if(hashesOnly){
                        return vaultTxs;
                    }else{
                        var vaults = [];
                        angular.forEach(vaultTxs,function(txHash){
                            // find address from logs
                            var tx = web3.eth.getTransactionReceipt(txHash);                                
                            if(tx && tx.logs && tx.logs.length > 0){                    
                                // confirmed transaction
                                vaults.push({
                                    address: tx.logs[0].address,
                                    transactionHash: txHash
                                });    
                            }                       
                        });
                        return vaults;
                    }

                },            
                getContract: function(address){
                    return vaultContract.at(address);
                }
            };      
            
        }else{
            return {};
        } 

    }
]);