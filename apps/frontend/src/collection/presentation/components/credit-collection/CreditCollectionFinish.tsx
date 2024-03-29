import { inject, observer } from 'mobx-react';
import React from 'react';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonType } from '../../../../core/presentation/components/Button';
import Svg from '../../../../core/presentation/components/Svg';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../styles/credit-collection-finish.css';
import StyledContainer, { ContainerBackground, ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import DataPreviewLayout, { createDataPreview } from '../../../../core/presentation/components/DataPreviewLayout';
import CreditCollectionStore from '../../stores/CreditCollectionStore';
import CreditCollectionSuccessModalStore from '../../stores/CreditCollectionSuccessModalStore';

type Props = {
    creditCollectionStore?: CreditCollectionStore;
    creditCollectionSuccessModalStore?: CreditCollectionSuccessModalStore;
}

function CreditCollectionFinish({ creditCollectionStore, creditCollectionSuccessModalStore }: Props) {

    const dataPreviews = [
        createDataPreview('Hashing Power', creditCollectionStore.collectionEntity.formatHashPowerInTh()),
        createDataPreview('Added NFTs', creditCollectionStore.nftEntities.length),
    ];

    async function onClickSendForApproval() {
        try {
            await creditCollectionStore.onClickSendForApproval();
            creditCollectionSuccessModalStore.showSignal();
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <div className={'CreditCollectionFinish FlexColumn '}>
            <div className={'H2 ExtraBold CreditCollectionFinishTitle'}>Finalise</div>
            <div className={'B1 CreditCollectionFinishSubtitle'}>Check all the information related to the collection.</div>
            {creditCollectionStore.isAddNftsMode() === true && (
                <DataPreviewLayout className = { 'CreditCollectionAddNftFinishDataPreview' } dataPreviews={dataPreviews}/>
            )}
            <StyledContainer
                containerBackground={ContainerBackground.GRAY}
                className = { 'InstructionsBox' }
                containerShadow = { false }
                containerPadding = { ContainerPadding.PADDING_16 } >
                <ul>
                    {creditCollectionStore.isCreateMode() === true
                        ? <>
                            <li>Review the collection and hash rate  information before sending it for approval to CUDOS Markets.</li>
                            <li>Once your collection is reviewed and approved you'll receive a notification on your email address.</li>
                            <li>Once CUDOS Markets verifies and approves this NFT will go on sale immediately.</li>
                        </>
                        : <>
                            <li>Once your NFTs are reviewed and approved you'll receive a notification on your email address. </li>
                            <li>Once CUDOS Markets verifies and approves this NFT will go on sale immediately. </li>
                        </>}
                </ul>
            </StyledContainer>
            <Actions layout={ActionsLayout.LAYOUT_ROW_ENDS} className={'ButtonsRow'}>
                <Button type={ButtonType.TEXT_INLINE} onClick={creditCollectionStore.moveToStepAddNfts}>
                    <Svg svg={ArrowBackIcon} />
                    Back
                </Button>
                <Button onClick={onClickSendForApproval}>
                    Send for Approval
                </Button>
            </Actions>
        </div>
    )
}

export default inject((stores) => stores)(observer(CreditCollectionFinish));
