import React from 'react';
import { inject, observer } from 'mobx-react';

import CreditCollectionStore from '../../stores/CreditCollectionStore';
import AlertStore from '../../../../../core/presentation/stores/AlertStore';

import CreditCollectionNavRow from './CreditCollectionNavRow';
import CreditCollectionAddNftForm from './CreditCollectionAddNftForm';
import NftPreview from '../../../../nft/presentation/components/NftPreview';
import Actions, { ActionsLayout } from '../../../../../core/presentation/components/Actions';
import Button from '../../../../../core/presentation/components/Button';
import CreditCollectionAddNftsTable from './CreditCollectionAddNftsTable';

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

    console.log(selectedNftEntity);
    return (
        <div className={'CreditCollectionAddNftsStep FlexColumn'}>
            <div className={'Grid FormAndPreviewContainer'}>
                <div className={'FormContainer FlexColumn'}>
                    <CreditCollectionNavRow className = { 'FormNav' } />
                    <CreditCollectionAddNftForm />
                </div>
                <div className={'PreviewAndFinishContainer FlexColumn'}>
                    <div className={'PreviewContainer'}>
                        { selectedNftEntity !== null && (
                            <NftPreview
                                nftEntity={selectedNftEntity}
                                collectionName={collectionEntity.name}
                                disabled={true} />
                        ) }
                    </div>
                    <div className={'FinishContainer FlexColumn'}>
                        <div className={'B1'}>If you’re done with adding NFTs to this collection preview the details and send for approval to the Super Admin. Once the collection is approved you’ll be notified on your email and it will be listed in the Marketplace.</div>
                        <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                            <Button onClick={ onClickPreviewAndSend } >Preview & Send</Button>
                        </Actions>
                    </div>
                </div>
            </div>
            <CreditCollectionAddNftsTable />
        </div>
    )

}

export default inject((stores) => stores)(observer(CreditCollectionAddNftsStep));
