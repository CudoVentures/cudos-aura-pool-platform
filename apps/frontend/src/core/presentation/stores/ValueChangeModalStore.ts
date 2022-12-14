import { action, makeObservable, observable } from 'mobx';
import { InputType } from '../components/Input';
import ModalStore from './ModalStore';
import { InputValidation } from './ValidationState';

const DEFAULT_BUTTON_TEXT = 'Submit';

export default class ValueChangeModalStore extends ModalStore {

    @observable modalHeader: string;
    @observable inputLabel: string;
    @observable inputValidations: InputValidation[];
    @observable value: string;
    @observable submitButtonText: string;
    @observable inputType: InputType;
    @observable onSubmitCallback: (input: string) => Promise<void>;

    constructor() {
        super();

        this.modalHeader = '';
        this.inputLabel = '';
        this.value = '';
        this.inputValidations = [];
        this.submitButtonText = '';
        this.inputType = InputType.TEXT;
        this.onSubmitCallback = null;

        makeObservable(this);
    }

    @action
    showSignal(
        modalHeader: string,
        inputLabel: string,
        value: string,
        inputValidations: InputValidation[],
        inputType: InputType,
        onSubmitCallback: (input: string) => Promise<void>,
        submitButtonText?: string,
    ) {
        this.modalHeader = modalHeader;
        this.inputLabel = inputLabel;
        this.value = value;
        this.inputValidations = inputValidations;
        this.submitButtonText = submitButtonText ?? DEFAULT_BUTTON_TEXT;
        this.inputType = inputType;
        this.onSubmitCallback = onSubmitCallback;

        this.show();
    }

    hide = () => {
        this.modalHeader = '';
        this.inputLabel = '';
        this.value = '';
        this.inputValidations = [];
        this.submitButtonText = '';
        this.inputType = null;
        this.onSubmitCallback = null;

        super.hide();
    }

    onInputChange = (input) => {
        this.value = input;
    }

    onSubmit = async () => {
        try {
            await this.onSubmitCallback(this.value);

            this.hide();
        } catch (e) {
            console.log(e);
        }
    }
}
