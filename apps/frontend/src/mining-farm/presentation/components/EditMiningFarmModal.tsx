import React from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import EditMiningFarmModalStore from '../stores/EditMiningFarmModalStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import SnackStore from '../../../core/presentation/stores/SnackStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Actions, { ActionsLayout } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import UploaderComponent from '../../../core/presentation/components/UploaderComponent';

import ClearIcon from '@mui/icons-material/Clear';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import '../styles/edit-mining-farm-modal.css';

type Props = {
    alertStore?: AlertStore;
    snackStore?: SnackStore;
    editMiningFarmModalStore?: EditMiningFarmModalStore;
}

function EditMiningFarmModal({ alertStore, snackStore, editMiningFarmModalStore }: Props) {
    function onClickRemoveCoverImage() {
        editMiningFarmModalStore.changeCoverImage(S.Strings.EMPTY);
    }

    function onClickRemoveProfileImage() {
        editMiningFarmModalStore.changeProfileImage(S.Strings.EMPTY);
    }

    async function onClickSaveChanges() {
        await editMiningFarmModalStore.executeMiningFarmEditEdit();
        editMiningFarmModalStore.onFinish();
        editMiningFarmModalStore.hide();
        snackStore.showSuccess('Profile was updated');
    }

    return (
        <ModalWindow className = { 'EditMiningFarmModal' } modalStore = { editMiningFarmModalStore } >
            { editMiningFarmModalStore.visible === true && (
                <>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H3 Bold' } >Edit Profile</div>
                    </div>
                    <div
                        className={'CoverPicture FlexColumn'}
                        style={ ProjectUtils.makeBgImgStyle(editMiningFarmModalStore.coverImage.base64) } >
                        <div className={'Overlay'} />
                        <div className={'FlexRow ButtonsRow'}>
                            <div className={'SvgButton FlexRow Clickable'}>
                                <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={BorderColorIcon} />
                                <UploaderComponent
                                    id = { this }
                                    params = { {
                                        'maxSize': 73400320, // 70MB
                                        'onExceedLimit': () => {
                                            alertStore.show('File limit is 70MB!');
                                        },
                                        onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                            editMiningFarmModalStore.changeCoverImage(base64File);
                                        },
                                    } } />
                            </div>
                            <div className={'SvgButton FlexRow Clickable'} onClick={onClickRemoveCoverImage}>
                                <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={ClearIcon} />
                            </div>
                        </div>
                    </div>
                    <div
                        className={'ProfilePicture FlexColumn'}
                        style={ ProjectUtils.makeBgImgStyle(editMiningFarmModalStore.profileImage.base64) } >
                        <div className={'Overlay'} />
                        <div className={'FlexRow ButtonsRow'}>
                            <div className={'SvgButton FlexRow Clickable'}>
                                <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={BorderColorIcon} />
                                <UploaderComponent
                                    id = { this }
                                    params = { {
                                        'maxSize': 73400320, // 70MB
                                        'onExceedLimit': () => {
                                            alertStore.show('File limit is 70MB!');
                                        },
                                        onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                            editMiningFarmModalStore.changeProfileImage(base64File);
                                        },
                                    } } />
                            </div>
                            <div className={'SvgButton FlexRow Clickable'} onClick={onClickRemoveProfileImage}>
                                <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={ClearIcon} />
                            </div>
                        </div>
                    </div>
                    <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                        <Button onClick={onClickSaveChanges}>Save Changes</Button>
                    </Actions>
                </>
            ) }
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(EditMiningFarmModal));
