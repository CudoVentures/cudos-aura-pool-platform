import React from 'react';
import { inject, observer } from 'mobx-react';

import CreditCollectionStore from '../../stores/CreditCollectionStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';

import CreditCollectionNavRow from './CreditCollectionNavRow';
import CreditCollectionAddNftForm from './CreditCollectionAddNftForm';
import NftPreview from '../../../../nft/presentation/components/NftPreview';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import CreditCollectionAddNftsTable from './CreditCollectionAddNftsTable';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import InfoBlueBox from '../../../../core/presentation/components/InfoBlueBox';

import '../../styles/credit-collection-add-nfts-step.css';

type Props = {
    alertStore?: AlertStore;
    creditCollectionStore?: CreditCollectionStore,
}

function CreditCollectionAddNftsStep({ alertStore, creditCollectionStore }: Props) {

    const { collectionEntity, selectedNftEntity } = creditCollectionStore;

    function onClickPreviewAndSend() {
        if (creditCollectionStore.nftEntities.length === 0) {
            alertStore.show('You must create at least one NFT');
            return;
        }

        creditCollectionStore.moveToStepFinish();
    }

    return (
        <div className={'CreditCollectionAddNftsStep FlexColumn'}>
            <div className={'Grid FormAndPreviewContainer'}>
                <div className={'FormContainer FlexColumn'}>
                    <CreditCollectionNavRow className = { 'FormNav' } />
                    <CreditCollectionAddNftForm />
                </div>
                <ColumnLayout>
                    <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } >
                        <div className={'H3 Bold ColorNeutral100'}>NFT Preview</div>
                        <div className={'H3 ColorNeutral060'}>This is how your NFT would look like in AuraPool’s Marketplace</div>
                        { selectedNftEntity !== null && (
                            <StyledContainer
                                className = { 'NftPreviewCnt' }
                                containerPadding = { ContainerPadding.PADDING_24 } >
                                <NftPreview
                                    nftEntity={selectedNftEntity}
                                    collectionName={collectionEntity.name}
                                    disabled={true} />
                            </StyledContainer>
                        ) }
                    </StyledContainer>
                    <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } >
                        <ColumnLayout>
                            <div className = { 'H3 Bold ColorNeutral100' }>Send for Approval</div>
                            <InfoBlueBox
                                text = { 'If you’re done with adding NFTs to this collection preview the details and send for approval to the Super Admin. Once the collection is approved you’ll be notified on your email and it will be listed in the Marketplace.' } />
                            <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                <Button onClick={ onClickPreviewAndSend } >Preview & Send</Button>
                            </Actions>
                        </ColumnLayout>
                    </StyledContainer>
                </ColumnLayout>
            </div>
            <CreditCollectionAddNftsTable />
        </div>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionAddNftsStep));
