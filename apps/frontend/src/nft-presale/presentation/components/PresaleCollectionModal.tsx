import React from 'react';
import { inject, observer } from 'mobx-react';
import JSONPretty from 'react-json-pretty';
import moment from 'moment';
import { action } from 'mobx';

import PresaleCollectionModalStore from '../stores/PresaleCollectionModalStore';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import ProjectUtils from '../../../core/utilities/ProjectUtils';
import { PresaleCollectionTier } from '../../entities/PresaleCollectionEntity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import DataPreviewLayout, { createDataPreview } from '../../../core/presentation/components/DataPreviewLayout';
import { ContainerPadding } from '../../../core/presentation/components/StyledContainer';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button, { ButtonColor } from '../../../core/presentation/components/Button';
import Svg from '../../../core/presentation/components/Svg';
import AnimationContainer from '../../../core/presentation/components/AnimationContainer';
import UploaderComponent from '../../../core/presentation/components/UploaderComponent';
import NewLine from '../../../core/presentation/components/NewLine';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import '../styles/presale-collection-modal.css';

type Props = {
    alertStore?: AlertStore
    presaleCollectionModalStore?: PresaleCollectionModalStore;
    walletStore?: WalletStore;
}

function PresaleCollectionModal({ presaleCollectionModalStore, alertStore, walletStore }: Props) {

    const presaleCollectionEntity = presaleCollectionModalStore.presaleCollectionEntity;

    function onClickCreatePresaleCollection() {
        presaleCollectionModalStore.onClickCreatePresaleCollection();
        presaleCollectionModalStore.hide();
    }

    function renderTier(tier: PresaleCollectionTier) {
        return (
            <div className={'FlexRow FlexSplit NftTierLine'}>
                <div className = { 'H3 Bold ColorPrimary060' }>
                    { tier.name }
                </div>
                <DataPreviewLayout
                    className = { 'NftTierProps StartRight' }
                    styledContainerProps = { {
                        containerPadding: ContainerPadding.PADDING_16,
                    } }
                    dataPreviews = { [
                        createDataPreview('Total count', tier.totalCount),
                        createDataPreview('Giveaway count', tier.giveawayCount),
                        createDataPreview('Private sale count', tier.privateSaleCount),
                        createDataPreview('Presale count', tier.presaleCount),
                        createDataPreview('Public count', tier.publicSaleCount),
                        createDataPreview('Hash power in TH/s', tier.hashPowerInTh),
                        createDataPreview('Expiration date', moment(tier.expirationDateTimestamp).format(ProjectUtils.MOMENT_FORMAT_DATE_AND_TIME)),
                        createDataPreview('Price in USD', tier.priceUsd),
                        createDataPreview('Artist name', tier.artistName),
                        createDataPreview('Default image', <a href = { tier.defaultImgUrl } target='_blank' rel="noreferrer" className = { 'ColorPrimary060' }>View</a>),
                        createDataPreview('Giveaway 1st NFT image', <a href = { tier.uniqueImgUrl } target='_blank' rel="noreferrer" className = { 'ColorPrimary060' }>View</a>),
                        createDataPreview('Presale 1st NFT image', <a href = { tier.uniqueImgUrl } target='_blank' rel="noreferrer" className = { 'ColorPrimary060' }>View</a>),
                    ] } />
            </div>
        )
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
                        <JSONPretty className = { 'JsonPretty' } data={{
                            name: 'Bradd 03',
                            description: 'The third collection from...',
                            royalties: 3,
                            totalNfts: 3333,
                            expectedTotalHashPower: 123,
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
                        <DataPreviewLayout
                            styledContainerProps = { {
                                containerPadding: ContainerPadding.PADDING_16,
                            } }
                            dataPreviews = { [
                                createDataPreview('Name', presaleCollectionEntity.name),
                                createDataPreview('Description', <NewLine text = { presaleCollectionEntity.description } />),
                                createDataPreview('Royalties in %', presaleCollectionEntity.royalties),
                                createDataPreview('Total NFTs', presaleCollectionEntity.totalNfts),
                                createDataPreview('Denom id', presaleCollectionEntity.denomId),
                            ] } />

                        { renderTier(presaleCollectionEntity.nfts.opal) }
                        { renderTier(presaleCollectionEntity.nfts.ruby) }
                        { renderTier(presaleCollectionEntity.nfts.emerald) }
                        { renderTier(presaleCollectionEntity.nfts.diamond) }
                        { renderTier(presaleCollectionEntity.nfts.blueDiamond) }

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
