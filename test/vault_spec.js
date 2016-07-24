var assert = require('assert');
var Embark = require('embark-framework');
var EmbarkSpec = Embark.initTests();
var web3 = EmbarkSpec.web3;

describe("Vault", function() {

  before(function(done) {
    // create 1 account
    EmbarkSpec.sim.createAccounts(2, function() {
      EmbarkSpec.sim.setBalance(web3.eth.accounts[0], 1000000000000000000000, function() {
        EmbarkSpec.deployAll(done);
      });
    });
  });

  it("code exists",function(done){

    web3.eth.getCode(Vault.address,function(err, code){
      assert(!err && code.length > 3);
      done();
    });

  });

  it("can deposit ether",function(done){

    //var vaultContract = web3.eth.contract(Vault.abi);
    //var vault = vaultContract.at(Vault.address);

    assert(web3.isAddress(web3.eth.accounts[0]));
    web3.eth.getBalance(web3.eth.accounts[0], {}, function(err,totalAmount){
      assert.equal(err,null);
      console.log("Total: " + totalAmount);

      var amount = Math.floor(totalAmount*0.5*Math.random());

      console.log("Depositing: " + amount);

      assert(web3.isAddress(Vault.address));

      web3.eth.sendTransaction({
        from: web3.eth.accounts[0],
        to: Vault.address,
        value: amount
      },function(err,txHash){
        assert.equal(err,null);
        console.log(txHash);
        web3.eth.getBalance(Vault.address, {}, function(err,deposited){
          assert.equal(err,null);
          assert.equal(deposited,amount);

          var vaultContract = web3.eth.contract(Vault.abi);
          var vault = vaultContract.at(Vault.address);
          var cost = vault.initiateWithdrawal.estimateGas();
          console.log("cost: " + cost);
          assert(cost > 0);
          done();
        });
        
      });
    });

  });

  /*it("cannot withdraw immediately",function(done){

    // check vault has a non-zero balance
    assert(web3.isAddress(Vault.address));
    web3.eth.getBalance(Vault.address, web3.eth.defaultBlock, function(err,balance){
      console.log(arguments);
      //assert.equal(err,null);
      assert(balance.greaterThan(0));
      
      

      console.log("balance: " + balance.toString());
      console.log("withdrawal address: " + web3.eth.accounts[1]);


      

      done();
      // initiate withdraw
      vault.initiateWithdrawal.sendTransaction(
        amount,
        web3.eth.accounts[1],
        { gasPrice: 0 },
      function(err,txHash){
        console.log(err);
        assert.equal(err,null);
        console.log(txHash);

        // check vault balance has decreased correctly
        web3.eth.getBalance(Vault.address,null, function(err,newBalance){
          assert.equal(err,null);
          assert.equal(newBalance,balance-amount);
          
          // check withdrawal address has deposit
          web3.eth.getBalance(web3.eth.accounts[1],null,function(err,acct2Balance){
            assert.equal(err,null);
            assert.equal(acct2Balance,amount);
            done();
          });
        });
      });
    });
      

  });*/

});