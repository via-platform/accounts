const {CompositeDisposable, Disposable} = require('via');
const Websockets = require('./websockets');
const base = 'via://websockets';

const InterfaceConfiguration = {
    name: 'Websockets',
    description: 'Monitor open websocket connections.',
    command: 'websockets:open',
    uri: base
};

class WebsocketsPackage {
    activate(){
        this.disposables = new CompositeDisposable();
        this.websockets = null;

        this.disposables.add(via.commands.add('via-workspace', {
            'websockets:open': () => via.workspace.open(base),
            'websockets:focus': () => document.querySelector('.websockets').focus()
        }));

        this.disposables.add(via.workspace.addOpener(uri => {
            if(uri.startsWith(base)){
                if(!this.websockets){
                    this.websockets = new Websockets();
                }

                return this.websockets;
            }
        }, InterfaceConfiguration));
    }

    deactivate(){
        this.disposables.dispose();

        if(this.websockets){
            this.websockets.destroy();
        }
    }
}

module.exports = new WebsocketsPackage();
