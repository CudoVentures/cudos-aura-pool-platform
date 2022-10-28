import React, { useEffect, useRef, useState } from 'react';
import { inject, observer } from 'mobx-react';

import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import EditMiningFarmModalStore from '../stores/EditMiningFarmModalStore';
import Input, { InputType } from '../../../../core/presentation/components/Input';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonRadius } from '../../../../core/presentation/components/Button';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ClearIcon from '@mui/icons-material/Clear';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import '../styles/edit-mining-farm-modal.css';
import UploaderComponent from '../../../../core/presentation/components/UploaderComponent';
import ImageEntity, { PictureType } from '../../../upload-file/entities/ImageEntity';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import S from '../../../../core/utilities/Main';
import ValidationState from '../../../../core/presentation/stores/ValidationState';

type Props = {
    alertStore?: AlertStore;
    editMiningFarmModalStore?: EditMiningFarmModalStore;
}

function EditMiningFarmModal({ alertStore, editMiningFarmModalStore }: Props) {
    const miningFarmEntity = editMiningFarmModalStore.miningFarmEntity;
    const validationState = useRef(new ValidationState()).current;
    const farmNameValidation = useRef(validationState.addEmptyValidation('Empty name')).current;

    function onClickRemoveCoverImage() {
        editMiningFarmModalStore.changeCoverImage(S.Strings.EMPTY);
    }

    function onClickSaveChanges() {
        if (validationState.getIsErrorPresent() === true) {
            validationState.setShowErrors(true);
            return;
        }
        editMiningFarmModalStore.executeMiningFarmEditEdit();
        editMiningFarmModalStore.hide();
    }

    return (
        <ModalWindow modalStore = { editMiningFarmModalStore } >
            {editMiningFarmModalStore.miningFarmEntity !== null && (<div className={'EditMiningFarmModal FlexColumn'}>
                <div
                    className={'CoverPicture FlexColumn'}
                    style={{
                        backgroundImage: `url("${editMiningFarmModalStore.coverImage.base64}")`,
                    }}
                >
                    <div
                        className={'ProfilePicture FlexColumn'}
                        style={{
                            backgroundImage: `url("${editMiningFarmModalStore.profileImage.base64}")`,
                        }}
                    >
                        <div className={'Overlay'} />
                        <div className={'SvgButton FlexRow Clickable'}>
                            <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={BorderColorIcon} />
                            <UploaderComponent
                                id = { this }
                                params = { {
                                    'maxSize': 73400320, // 70MB
                                    'onExceedLimit': () => {
                                        this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                                    },
                                    'multi': true,
                                    onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                        editMiningFarmModalStore.changeProfileImage(base64File);
                                        alertStore.show('success');
                                    },
                                } } />
                        </div>

                    </div>
                    <div className={'Overlay'} />
                    <div className={'FlexRow ButtonsRow'}>
                        <div className={'SvgButton FlexRow Clickable'}>
                            <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={BorderColorIcon} />
                            <UploaderComponent
                                id = { this }
                                params = { {
                                    'maxSize': 73400320, // 70MB
                                    'onExceedLimit': () => {
                                        this.props.alertStore.show('', 'Максималният размер на файловете е 70MB!');
                                    },
                                    'multi': true,
                                    onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                        editMiningFarmModalStore.changeCoverImage(base64File);
                                        alertStore.show('success');
                                    },
                                } } />
                        </div>
                        <div className={'SvgButton FlexRow Clickable'} onClick={onClickRemoveCoverImage}>
                            <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={ClearIcon} />
                        </div>
                    </div>
                </div>
                <Input
                    inputType={InputType.TEXT}
                    label={'Farm Name'}
                    value={miningFarmEntity.name}
                    inputValidation={farmNameValidation}
                    onChange={editMiningFarmModalStore.changeMiningFarmName}
                />
                <Input
                    inputType={InputType.TEXT}
                    label={'Description (Optional)'}
                    value={miningFarmEntity.description}
                    multiline
                    onChange={editMiningFarmModalStore.changeMiningFarmDescription}
                />
                <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL} height={ActionsHeight.HEIGHT_48}>
                    <Button
                        radius={ButtonRadius.DEFAULT}
                        onClick={onClickSaveChanges}
                    >Save Changes</Button>
                </Actions>
            </div>)}

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(EditMiningFarmModal));
