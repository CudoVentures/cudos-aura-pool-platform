import React from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import EditUserModalStore from '../stores/EditUserModalStore';
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
import '../styles/edit-user-modal.css';

type Props = {
    alertStore?: AlertStore;
    snackStore?: SnackStore;
    editUserModalStore?: EditUserModalStore;
}

function EditUserModal({ alertStore, snackStore, editUserModalStore }: Props) {

    function onClickRemoveCoverImage() {
        editUserModalStore.changeCoverImage(S.Strings.EMPTY);
    }

    async function onClickSaveChanges() {
        await editUserModalStore.editSessionUser();
        editUserModalStore.onFinish();
        editUserModalStore.hide();
        snackStore.showSuccess('Profile was updated');
    }

    return (
        <ModalWindow className = { 'EditUserModal' } modalStore = { editUserModalStore } >
            { editUserModalStore.visible === true && (
                <>
                    <div className = { 'ModalTitleRow' } >
                        <div className = { 'H3 Bold' } >Edit Profile</div>
                    </div>
                    <div
                        className={'CoverPicture FlexColumn'}
                        style={ ProjectUtils.makeBgImgStyle(editUserModalStore.coverImage.base64) } >
                        <div
                            className={'ProfilePicture FlexColumn'}
                            style={ ProjectUtils.makeBgImgStyle(editUserModalStore.profileImage.base64) } >
                            <div className={'Overlay'} />
                            <div className={'SvgButton FlexRow Clickable'}>
                                <Svg className={'SvgButtonSvg'} size={SvgSize.CUSTOM} svg={BorderColorIcon} />
                                <UploaderComponent
                                    id = { this }
                                    params = { {
                                        'maxSize': 1 << 20, // 1 MB
                                        'fileExt': '.png, .jpg',
                                        'onExceedLimit': () => {
                                            alertStore.show('Max file size is 1MB!');
                                        },
                                        onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                            editUserModalStore.changeProfileImage(base64File);
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
                                        'maxSize': 1 << 20, // 1 MB
                                        'fileExt': '.png, .jpg',
                                        'onExceedLimit': () => {
                                            alertStore.show('Max file size is 1MB!');
                                        },
                                        onReadFileAsBase64: (base64File, responseData, files: any[], i: number) => {
                                            editUserModalStore.changeCoverImage(base64File);
                                        },
                                    } } />
                            </div>
                            <div className={'SvgButton FlexRow Clickable'} onClick={onClickRemoveCoverImage}>
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

export default inject((stores) => stores)(observer(EditUserModal));
