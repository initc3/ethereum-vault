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

    function registerVault (address vaultAddress) {
        
        // one owner per vault
        if(vaultContracts[msg.sender] > 0 ) {
            throw;
        }

        // save the mapping
        vaultContracts[msg.sender] = vaultAddress;
        
        // emit an event log
        VaultRegistered(vaultAddress, msg.sender);

    }
    
    /**
     * Do not allow anyone to deposit ether to this contract
     */
    function(){
        throw;
    }

}