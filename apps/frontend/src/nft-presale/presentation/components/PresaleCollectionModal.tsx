import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import JSONPretty from 'react-json-pretty';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import DataPreviewLayout, { createDataPreview } from '../../../core/presentation/components/DataPreviewLayout';
import { ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor } from '../../../core/presentation/components/Button';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LaunchIcon from '@mui/icons-material/Launch';
import ReportIcon from '@mui/icons-material/Report';
import '../styles/presale-collection-modal.css';
import PresaleCollectionModalStore from '../stores/PresaleCollectionModalStore';
import UploaderComponent from '../../../core/presentation/components/UploaderComponent';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import { action } from 'mobx';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddressMintDataEntity from '../../entities/AddressMintDataEntity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';

type Props = {
    alertStore?: AlertStore
    presaleCollectionModalStore?: PresaleCollectionModalStore;
    walletStore?: WalletStore;
}

function PresaleCollectionModal({ presaleCollectionModalStore, alertStore, walletStore }: Props) {

    function onClickCreatePresaleCollection() {
        presaleCollectionModalStore.onClickCreatePresaleCollection();
        presaleCollectionModalStore.hide();
    }

    return (
        <ModalWindow
            className = { 'PresaleCollectionModal' }
            modalStore = { presaleCollectionModalStore }
            hasClose = { presaleCollectionModalStore.isStageProcessing() === false } >
            <AnimationContainer className = { 'Stage Upload FlexColumn' } active = { presaleCollectionModalStore.isStageUploadFile() } >
                { presaleCollectionModalStore.isStageUploadFile() === true && (
                    <>
                        <div className = { 'H3 Bold' }>Upload a json file with the following structure:</div>
                        <JSONPretty mainStyle = { 'color: var(--color-neutral-060)'} data={{
                            name: 'Bradd 03',
                            description: 'The third collection from...',
                            royalties: 3,
                            totalNfts: 3333,
                            nfts: {
                                opal: {
                                    totalCount: 643,
                                    giveawayCount: 16,
                                    privateSaleCount: 188,
                                    presaleCount: 376,
                                    publicSaleCount: 63,
                                    name: 'Opal',
                                    hashPowerInTh: 5,
                                    expirationDateTimestamp: 1811804400000,
                                    artistName: 'Delux3',
                                },
                                ruby: {
                                    totalCount: 2500,
                                    giveawayCount: 33,
                                    privateSaleCount: 740,
                                    presaleCount: 1480,
                                    publicSaleCount: 247,
                                    name: 'Ruby',
                                    hashPowerInTh: 10,
                                    expirationDateTimestamp: 1811804400000,
                                    artistName: 'Delux3',
                                },
                                emerald: {
                                    totalCount: 167,
                                    giveawayCount: 3,
                                    privateSaleCount: 50,
                                    presaleCount: 98,
                                    publicSaleCount: 16,
                                    name: 'Emerald',
                                    hashPowerInTh: 33,
                                    expirationDateTimestamp: 1811804400000,
                                    artistName: 'Delux3',
                                },
                                diamond: {
                                    totalCount: 17,
                                    giveawayCount: 2,
                                    privateSaleCount: 5,
                                    presaleCount: 9,
                                    publicSaleCount: 1,
                                    name: 'Diamond',
                                    hashPowerInTh: 100,
                                    expirationDateTimestamp: 1811804400000,
                                    artistName: 'Delux3',
                                },
                                blueDiamond: {
                                    totalCount: 6,
                                    giveawayCount: 0,
                                    privateSaleCount: 2,
                                    presaleCount: 3,
                                    publicSaleCount: 1,
                                    name: 'Blue Diamond',
                                    hashPowerInTh: 170,
                                    expirationDateTimestamp: 1811804400000,
                                    artistName: 'Delux3',
                                },
                            },
                        }} />
                        <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT} height={ActionsHeight.HEIGHT_48}>
                            <Button color = { ButtonColor.SCHEME_2 }>
                                <Svg svg={FileUploadIcon} />
                                Upload file
                                <UploaderComponent
                                    id = { this }
                                    params = { {
                                        'maxSize': 73400320, // 70MB
                                        'fileExt': '.json',
                                        'onExceedLimit': () => {
                                            alertStore.show('Max file size is 70MB!');
                                        },
                                        'multi': false,
                                        onReadFileAsBase64: action(async (base64File, responseData, files: any[], i: number) => {
                                            try {
                                                const preface = 'data:application/json;base64,';
                                                const file = base64File.replace(preface, '')
                                                const json = JSON.parse(atob(file));
                                                await presaleCollectionModalStore.parsePresaleCollectionData(json);
                                            } catch (e) {
                                                console.error(e);
                                                alertStore.show(e.message);
                                            }
                                        }),
                                    } } />
                            </Button>
                        </Actions>
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Preview FlexColumn' } active = { presaleCollectionModalStore.isStagePreview() } >
                { presaleCollectionModalStore.isStagePreview() === true && (
                    <>
                        {/* {presaleCollectionModalStore.presaleCollectionEntity.nfts.map((addressMintDataEntity: AddressMintDataEntity, i: number) => (
                            <div key = { i } className={'FlexRow AddressLine'}>
                                <div className={'AddressField'}>
                                    { addressMintDataEntity.hasAccountData() === true ? (
                                        <>
                                            <strong>{ addressMintDataEntity.firstName } { addressMintDataEntity.lastName }</strong><br />
                                            {addressMintDataEntity.cudosAddress}<br />
                                            <em className = { 'ColorNeutral060' }>
                                                KYC applicant: {addressMintDataEntity.applicantId}<br />
                                                KYC workflowRunId: {addressMintDataEntity.workflowRunId}
                                            </em>
                                        </>
                                    ) : (
                                        <>
                                            {addressMintDataEntity.cudosAddress}<br />
                                            <em className = { 'ColorWarning060' }>No KYC found for this address</em>
                                        </>
                                    ) }

                                </div>
                                <DataPreviewLayout
                                    styledContainerProps = { {
                                        containerPadding: ContainerPadding.PADDING_16,
                                    } }
                                    dataPreviews = {
                                        addressMintDataEntity.nftMints.map((nftMintEntitty) => {
                                            return createDataPreview(`Tier: ${nftMintEntitty.tier}`, `Count: ${nftMintEntitty.count}`);
                                        })
                                    } />
                            </div>
                        ))} */}

                        <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                            <Button onClick={onClickCreatePresaleCollection}>Create presale collection</Button>
                        </Actions>
                    </>
                ) }
            </AnimationContainer>

        </ModalWindow>
    )
}

export default inject((stores) => stores)(observer(PresaleCollectionModal));
