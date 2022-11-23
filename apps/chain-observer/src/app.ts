export default class App {

    p: NodeJS.Timeout;

    start() {
        this.p = setInterval(() => {
            console.log('from app 2');
        }, 3000);
    }

    stop() {
        clearInterval(this.p);
    }

}
