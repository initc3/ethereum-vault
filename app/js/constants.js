/**
 * Defines app module and constants
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */

var vaultApp = angular.module('VaultApp',[]);

// amount of gas to provide for transactions
vaultApp.constant('DEFAULT_GAS',900000);

// key of local storage to store transaction hashes of the vaults the user created
vaultApp.constant('LOCAL_STORATE_VAULT_TXS_KEY',"vaultTxs");

// transaction hash of the transaction that created the VaultRegistry
vaultApp.constant('VAULT_REGISTRY_TX',"0x41fea19e3e9c3be998f5799a45f920c9659daeca4f26f6d59629ce2bdaa4ede1");

// minimum locktime interval for the vault
vaultApp.constant('MIN_LOCKTIME_INTERVAL',5*60);

// whether or not user is using Mist to view the DApp
if(typeof web3 !== 'undefined') {   
    vaultApp.constant('USING_MIST',true);
}else{
    vaultApp.constant('USING_MIST',false);
}