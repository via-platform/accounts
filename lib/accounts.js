"use babel";
/** @jsx etch.dom */

const {Disposable, CompositeDisposable, Emitter} = require('via');
const etch = require('etch');
const _ = require('underscore-plus');
const ViaTable = require('via-table');
const base = 'via://accounts';

module.exports = class Accounts {
    constructor(state){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.accounts = via.accounts.all();

        this.disposables.add(via.accounts.onDidUpdateAccountPosition(this.update.bind(this)));
        this.disposables.add(via.accounts.onDidUpdateAccountStatus(this.update.bind(this)));
        this.disposables.add(via.accounts.onDidInitialize(this.update.bind(this)));
        this.disposables.add(via.config.observe('accounts.hideZeroValues', this.update.bind(this)));

        this.columns = [
            {
                name: 'asset',
                title: 'Asset',
                default: true,
                classes: asset => asset[1].type ? asset[1].type : '',
                accessor: asset => asset[0]
            },
            {
                name: 'available',
                title: 'Available',
                default: true,
                accessor: asset => _.isNumber(asset[1].free) ? asset[1].free.toFixed(8) : ''
            },
            {
                name: 'locked',
                title: 'Locked',
                default: true,
                accessor: asset => _.isNumber(asset[1].used) ? asset[1].used.toFixed(8) : ''
            },
            {
                name: 'total',
                title: 'Total',
                default: true,
                accessor: asset => _.isNumber(asset[1].total) ? asset[1].total.toFixed(8) : ''
            }
        ];

        etch.initialize(this);

        this.disposables.add(via.commands.add(this.element, 'accounts:update-positions', this.updatePositions.bind(this)));
    }

    serialize(){
        return {
            deserializer: 'Accounts'
        };
    }

    toggle(){
        via.workspace.toggle(this);
    }

    show(focus){
        via.workspace.open(this, {searchAllPanes: true, activatePane: false, activateItem: false})
        .then(() => {
            via.workspace.paneContainerForURI(this.getURI()).show();
            if(focus) this.focus();
        });
    }

    focus(){
        this.element.focus();
    }

    unfocus(){
        via.workspace.getCenter().activate();
    }

    hasFocus(){
        return document.activeElement === this.element;
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);

        this.emitter.emit('did-destroy');
        this.emitter.dispose();
    }

    updatePositions(){
        via.accounts.all().forEach(account => account.update());
    }

    update(){
        this.accounts = via.accounts.all();
        etch.update(this);
    }

    render(){
        return (
            <div className='accounts'>
                <ViaTable columns={this.columns} data={this.rows()}></ViaTable>
            </div>
        );
    }

    rows(){
        const result = [];

        for(const account of this.accounts){
            if(result.length){
                result.push(['', {type: 'placeholder'}]);
            }

            result.push([`${account.name} (${account.exchange.name})`, {type: 'account'}]);

            const currencies = via.assets.list();

            const assets = Object.entries(account.getPosition()).filter(([asset, balance]) => {
                if(!currencies.includes(asset)) return false;
                if(balance.total === 0) return false;
                return true;
            });

            if(assets.length){
                result.push(...assets);
            }else{
                result.push(['This account has no position.', {type: 'placeholder'}]);
            }
        }

        return result;
    }

    getTitle(){
        return 'Accounts';
    }

    getURI(){
        return base;
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }
}
