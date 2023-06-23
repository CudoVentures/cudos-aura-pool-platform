import React from 'react';
import { inject, observer } from 'mobx-react';
import { useNavigate } from 'react-router-dom';

import BuyPresaleNftModalStore from '../stores/BuyPresaleNftModalStore';
import AppRoutes from '../../../app-routes/entities/AppRoutes';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Actions, { ActionsHeight } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import ColumnLayout from '../../../core/presentation/components/ColumnLayout';
import InfoBlueBox, { InfoAlignment } from '../../../core/presentation/components/InfoBlueBox';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../styles/buy-presale-nft-modal.css';

type Props = {
    buyPresaleNftModalStore?: BuyPresaleNftModalStore;
}

function BuyPresaleNftModal({ buyPresaleNftModalStore }: Props) {

    const navigate = useNavigate();

    function onClickProfile() {
        navigate(AppRoutes.USER_PROFILE);
        buyPresaleNftModalStore.hide();
    }

    return (
        <ModalWindow
            className = { 'BuyPresaleNftModal MediumContent' }
            modalStore = { buyPresaleNftModalStore } >

            <ColumnLayout className = { 'BuyPresaleNftModalContent FlexColumn' } gap = { 24 } >

                <Svg className={'BigSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                <div className={'H2 Bold'}>Congratulations!!</div>
                <div className={'H3 Info'}>You’re now a proud owner of a Blockmole Hashrate NFT. Head over to your Profile Page to see which one you got - good luck!</div>

                <InfoBlueBox alignment = { InfoAlignment.TOP } >
                    If for some reason there was an error, rest assured that you’ll be automatically refunded or able to claim a refund on your Profile Page.
                </InfoBlueBox>

                <Actions height={ActionsHeight.HEIGHT_48}>
                    <Button onClick = { onClickProfile } >To Profile Page</Button>
                </Actions>

            </ColumnLayout>

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(BuyPresaleNftModal));
