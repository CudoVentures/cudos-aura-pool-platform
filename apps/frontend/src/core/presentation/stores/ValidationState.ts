import { isValidAddress } from 'cudosjs';
import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import S from '../../utilities/Main';
import { validate } from 'bitcoin-address-validation';

export default class ValidationState {

    inputValidations: InputValidation[];

    constructor() {
        this.inputValidations = [];

        makeAutoObservable(this);
    }

    addValidation(errorMessage, checkValidInput: (value) => boolean): InputValidation {
        const inputValidation = new InputValidation();
        inputValidation.errorMessage = errorMessage;
        inputValidation.checkValidInput = checkValidInput;

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    addEmptyValidation(errorMessage?: string): InputValidation {
        const inputValidation = InputValidation.emptyValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

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

    addEmailValidation(errorMessage?: string) {
        const inputValidation = InputValidation.emailValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    addPasswordValidation(errorMessage?: string) {
        const inputValidation = InputValidation.passwordValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

    addCudosAddressValidation(errorMessage?: string) {
        const inputValidation = InputValidation.cudosAddressValidation(errorMessage);

        this.inputValidations.push(inputValidation);

        return inputValidation;
    }

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

    setShowErrors = (showErrors: boolean) => {
        this.inputValidations.forEach((element) => {
            element.showError = showErrors;
        })
    }
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

    onChange = (value: any) => {
        this.isError = this.checkValidInput(value) === false;
    }

    setErrorMessage(errorMessage?: string) {
        if (errorMessage !== undefined) {
            this.errorMessage = errorMessage;
        }
    }

    static emptyValidation(errorMessage?: string): InputValidation {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = (value) => value !== null && value !== undefined && value !== S.Strings.EMPTY;

        return validation;
    }

    static emailValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = (value) => {
            const result = value.toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                )
            return result !== null;
        };
        return validation;
    }

    static passwordValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = (value) => value.length >= 6;

        return validation;
    }

    static cudosAddressValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = (value) => isValidAddress(value);

        return validation;
    }

    static bitcoinAddressValidation(errorMessage?: string) {
        const validation = new InputValidation();

        validation.setErrorMessage(errorMessage);
        validation.checkValidInput = (value) => validate(value);

        return validation;
    }
}
