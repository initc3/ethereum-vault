/**
 * Defines application controller. Handles messaging and pending transactions.
 * 
 * @author Kersing Huang <kh295@cornell.edu>
 */
vaultApp.controller('AppController',[
    '$scope',
    '$rootScope',
    'VAULT_REGISTRY_TX',
    'USING_MIST',
    function($scope,$rootScope,$VAULT_REGISTRY_TX,$USING_MIST){

        $scope.usingMist = $USING_MIST;

        if(!$USING_MIST){
            return;
        }

        $scope.messages =[];  
        $scope.pendingTxs = [];      

        $rootScope.$applyAsync(function(scope){
            $(function(){
                $('select').material_select();
                $('ul.tabs').tabs();
            });
        });                                        

        var f = web3.eth.filter("pending");
        f.get(function(err,log){
            angular.forEach(log,function(h){
                $scope.pendingTxs.push(h);
            });
        });
        f.watch(function(err,h){
            $scope.pendingTxs.push(h);
        });

        $scope.$on("ConfirmedTransaction",function($event,txHash){
            var i = $scope.pendingTxs.indexOf(txHash);
            if(i >= 0){
                $scope.pendingTxs.splice(i,1);
            }
        });

        $scope.removeError = function(index){
            $scope.messages.splice(index,1);
        };

        $scope.$on("AppError",function($event,msg){
            $scope.messages.push({
                class: 'red white-text',
                icon: 'error',
                message: msg
            });         
        });

        $scope.$on("AppWarning",function($event,msg){
            $scope.messages.push({
                class: 'yellow',
                icon: 'warning',
                message: msg
            });         
        });

        $scope.$on("Success",function($event,msg){
            $scope.messages.push({
                class: 'green',
                icon: 'done',
                message: msg
            });         
        });

        $scope.$on("ClearMessages",function($event){
            $scope.messages = [];
        });     
    }
]);