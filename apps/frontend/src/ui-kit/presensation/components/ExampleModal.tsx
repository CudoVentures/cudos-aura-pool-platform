import React from 'react';
import { inject, observer } from 'mobx-react';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import ExampleModalStore from '../stores/ExampleModalStore';

type Props = {
    exampleModalStore?: ExampleModalStore;
}

function ExampleModal({ exampleModalStore }: Props) {

    return (
        <ModalWindow
            modalStore = { exampleModalStore } >
            { exampleModalStore.content }
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ExampleModal));
