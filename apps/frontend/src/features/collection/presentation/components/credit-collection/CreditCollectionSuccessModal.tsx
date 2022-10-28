import React from 'react';
import { inject, observer } from 'mobx-react';
import CreditCollectionSuccessModalStore from '../../stores/CreditCollectionSuccessModalStore';
import ModalWindow from '../../../../../core/presentation/components/ModalWindow';
import Svg, { SvgSize } from '../../../../../core/presentation/components/Svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Actions, { ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button from '../../../../../core/presentation/components/Button';
import AddIcon from '@mui/icons-material/Add';
import '../../styles/credit-collection-success-modal.css';
import { useNavigate } from 'react-router-dom';
import AppRoutes from '../../../../app-routes/entities/AppRoutes';

type Props = {
    creditCollectionSuccessModalStore?: CreditCollectionSuccessModalStore;
}

function CreditCollectionSuccessModal({ creditCollectionSuccessModalStore }: Props) {
    const navigate = useNavigate();

    function onClickNewCollection() {
        navigate(AppRoutes.CREDIT_COLLECTION_DETAILS);
    }

    return (
        <ModalWindow modalStore = { creditCollectionSuccessModalStore }>
            <div className={'FlexColumn CreditCollectionSuccessModal'}>
                <Svg className={'SuccessSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                <div className={'H2 Bold'}>Success!</div>
                <div className={'H3'}>Transaction was successfully executed.</div>
                <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER}>
                    <Button onClick={creditCollectionSuccessModalStore.hide}>
                        Close
                    </Button>
                    <Button onClick={onClickNewCollection}>
                        <Svg svg={AddIcon} />
                        Create New Collection
                    </Button>
                </Actions>
            </div>
        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionSuccessModal));
