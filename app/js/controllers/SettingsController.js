vaultApp.controller('SettingsController',[
	'$scope',	
	'$timeout',
	'Vault',
	function($scope,$timeout,$Vault){

		$scope.vaults = $Vault.getVaults();

		// resize text area after user has stopped typing
		var feedbackTimeoutId;
		$scope.$watch('feedback',function(){
			if(feedbackTimeoutId){
				$timeout.cancel(feedbackTimeoutId);
			}
			feedbackTimeoutId = $timeout(function(){
				$('#feedback').trigger('autoresize');
			},250);
		});
	}
]);