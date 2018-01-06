import { action, computed, extendObservable } from 'mobx';
import contract from '../BlockchainPassword.json';

export default class Store {
  constructor(web3) {
    this.web3 = web3;

    extendObservable(this, {
      web3Enabled: false,
      accounts: [],
      view: 'Home',
      currentPath: computed(() => {
        switch(this.view) {
          case 'Vault': return '/vault/address'
          default: return '/'
        }
      }),
      showHome: action(() => { this.view = 'Home' }),
      showVault: action(() => { this.view = 'Vault' })
    });

    this.deployNewVault = this.deployNewVault.bind(this);
  }

  deployNewVault() {
    const contractToDeploy = new this.web3.eth.Contract(contract.abi);
    contractToDeploy.deploy({ data: contract.bytecode })
      .send({ from: this.accounts[0] })
      .on('error', (error) => { console.error('Error', error) })
      .on('transactionHash', (hash) => { console.info('Transaction hash', hash) })
      .on('receipt', (receipt) => {
        console.info('New contract address', receipt.contractAddress)
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.info('Confirmation', confirmationNumber, receipt);
      })
      .then(function(newContractInstance){
        console.info('New contract address', newContractInstance.options.address);
      });
  }

  load() {
    if (!this.web3Enabled) return;
    this.loadAccountList();
  }

  loadAccountList() {
    this.web3.eth.getAccounts((error, accounts) => { this.accounts = accounts });
  }
}
