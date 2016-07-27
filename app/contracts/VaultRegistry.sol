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
     * @param owner - vault owner's address
     * @param vault - vault address
     * @return new vault contract address
     */
    function registerVault (address owner, address vault) {
        // can't sent ether now
        // one owner address per contract
        if (msg.value > 0 
            || msg.sender != owner
            || vaultContracts[msg.sender] > 0 ) 
            throw;

        // save the mapping
        vaultContracts[owner] = vault;
        
        // emit an event log
        VaultRegistered(vault, owner);

    }

    /**
     * Gets owner's vault
     * @param owner - the owner's address
     * @return vault addresss
     */
    function getVault(address owner) constant returns (address){
        return vaultContracts[owner];
    }
    
    /**
     * Do not allow anyone to deposit ether to this contract
     */
    function(){
        throw;
    }

}