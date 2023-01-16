import { action, makeAutoObservable } from 'mobx';
import { isValidAddress } from 'cudosjs';
import { Network, validate } from 'bitcoin-address-validation';

import S from '../../utilities/Main';

// CONFIGURATIONS
declare let Config;
const BTC_NETWORK = Config.APP_BTC_NETWORK === 'testnet' ? Network.testnet : Network.mainnet;

export default class ValidationState {

    inputValidations: InputValidation[];

    constructor() {
        this.inputValidations = [];

        makeAutoObservable(this);
    }

    @action
    addValidation(errorMessage, checkValidInput: (value) => boolean): InputValidation {
        const inputValidation = new InputValidation();
        inputValidation.errorMessage = errorMessage;
        inputValidation.checkValidInput = checkValidInput;

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    @action
    addEmptyValidation(errorMessage?: string): InputValidation {
        const inputValidation = InputValidation.emptyValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    @action
    addMatchStringsValidation(errorMessage?: string): InputValidation[] {
        let firstValue = '', secondValue = '';

        const firstInputValidation = new InputValidation();
        firstInputValidation.setErrorMessage(errorMessage);
        firstInputValidation.checkValidInput = (value: any): boolean => {
            firstValue = value;
            secondInputValidation.isError = firstValue !== secondValue;
            return firstValue === secondValue;
        };

        const secondInputValidation = new InputValidation()
        secondInputValidation.setErrorMessage(errorMessage);
        secondInputValidation.checkValidInput = (value: any): boolean => {
            secondValue = value;
            firstInputValidation.isError = firstValue !== secondValue;
            return firstValue === secondValue;
        };

        this.inputValidations.push(firstInputValidation);
        this.inputValidations.push(secondInputValidation);

        return [firstInputValidation, secondInputValidation];
    }

    @action
    addEmailValidation(errorMessage?: string) {
        const inputValidation = InputValidation.emailValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    @action
    addPasswordValidation(errorMessage?: string) {
        const inputValidation = InputValidation.passwordValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    @action
    addCudosAddressValidation(errorMessage?: string) {
        const inputValidation = InputValidation.cudosAddressValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    @action
    addBitcoinAddressValidation(errorMessage?: string) {
        const inputValidation = InputValidation.bitcoinAddressValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    getIsErrorPresent(): boolean {
        const validation = this.inputValidations.find((element) => {
            return element.isError === true;
        });

        return validation !== undefined;
    }

    setShowErrors = action((showErrors: boolean) => {
        this.inputValidations.forEach((element) => {
            element.showError = showErrors;
        })
    })
}

export class InputValidation {
    errorMessage: string;
    isError: boolean;
    showError: boolean;

    checkValidInput: (value: any) => boolean;

    constructor() {
        this.errorMessage = S.Strings.EMPTY;
        this.isError = false;
        this.showError = false;
        this.checkValidInput = null;

        makeAutoObservable(this);
    }

    onChange = action((value: any) => {
        this.isError = this.checkValidInput(value) === false;
    })

    @action
    setErrorMessage(errorMessage?: string) {
        if (errorMessage !== undefined) {
            this.errorMessage = errorMessage;
        }
    }

    static emptyValidation(errorMessage?: string): InputValidation {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = action((value) => value !== null && value !== undefined && value !== S.Strings.EMPTY);

        return validation;
    }

    static emailValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = action((value) => {
            const result = value.toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                )
            return result !== null;
        });
        return validation;
    }

    static passwordValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = action((value) => {
            if (value.length < 8) {
                return false;
            }

            let hasSpecialChar = false;
            let hasNumber = false;
            let hasUpperCase = false;
            let hasLowerCase = false;

            const specialCharSet = new Set(['~', ':', '\'', '+', '[', '\\', '@', '^', '{', '%', '(', '-', '"', '*', '|', ',', '&', '<', '`', '}', '.', '_', '=', ']', '!', '>', ';', '?', '#', '$', ')', '/']);
            for (let i = value.length; i-- > 0;) {
                hasSpecialChar ||= specialCharSet.has(value[i]) === true;
                hasNumber ||= value[i] >= '0' && value[i] <= '9';
                hasLowerCase ||= value[i] === value[i].toLowerCase() && value[i] !== value[i].toUpperCase();
                hasUpperCase ||= value[i] === value[i].toUpperCase() && value[i] !== value[i].toLowerCase();
            }

            return hasSpecialChar && hasNumber && hasLowerCase && hasUpperCase;
        });

        return validation;
    }

    static cudosAddressValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = action((value) => isValidAddress(value));

        return validation;
    }

    static bitcoinAddressValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = action((value) => validate(value, BTC_NETWORK));

        return validation;
    }
}
