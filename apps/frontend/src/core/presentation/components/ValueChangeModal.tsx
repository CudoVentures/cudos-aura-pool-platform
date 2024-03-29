import React from 'react';
import { inject, observer } from 'mobx-react';

import ModalWindow from './ModalWindow';
import Button from './Button';
import Input from './Input';
import Actions, { ActionsLayout } from './Actions';
import ColumnLayout from './ColumnLayout';
import '../styles/value-change-modal.css';
import ValueChangeModalStore from '../stores/ValueChangeModalStore';

type Props = {
    valueChangeModalStore?: ValueChangeModalStore;
}

function ValueChangeModal({ valueChangeModalStore }: Props) {
    const {
        modalHeader,
        inputLabels,
        values,
        inputValidations,
        submitButtonText,
        inputTypes,
        onInputChange,
        onSubmit,
    } = valueChangeModalStore;

    return (
        <ModalWindow
            className = { 'ChangeValueModal' }
            modalStore = { valueChangeModalStore } >
            <div className = { 'TitleCnt' } >
                <div className = { 'Title H2 Bold' } >{modalHeader}</div>
            </div>
            <ColumnLayout>
                {inputLabels.map((label, i) => <Input
                    key={i}
                    label={label}
                    inputType={inputTypes[i]}
                    value={values[i]}
                    inputValidation={ inputValidations[i] }
                    onChange={(value) => onInputChange(i, value)}/>)}
                <Actions className = { 'SubmitButton' } layout = { ActionsLayout.LAYOUT_COLUMN_FULL }>
                    <Button onClick={onSubmit} > {submitButtonText} </Button>
                </Actions>
            </ColumnLayout>
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ValueChangeModal));
