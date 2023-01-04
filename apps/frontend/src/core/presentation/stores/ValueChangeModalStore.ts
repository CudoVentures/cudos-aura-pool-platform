import { action, makeObservable, observable } from 'mobx';
import { InputType } from '../components/Input';
import ModalStore from './ModalStore';
import { InputValidation } from './ValidationState';

const DEFAULT_BUTTON_TEXT = 'Submit';

export default class ValueChangeModalStore extends ModalStore {

    @observable modalHeader: string;
    @observable inputLabels: string[];
    @observable inputValidations: InputValidation[][];
    @observable values: string[];
    @observable submitButtonText: string;
    @observable inputTypes: InputType[];
    @observable onSubmitCallback: (inputs: string[]) => Promise<void>;

    constructor() {
        super();

        this.modalHeader = '';
        this.inputLabels = [];
        this.values = [];
        this.inputValidations = [];
        this.submitButtonText = '';
        this.inputTypes = [];
        this.onSubmitCallback = null;

        makeObservable(this);
    }

    @action
    showSignal(
        modalHeader: string,
        inputLabels: string[],
        values: string[],
        inputValidations: InputValidation[][],
        inputTypes: InputType[],
        onSubmitCallback: (inputs: string[]) => Promise<void>,
        submitButtonText?: string,
    ) {
        this.modalHeader = modalHeader;
        this.inputLabels = inputLabels;
        this.values = values;
        this.inputValidations = inputValidations;
        this.submitButtonText = submitButtonText ?? DEFAULT_BUTTON_TEXT;
        this.inputTypes = inputTypes;
        this.onSubmitCallback = onSubmitCallback;

        this.show();
    }

    hide = action(() => {
        this.modalHeader = '';
        this.inputLabels = [];
        this.values = [];
        this.inputValidations = [];
        this.submitButtonText = '';
        this.inputTypes = [];
        this.onSubmitCallback = null;

        super.hide();
    })

    onInputChange = action((index, input) => {
        this.values[index] = input;
    })

    onSubmit = async () => {
        try {
            await this.onSubmitCallback(this.values);

            this.hide();
        } catch (e) {
            console.log(e);
        }
    }
}
