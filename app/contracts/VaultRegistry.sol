import "Vault.sol";

/**
 * VaultRegistry is a factory that creates vaults.
 * 
 * @author Ittay Eyal <stanga@gmail.com>
 * @author Nick Samson <nes77@cornell.edu>
 * @author Kersing Huang <kh295@cornell.edu>
 */
contract VaultRegistry {
    
    // Each user account (address) has at most one registered vault (address) 
    mapping (address => address) public vaultContracts;
    
    event VaultRegistered(address vault, address owner);

    /** 
     * Creates a new Vault contract and returns its address
     * 
     * @param locktimeInterval - time after initiating a withdraw in which ether can be settled
     * @return new vault contract address
     */
    function registerVault (uint locktimeInterval) returns (address) {
        // can't sent ether now
        // one owner address per contract
        if (msg.value > 0 
            || vaultContracts[msg.sender] > 0 ) 
            throw;
            
        // create a new contract based on the Vault template
        // set the owner as the msg.sender
        address newVaultContract = new Vault(msg.sender, locktimeInterval);
        
        // save the mapping
        vaultContracts[msg.sender] = newVaultContract;
        
        // emit an event log
        VaultRegistered(newVaultContract, msg.sender);
        
        return newVaultContract;
    }
    
    /**
     * Do not allow anyone to deposit ether to this contract
     */
    function(){
        throw;
    }

}