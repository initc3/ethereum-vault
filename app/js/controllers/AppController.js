//
var vaultApp = angular.module('VaultApp',[]);

vaultApp.constant('MIN_LOCKTIME_INTERVAL',5*60);

vaultApp.controller('AppController',[
	'$scope',
	function($scope){

		$scope.messages = [];

		$(function(){
			$('select').material_select();
			$('ul.tabs').tabs();
		});

		$scope.removeError = function(index){
			$scope.messages.splice(index,1);
		};

		// listen to events
		web3.eth.filter({
			address: web3.eth.accounts
		},function(error, result){
		  	if(!error){
		    	Materialize.toast(result, 4000);
			}else{
				Materialize.toast(error, 4000);
			}
		});

		$scope.$on("AppError",function($event,msg){
			$scope.messages.push({
				class: 'error',
				icon: 'error',
				message: msg
			});
		});

		$scope.$on("AppWarning",function($event,msg){
			$scope.messages.push({
				class: 'warning',
				icon: 'warning',
				message: msg
			});
		});

		$scope.$on("Success",function($event,msg){
			$scope.messages.push({
				class: 'success',
				icon: 'done',
				message: msg
			});
		});

		$scope.$on("ClearMessages",function($event){
			$scope.messages = [];
		});

	}
]);