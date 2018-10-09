const {CompositeDisposable, Disposable, Emitter} = require('via');
const Positions = require('./positions');
const base = 'via://positions';

const InterfaceConfiguration = {
    name: 'Positions',
    description: 'An overview of your trading positions by asset or trading account.',
    command: 'positions:create-positions',
    uri: base
};

class PositionsPackage {
    initialize(){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.positions = [];

        this.disposables.add(via.commands.add('via-workspace', 'positions:create-positions', this.create.bind(this)));

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri === base || uri.startsWith(base + '/')){
                const positions = new Positions({manager: this, omnibar: this.omnibar}, {uri});

                this.positions.push(positions);
                this.emitter.emit('did-create-positions', positions);

                return positions;
            }
        }, InterfaceConfiguration));
    }

    deserialize(state){
        const positions = Positions.deserialize({manager: this, omnibar: this.omnibar}, state);
        this.positions.push(positions);
        return positions;
    }

    create(e){
        e.stopPropagation();

        if(e.currentTarget.classList.contains('market')){
            via.workspace.open(`${base}/market/${e.currentTarget.market.uri()}`, {});
        }else{
            via.workspace.open(base);
        }
    }

    consumeActionBar(actionBar){
        this.omnibar = actionBar.omnibar;

        for(const positions of this.positions){
            positions.consumeOmnibar(this.omnibar);
        }
    }

    deactivate(){
        if(this.positions){
            this.positions.destroy();
        }

        this.disposables.dispose();
        this.disposables = null;
    }
}

module.exports = new PositionsPackage();
