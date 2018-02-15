"use babel";
/** @jsx etch.dom */

const {Disposable, CompositeDisposable} = require('via');
const etch = require('etch');
const ViaTable = require('via-table');
const base = 'via://accounts';

module.exports = class Accounts {
    constructor(state){
        this.disposables = new CompositeDisposable();
        this.accounts = via.accounts.active();

        this.disposables.add(via.accounts.observeAccounts(account => {
            this.disposables.add(account.onDidUpdatePosition(this.update.bind(this)));
        }));

        this.disposables.add(via.accounts.onDidActivateAccount(this.update.bind(this)));
        this.disposables.add(via.accounts.onDidDeactivateAccount(this.update.bind(this)));
        this.disposables.add(via.config.observe('accounts.hideZeroValues', this.update.bind(this)));

        this.columns = [
            {accessor: asset => asset[0]},
            {accessor: asset => asset[1].free.toFixed(8)},
            {accessor: asset => asset[1].used.toFixed(8)},
            {accessor: asset => asset[1].total.toFixed(8)}
        ];

        etch.initialize(this);
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }

    update(){
        this.accounts = via.accounts.active();
        etch.update(this);
    }

    render(){
        return (
            <div className='accounts'>
                <div className='thead'>
                    <div className='td'>Asset</div>
                    <div className='td'>Available</div>
                    <div className='td'>Locked</div>
                    <div className='td'>Total</div>
                </div>
                <div className='accounts-list'>
                    {this.rows()}
                </div>
            </div>
        );
    }

    rows(){
        const result = [];
        const hide = via.config.get('accounts.hideZeroValues');

        for(const account of this.accounts){
            result.push(
                <div className='tr account'>
                    <div className='td'>{account.name || 'Untitled Account'} ({account.exchange.name})</div>
                </div>
            );

            const currencies = Object.keys(account.exchange.currencies);

            const assets = Object.entries(account.getPosition()).filter(([asset, balance]) => {
                if(!currencies.includes(asset)) return false;
                if(hide && balance.total === 0) return false;
                return true;
            });

            if(assets.length){
                result.push(
                    <ViaTable columns={this.columns} data={assets}></ViaTable>
                );
            }else{
                result.push(
                    <div className='tr empty'>
                        <div className='td'>This account has no asset position.</div>
                    </div>
                );
            }
        }

        return result;
    }

    getDefaultLocation(){
        return 'bottom';
    }

    getPreferredLocation(){
        return this.getDefaultLocation();
    }

    isPermanentDockItem(){
        return false;
    }

    getTitle(){
        return 'Accounts';
    }

    getURI(){
        return base;
    }
}
