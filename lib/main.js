const {CompositeDisposable, Disposable} = require('via');
const Accounts = require('./accounts');
const base = 'via://accounts';

class AccountsPackage {
    activate(){
        this.disposables = new CompositeDisposable();

        this.disposables.add(via.commands.add('via-workspace', {
            'accounts:toggle': () => this.getAccountsInstance().toggle(),
            'accounts:show': () => this.getAccountsInstance().show(),
            'accounts:hide': () => this.getAccountsInstance().hide(),
            'accounts:focus': () => this.getAccountsInstance().focus(),
            'accounts:unfocus': () => this.getAccountsInstance().unfocus()
        }));

        if(this.shouldAttachAccounts()){
            via.workspace.open(this.getAccountsInstance(), {activateItem: false, activatePane: false});
        }
    }

    shouldAttachAccounts(){
        return false;
    }

    getAccountsInstance(state = {}){
        console.log('dsa', state)
        if(!this.accounts){
            this.accounts = new Accounts(state);
            this.accounts.onDidDestroy(() => this.accounts = null);
        }

        return this.accounts;
    }

    deactivate(){
        if(this.accounts){
            this.accounts.destroy();
        }

        this.disposables.dispose();
        this.disposables = null;
    }
}

module.exports = new AccountsPackage();
