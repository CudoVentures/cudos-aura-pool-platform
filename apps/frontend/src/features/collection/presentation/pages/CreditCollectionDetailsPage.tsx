import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import PageFooter from '../../../footer/presentation/components/PageFooter';
import PageAdminHeader from '../../../header/presentation/components/PageAdminHeader';

import '../styles/page-credit-collection-details-page.css';
import BorderShadowPaddingContainer from '../../../../core/presentation/components/BorderShadowPaddingContainer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
import Breadcrumbs from '../../../../core/presentation/components/Breadcrumbs';
import CollectionDetailsForm from '../components/credit-collection/CollectionDetailsForm';
import CollectionCreditSidePreview, { CollectionCreditSidePreviewSize } from '../components/credit-collection/CollectionCreditSidePreview';
import AddNftsForm from '../components/credit-collection/AddNftsForm';
import FinishCreditCollection from '../components/credit-collection/FinishCreditCollection';
import NavRow from '../../../../core/presentation/components/NavRow';
import CollectionAddNftsTable from '../components/credit-collection/CollectionAddNftsTable';
import CreditCollectionStore from '../stores/CreditCollectionStore';
import CreditCollectionSuccessModal from '../components/credit-collection/CreditCollectionSuccessModal';
import AppStore from '../../../../core/presentation/stores/AppStore';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';
import NftPreview from '../../../nft/presentation/components/NftPreview';
import Actions, { ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import CreditCollectionSuccessModalStore from '../stores/CreditCollectionSuccessModalStore';

enum CreditCollectionDetailsSteps {
    COLLECTION_DETAILS = 1,
    ADD_NFTS = 2,
    FINISH = 3,
}

type Props = {
    creditCollectionStore?: CreditCollectionStore;
    creditCollectionSuccessModalStore?: CreditCollectionSuccessModalStore;
    appStore?: AppStore;
    bitcoinStore?: BitcoinStore;
}

function CreditCollectionDetailsPage({ creditCollectionStore, creditCollectionSuccessModalStore, appStore, bitcoinStore }: Props) {
    const { collectionId } = useParams();
    const location = useLocation();

    const isOriginAddNfts = location.pathname.includes(AppRoutes.CREDIT_COLLECTION_NFTS);
    const [step, setStep] = useState(isOriginAddNfts === false ? CreditCollectionDetailsSteps.COLLECTION_DETAILS : CreditCollectionDetailsSteps.ADD_NFTS);
    const collectionEntity = creditCollectionStore.collectionEntity;

    useEffect(() => {
        appStore.useLoading(async () => {
            await creditCollectionStore.init(collectionId);
            await bitcoinStore.init();
        })
    }, []);

    const navigate = useNavigate();

    const crumbs = [
        { name: 'My Collections', onClick: () => { navigate(AppRoutes.USER_PROFILE) } },
        { name: 'Create Collection' },
    ]

    const navSteps = isOriginAddNfts === false
        ? [
            {
                navNumber: 1,
                navName: 'Collection Details',
                isActive: step === CreditCollectionDetailsSteps.COLLECTION_DETAILS,
            },
            {
                navNumber: 2,
                navName: 'Add NFTs',
                isActive: step === CreditCollectionDetailsSteps.ADD_NFTS,
            },
            {
                navNumber: 3,
                navName: 'Finish',
                isActive: step === CreditCollectionDetailsSteps.FINISH,
            },
        ]
        : [
            {
                navNumber: 1,
                navName: 'Add NFTs',
                isActive: step === CreditCollectionDetailsSteps.ADD_NFTS,
            },
            {
                navNumber: 2,
                navName: 'Finish',
                isActive: step === CreditCollectionDetailsSteps.FINISH,
            },
        ]

    async function onClickSendForApproval() {
        await creditCollectionStore.onClickSendForApproval();
        creditCollectionSuccessModalStore.showSignal();
    }

    return (
        <PageLayoutComponent
            modals = {
                <>
                    <CreditCollectionSuccessModal />
                </>
            }
            className = { 'PageCreditCollectionDetailsPage' }>

            <PageAdminHeader />

            <div className = { 'PageContent AppContent' } >
                <Breadcrumbs crumbs={crumbs} />
                <BorderShadowPaddingContainer className={'FlexColumn BorderContainer'}>
                    {collectionEntity !== null
                        && (<>
                            {step === CreditCollectionDetailsSteps.COLLECTION_DETAILS && (
                                <CollectionDetailsStep />
                            )}
                            {step === CreditCollectionDetailsSteps.ADD_NFTS && (
                                <AddNftsStep />
                            )}
                            {step === CreditCollectionDetailsSteps.FINISH && (
                                <Finish />
                            )}
                        </>)}
                </BorderShadowPaddingContainer>
            </div>

            <PageFooter />

        </PageLayoutComponent>
    )

    function CollectionDetailsStep() {
        return (
            <>
                <div className={'Grid FormAndPreviewContainer'}>
                    <div className={'FormContainer FlexColumn'}>
                        <NavRow className={'FormNav'} navSteps={navSteps} />
                        <CollectionDetailsForm onClickNextStep={() => setStep(CreditCollectionDetailsSteps.ADD_NFTS)} />
                    </div>
                    <CollectionCreditSidePreview size={CollectionCreditSidePreviewSize.SMALL}/>
                </div>
            </>
        )
    }

    function AddNftsStep() {
        return (
            <div className={'FlexColumn AddNftStep'}>
                <div className={'Grid FormAndPreviewContainer'}>
                    <div className={'FormContainer FlexColumn'}>
                        <NavRow className={'FormNav'} navSteps={navSteps} />
                        <AddNftsForm
                            onClickBack={isOriginAddNfts === true ? () => setStep(CreditCollectionDetailsSteps.COLLECTION_DETAILS) : () => navigate(-1)}/>
                    </div>
                    <div className={'PreviewAndFinishContainer FlexColumn'}>
                        <div className={'PreviewContainer'}>
                            <NftPreview
                                nftEntity={creditCollectionStore.selectedNftEntity}
                                collectionName={collectionEntity.name}
                                disabled={true} />
                        </div>
                        <div className={'FinishContainer FlexColumn'}>
                            <div className={'B1'}>If you’re done with adding NFTs to this collection preview the details and send for approval to the Super Admin. Once the collection is approved you’ll be notified on your email and it will be listed in the Marketplace.</div>
                            <Actions layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                <Button
                                    onClick={() => setStep(CreditCollectionDetailsSteps.FINISH)}
                                >Preview & Send</Button>
                            </Actions>
                        </div>
                    </div>
                </div>
                <CollectionAddNftsTable />
            </div>
        )
    }

    function Finish() {
        return (
            <>
                <div className={`${isOriginAddNfts === false ? 'Grid' : 'FlexColumn'} FormAndPreviewContainer`}>
                    <div className={'FormContainer FlexColumn'}>
                        <NavRow className={'FormNav'} navSteps={navSteps} />
                        <FinishCreditCollection
                            hashingPower={collectionEntity.hashRateDisplay()}
                            addedNftCount={creditCollectionStore.getAddedNftCount()}
                            isOriginAddNfts={isOriginAddNfts}
                            onClickBack={() => setStep(CreditCollectionDetailsSteps.ADD_NFTS)}
                            onClickSendForApproval={onClickSendForApproval}
                        />
                    </div>
                    {isOriginAddNfts === false && (<CollectionCreditSidePreview />)}
                </div>
            </>
        )
    }

}

export default inject((stores) => stores)(observer(CreditCollectionDetailsPage));
