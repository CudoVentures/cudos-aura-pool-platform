import Config from '../../config/Config';
import { EmailRepo } from '../workers/repos/EmailRepo';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

export class EmailApi extends EmailRepo {

    transport: any;

    constructor() {
        super();

        if (Config.ENV_PRODUCTION === true) {
            sgMail.setApiKey(Config.APP_SENDGRID_API_KEY);
            this.transport = null;
        }

        if (Config.ENV_DEV === true) {
            this.transport = nodemailer.createTransport({
                host: 'cudos-markets-mailhog',
                port: 1025,
            });
        }
    }

    async sendEmail(content: string) {
        const emailObj = {
            from: Config.APP_EMAIL_FROM,
            to: Config.APP_SERVICE_EMAIL,
            subject: 'CudosChainObserver - Error',
            text: content,
        };

        try {
            if (Config.ENV_PRODUCTION === true) {
                await sgMail.send(emailObj);
            }

            if (Config.ENV_DEV === true) {
                await this.transport.sendMail(emailObj);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

}
