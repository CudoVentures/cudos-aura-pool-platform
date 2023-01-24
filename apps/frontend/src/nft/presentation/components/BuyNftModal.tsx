import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';

import BuyNftModalStore from '../stores/BuyNftModalStore';
import ResellNftModalStore from '../stores/ResellNftModalStore';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import ReportIcon from '@mui/icons-material/Report';
import '../styles/buy-nft-modal.css';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import TextWithTooltip from '../../../core/presentation/components/TextWithTooltip';
import AlertStore from '../../../core/presentation/stores/AlertStore';

type Props = {
    cudosStore?: CudosStore,
    alertStore?: AlertStore,
    resellNftModalStore?: ResellNftModalStore;
    buyNftModalStore?: BuyNftModalStore;
}

function BuyNftModal({ cudosStore, alertStore, resellNftModalStore, buyNftModalStore }: Props) {
    const nftEntity = buyNftModalStore.nftEntity;

    useEffect(() => {
        cudosStore.init();
    }, []);

    function onClickResellNft() {
        resellNftModalStore.showSignal(buyNftModalStore.nftEntity, buyNftModalStore.cudosPrice, buyNftModalStore.collectionEntity);
        buyNftModalStore.hide();
    }

    function onClickPurchaseNft() {
        if (buyNftModalStore.recipient === '') {
            alertStore.show('You must specify BTC reward adress in your profile');
            return;
        }

        buyNftModalStore.buyNft();
    }
    return (
        <ModalWindow
            className = { 'BuyNftPopup' }
            modalStore = { buyNftModalStore }
            hasClose = { buyNftModalStore.isStageProcessing() === false } >

            <AnimationContainer className = { 'Stage Preview FlexColumn' } active = { buyNftModalStore.isStagePreview() } >

                {buyNftModalStore.isStagePreview() === true && (
                    <>
                        <div className={'H3 Bold'}>Buy NFT</div>
                        <div className={'BorderContainer FlexRow'}>
                            <div className={'NftPicture'} style = { ProjectUtils.makeBgImgStyle(nftEntity.imageUrl) } />
                            <div className={'NftInfo FlexColumnt'}>
                                <div className={'CollectionName B2 SemiBold Gray'}>{buyNftModalStore.collectionEntity.name}</div>
                                <div className={'NftName H2 Bold'}>{nftEntity.name}</div>
                                <div className={'Price FlexRow'}>
                                    <div className={'H3 Bold'}>{buyNftModalStore.formatPricePlusMintFeeInCudos() }</div>
                                    <div className={'B2 SemiBold Gray'}>{buyNftModalStore.formatPricePlusMintFeeInUsd()}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <TextWithTooltip text={'Rewards Recepient Address'} tooltipText={'You can change this from Profile page'} />
                            <div className = { 'ColorPrimary060 Bold' } >{buyNftModalStore.recipient}</div>
                        </div>
                        <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                            <Button onClick={onClickPurchaseNft}>Complete Purchase</Button>
                        </Actions>
                    </>
                ) }

            </AnimationContainer>

            <AnimationContainer className = { 'Stage Processing FlexColumn' } active = { buyNftModalStore.isStageProcessing() } >

                { buyNftModalStore.isStageProcessing() === true && (
                    <>
                        <div className={'H2 Bold'}>Processing...</div>
                        <div className={'Info'}>
                            <div className={'H3'}>Check your wallet for detailed information.</div>
                            <div className={'H3'}>Sign the transaction.</div>
                        </div>
                    </>
                ) }

            </AnimationContainer>

            <AnimationContainer className = { 'Stage Success FlexColumn' } active = { buyNftModalStore.isStageSuccess() } >

                { buyNftModalStore.isStageSuccess() === true && (
                    <>
                        <Svg className={'SuccessSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                        <div className={'H2 Bold'}>Success!</div>
                        <div className={'H3'}>Transaction was successfully executed.</div>
                        <div className={'BorderContainer FlexColumn'}>
                            <div
                                className={'NftPicture'}
                                style={ ProjectUtils.makeBgImgStyle(nftEntity.imageUrl) } />
                            <div className={'B2 SemiBold Gray'}>{buyNftModalStore.collectionEntity.name}</div>
                            <div className={'H2 Bold'}>{nftEntity.name}</div>
                        </div>
                        <div className={'FlexRow TransactionView H3'}>
                            <a className={'Clickable'} href={buyNftModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                                Transaction details
                                <Svg svg={LaunchIcon} />
                            </a>
                        </div>
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button onClick={onClickResellNft}>
                                Resell NFT
                            </Button>
                            <Button onClick={buyNftModalStore.hide}>
                                View Item
                            </Button>
                        </Actions>
                    </>
                ) }

            </AnimationContainer>

            <AnimationContainer className = { 'Stage Fail FlexColumn' } active = { buyNftModalStore.isStageFail() } >

                { buyNftModalStore.isStageFail() === true && (
                    <>
                        <Svg className={'BigSvg'} svg={ReportIcon} size={SvgSize.CUSTOM}/>
                        <div className={'H2 Bold'}>Error</div>
                        <div className={'H3 Info'}>Transaction was not successful. Check your network or token balance.</div>
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button onClick={buyNftModalStore.hide}>
                                Close
                            </Button>
                            <Button onClick={onClickPurchaseNft}>
                                Try Again
                            </Button>
                        </Actions>
                    </>
                ) }

            </AnimationContainer>

        </ModalWindow>
    )

}

export default inject((stores) => stores)(observer(BuyNftModal));
