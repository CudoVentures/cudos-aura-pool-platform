import React from 'react';
import { inject, observer } from 'mobx-react';

import S from '../../../../core/utilities/Main';
import EditMiningFarmModalStore from '../stores/EditMiningFarmModalStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';

import ModalWindow from '../../../../core/presentation/components/ModalWindow';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import UploaderComponent from '../../../../core/presentation/components/UploaderComponent';

import ClearIcon from '@mui/icons-material/Clear';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import '../styles/edit-mining-farm-modal.css';

type Props = {
    alertStore?: AlertStore;
    editMiningFarmModalStore?: EditMiningFarmModalStore;
}

function EditMiningFarmModal({ alertStore, editMiningFarmModalStore }: Props) {
    function onClickRemoveCoverImage() {
        editMiningFarmModalStore.changeCoverImage(S.Strings.EMPTY);
    }

    function onClickSaveChanges() {
        editMiningFarmModalStore.executeMiningFarmEditEdit();
        editMiningFarmModalStore.hide();
    }

    return (
        <ModalWindow modalStore = { editMiningFarmModalStore } >
            { editMiningFarmModalStore.visible === true && (
                <div className={'EditMiningFarmModal FlexColumn'}>
                    <div
                        className={'CoverPicture FlexColumn'}
                        style={ ProjectUtils.makeBgImgStyle(editMiningFarmModalStore.coverImage.base64) } >
                        <div
                            className={'ProfilePicture FlexColumn'}
                            style={ ProjectUtils.makeBgImgStyle(editMiningFarmModalStore.profileImage.base64) } >
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
                    <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                        <Button onClick={onClickSaveChanges}>Save Changes</Button>
                    </Actions>
                </div>
            ) }
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(EditMiningFarmModal));
