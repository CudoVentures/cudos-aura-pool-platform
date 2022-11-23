import App from './app';

type Module = {
    hot: any;
}

async function main() {
    const app = new App();
    app.start();

    const mod = module as unknown as Module;
    if (mod.hot) {
        mod.hot.accept();
        mod.hot.dispose(() => app.stop());
    }
}

main();
