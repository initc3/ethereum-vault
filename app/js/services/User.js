
vaultApp.factory('User', [
	'$http',
	function($http) {

		return {
			registerEmail: function(){

				// FIXME: Implement me!

			},
			getAccounts: function(){
				var accounts = [];
				angular.forEach(web3.eth.accounts,function(addr){
					accounts.push({
						address: addr,
						balance: web3.eth.getBalance(addr)
					});
				});
				return accounts;
			}
		};

	}
]);