import React from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../core/utilities/Main';
import ViewCollectionModalStore from '../stores/ViewCollectionModalStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import UploaderComponent from '../../../../core/presentation/components/UploaderComponent';

import ClearIcon from '@mui/icons-material/Clear';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import '../styles/view-collection-modal.css';

type Props = {
    viewCollectionModalStore?: ViewCollectionModalStore;
}

function ViewCollectionModal({ viewCollectionModalStore }: Props) {

    return (
        <ModalWindow
            className = { 'ViewCollectionModal' }
            modalStore = { viewCollectionModalStore } >

            { viewCollectionModalStore.visible === true && (
                <div></div>
            ) }

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(ViewCollectionModal));
