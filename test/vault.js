const assert = require('assert');
const fs = require('fs');
const path = require('path');

const BigNumber = require('bignumber.js');
const solc = require('solc');
const TestRPC = require("ethereumjs-testrpc");
const Web3 = require('web3');

var g_Gas = 900000;
var g_VaultSrc = 'app/contracts/Vault.sol';
var g_WithdrawAmount = 10;      // in wei
var g_TimelockInterval = 10;    // in seconds

describe('Vault', function() {
    this.timeout(0);

    var accounts;
    var web3;

    before(function(done) {        
        web3 = new Web3();
        // create two accounts
        web3.setProvider(TestRPC.provider({
            total_accounts: 2,
            logger: console,
            debug: false
        }));                
        done();
    });

    it('user has 2 accounts',function(done){
        web3.eth.getAccounts(function(err,accts){            
            assert.equal(err,null);
            assert.equal(accts.length,2);
            accounts = accts;
            done();
        });
    });

    it('user balance for all accounts > 0',function(done){
        web3.eth.getAccounts(function(err,accts){            
            assert.equal(err,null);
            var count = 0;
            for(var i = 0; i < accts.length; i++){            
                web3.eth.getBalance(accts[i],function(err, balance){
                    assert.equal(err,null);
                    assert(balance > 0);                
                    count++;
                    if(count == accts.length){
                        done();
                    }
                });                        
            }
        });
    });

    describe('after creation',function(){     
        this.timeout(0);    

        var vault = null;

        before(function(done) {

            // compile Vault contract using Solidity compiler          
            var c;
            var src = fs.readFileSync(g_VaultSrc,{ 
                encoding: 'utf-8' 
            });
            var output = solc.compile(src,1);            
            for(var contractName in output.contracts){
                c = output.contracts[contractName];                
            }                                            
                
            var abi = JSON.parse(c.interface);
            var vaultContract = web3.eth.contract(abi);

            // compute amount of gas necessary to create vault            
            var totalGas = new BigNumber(0);
            var costs = c.gasEstimates['creation'];
            for(var i = 0; i < costs.length; i++){
                totalGas = totalGas.plus(costs[i]);
            }                
            totalGas = totalGas.times(10);
            
            // create contract            
            vaultContract.new(accounts[0],g_TimelockInterval,{  
                from: accounts[0],
                gas: totalGas,                  
                data: c.bytecode
            },function(err,contract){
                assert.equal(err,null);                                  
                if(contract && contract.address){                    
                    vault = vaultContract.at(contract.address);    
                    done();                                    
                }                    
            });                
        });

        it('can deposit ether',function(done){                

            var depositAmount = 1000;

            // listen for Deposit event
            var filter = vault.allEvents();
            filter.watch(function(err,e){                
                assert.equal(err,null);
                if(e.event == "Deposit"){
                    assert.equal(e.args.sender,accounts[0]);
                    assert(e.args.newAmount.comparedTo(depositAmount) == 0);
                    filter.stopWatching();
                    done();
                }                
            });

            web3.eth.sendTransaction({
                from: accounts[0],
                to: vault.address,
                value: depositAmount
            },function(err,txHash){
                assert.equal(err,null);                            
            });                                

        });

        it('can initiate withdraw',function(done){                     

            web3.eth.getBalance(vault.address,function(err,vaultBalance){
                assert.equal(err,null);                
                assert(vaultBalance.comparedTo(g_WithdrawAmount) >= 0);                

                web3.eth.getBalance(accounts[1],function(err,acct2Balance){
                    assert.equal(err,null);                    

                    // listen for InitiateWithdrawal event
                    var filter = vault.allEvents();
                    filter.watch(function(err,e){                            
                        assert.equal(err,null);
                        if(e.event == "InitiateWithdrawal"){
                            assert.equal(e.args.newWithdrawAddress,accounts[1]);
                            assert(e.args.newWithdrawalAmount.comparedTo(g_WithdrawAmount) == 0);
                            filter.stopWatching();                            
                            done();                            
                        }                
                    });                                                            

                    vault.initiateWithdrawal(g_WithdrawAmount,accounts[1],{
                        from: accounts[0],
                        gas: g_Gas
                    }, function(err,txHash){
                        assert.equal(err,null);                                                    
                    });       

                });
            });
            
        });

        
        it('cannot be settled immediately',function(done){                 
                        
            vault.settle({
                from: accounts[0],
                gas: g_Gas                
            }, function(err,txHash){                
                assert.notEqual(err,null); 
                done();                                                   
            });             
            
        });

        it('can be settled after ' + g_TimelockInterval + ' s',function(done){ 

            web3.eth.getBalance(vault.address,function(err,startBalance){
                assert.equal(err,null);

                // listen for Settled event
                var filter = vault.allEvents();
                filter.watch(function(err,e){                                            
                    assert.equal(err,null);
                    if(e.event == "Settled"){
                        assert.equal(e.args.newWithdrawAddress,accounts[1]);                    
                        assert(e.args.newWithdrawalAmount.comparedTo(g_WithdrawAmount) == 0);
                        filter.stopWatching();     

                        web3.eth.getBalance(vault.address,function(err,endBalance){                       
                            assert.equal(err,null);
                            // check vault balance has decreased by withdraw amount
                            assert(startBalance.minus(endBalance).comparedTo(g_WithdrawAmount) == 0);
                            done();                            
                        });
                    }                
                });                     

                vault.withdrawalUnlockTime.call(function(err,unlockedAt){
                    
                    assert.equal(err,null);
                    var expiration = unlockedAt.times(1000);
                    console.log("Spin until lock expiration at " + new Date(expiration.toNumber()));

                    // spin until time has passed
                    while(true){
                        var now = new Date();                    
                        if(expiration.comparedTo(now.getTime()) < 0){
                            break;
                        }
                    }
                    
                    vault.settle({
                        from: accounts[0],
                        gas: g_Gas                
                    }, function(err,txHash){                
                        assert.equal(err,null);                                                                                                         
                    });     

                });                     

            });                                            
            
        });
        
        
    });

});