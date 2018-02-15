const {CompositeDisposable, Disposable} = require('via');
const Accounts = require('./accounts');
const base = 'via://accounts';

const InterfaceConfiguration = {
    name: 'Accounts',
    description: 'View all available accounts and positions.',
    command: 'accounts:open',
    uri: base
};

class AccountsPackage {
    activate(){
        this.disposables = new CompositeDisposable();
        this.accounts = null;

        this.disposables.add(via.commands.add('via-workspace', {
            'accounts:open': () => via.workspace.open(base)
        }));

        this.disposables.add(via.workspace.addOpener(uri => {
            if(uri === base || uri.startsWith(base + '/')){
                if(!this.accounts){
                    this.accounts = new Accounts();
                }

                return this.accounts;
            }
        }, InterfaceConfiguration));
    }

    deactivate(){
        this.disposables.dispose();

        if(this.accounts){
            this.accounts.destroy();
        }
    }
}

module.exports = new AccountsPackage();
