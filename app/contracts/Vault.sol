/**
 * Vault with notifications
 * 
 * @author Ittay Eyal <stanga@gmail.com>
 * @author Nick Samson <nes77@cornell.edu>
 * @author Kersing Huang <kh295@cornell.edu>
 */
contract Vault{
    
    // true if someone is settling
    bool lock;

    // Statically set on contract creation 
    uint public locktimeInterval; 
    
    // Current pending operation 
    uint public withdrawalUnlockTime; 
    uint public withdrawalAmount; 
    address public withdrawalAddress; 
        
    // only the owner can touch this contract
    address vaultOwner;
    
    event CreatedVault(address newVaultOwner, uint locktime);
    event Deposit(address sender, uint newAmount);
    event InitiateWithdrawal(uint newWithdrawalAmount, address newWithdrawAddress);
    event AbortWithdrawal(uint newWithdrawalAmount, address newWithdrawAddress);
    event Settled(uint newWithdrawalAmount, address newWithdrawAddress);
    
    modifier onlyOwner() { // Modifier
        if (msg.sender != vaultOwner) {
            throw;
        }
        _ // return to function
    }
    
    /** 
     * Create the contract
     * 
     * @param newVaultOwner - owner of vault
     * @param newlocktimeInterval - time ether is locked in vault after a withdrawal is initiated
     */
    function Vault(address newVaultOwner, uint newlocktimeInterval) {
        
        // locktime must be at least 5 min
        if(newlocktimeInterval < 300){
            throw;
        }

        locktimeInterval = newlocktimeInterval;
        vaultOwner = newVaultOwner;
        
        // emit an event log
        CreatedVault(msg.sender,newlocktimeInterval);
    }
    
    /**
     * Initiates withdrawal
     * 
     * @param newWithdrawalAmount - amount to withdraw from vault in wei
     * @param newWithdrawAddress - address to transfer ether to from vault
     */
    function initiateWithdrawal(uint newWithdrawalAmount, address newWithdrawAddress) onlyOwner {

        // check amount is not negative or zero
        if (newWithdrawalAmount <= 0) {
            throw; 
        }
        
        // check amount is not too big
        if (newWithdrawalAmount > this.balance) {
            throw;
        }
        
        // check we're not withdrawing already 
        if (withdrawalAmount > 0) {
            throw; 
        }
        
        // Initiate withdrawal 
        withdrawalUnlockTime = now + locktimeInterval; 
        withdrawalAmount = newWithdrawalAmount;
        withdrawalAddress = newWithdrawAddress; 
        
        // emit an event log
        InitiateWithdrawal(newWithdrawalAmount, newWithdrawAddress);
        
    } 
    
    /**
     * Owner can prevent withdrawal
     */
    function abort() onlyOwner {

        if (withdrawalAmount > 0){
            // pending withdrawal 
            withdrawalAmount = 0;
            
            // emit an event log
            AbortWithdrawal(withdrawalAmount,withdrawalAddress);
        }
        
    }

    /**
     * Moves ether to withdrawal address 
     */
    function settle() {
        
        // no ether is sent when calling settle 
        // and settle is not already being called
        if (msg.value > 0 || lock) {
            throw;
        }
            
        // obtain lock
        lock = true; 

        // ether is still frozen time lock hasn't expired
        if (withdrawalUnlockTime > now) {
            throw;
        }
        
        // withdrawal hasn't been initiated
        if (withdrawalAmount <= 0) {
            throw;
        }
            
        if(withdrawalAddress.send(withdrawalAmount)){
            withdrawalAmount = 0; 
            
            // emit an event log
            Settled(withdrawalAmount,withdrawalAddress);
        }else{
            throw;
        }
        
        // release lock
        lock = false; 
    }   
    
    /**
     * Fires deposit event when ether is deposited
     */
    function(){
        // emit event log when ether is deposited
        Deposit(msg.sender,msg.value);
    }

} 