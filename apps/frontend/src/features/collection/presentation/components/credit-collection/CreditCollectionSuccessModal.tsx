import React from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import AppRoutes from '../../../../app-routes/entities/AppRoutes';
import CreditCollectionSuccessModalStore from '../../stores/CreditCollectionSuccessModalStore';

import ModalWindow from '../../../../../core/presentation/components/ModalWindow';
import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import Actions, { ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button, { ButtonColor, ButtonType } from '../../../../../core/presentation/components/Button';

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../../styles/credit-collection-success-modal.css';
import ColumnLayout from '../../../../../core/presentation/components/ColumnLayout';

type Props = {
    creditCollectionSuccessModalStore?: CreditCollectionSuccessModalStore;
}

function CreditCollectionSuccessModal({ creditCollectionSuccessModalStore }: Props) {
    const navigate = useNavigate();

    function onClickClose() {
        creditCollectionSuccessModalStore.hide();
        navigate(AppRoutes.CREDIT_MINING_FARM);
    }

    function onClickNewCollection() {
        window.location.reload();
    }

    return (
        <ModalWindow className = { 'CreditCollectionSuccessModal' } modalStore = { creditCollectionSuccessModalStore }>
            <ColumnLayout className = { 'CreditCollectionSuccessModalCnt' }>
                <Svg className={'SuccessSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                <div className={'H2 ExtraBold'}>Success!</div>
                <div className={'H3'}>Transaction was successfully executed.</div>
                <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER}>
                    <Button color = { ButtonColor.SCHEME_4 } onClick={onClickClose}>
                        Close
                    </Button>
                    <Button onClick={onClickNewCollection}>
                        <Svg svg={AddIcon} />
                        Create New Collection
                    </Button>
                </Actions>
            </ColumnLayout>
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionSuccessModal));
