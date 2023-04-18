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
import '../styles/mint-private-sale-nfts.modal.css';
import MintPrivateSaleNftModalStore from '../stores/MintPrivateSaleNftModalStore';
import UploaderComponent from '../../../core/presentation/components/UploaderComponent';
import AlertStore from '../../../core/presentation/stores/AlertStore';
import { action } from 'mobx';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddressMintDataEntity from '../../entities/AddressMintDataEntity';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import { CHAIN_DETAILS } from '../../../core/utilities/Constants';

type Props = {
    alertStore?: AlertStore
    mintPrivateSaleNftsModalStore?: MintPrivateSaleNftModalStore;
    walletStore?: WalletStore;
}

function MintPrivateSaleNftsModal({ mintPrivateSaleNftsModalStore, alertStore, walletStore }: Props) {

    useEffect(() => {
        mintPrivateSaleNftsModalStore.init();
    }, []);

    function onClickSubmitForSell() {
        mintPrivateSaleNftsModalStore.onClickSubmitForSell();
    }

    return (
        <ModalWindow
            className = { 'MintPrivateSaleNftsModal' }
            modalStore = { mintPrivateSaleNftsModalStore }
            hasClose = { mintPrivateSaleNftsModalStore.isStageProcessing() === false } >
            <AnimationContainer className = { 'Stage Upload FlexColumn' } active = { mintPrivateSaleNftsModalStore.isStageUploadFile() } >
                { mintPrivateSaleNftsModalStore.isStageUploadFile() === true && (
                    <>
                        <div className = { 'H3 Bold' }>Upload a json file with the following structure:</div>
                        <JSONPretty mainStyle = { 'color: var(--color-neutral-060)'} data={{
                            'addressMints': [
                                {
                                    'cudosAddress': 'cudos14h7pdf8g2kkjgum5dntz80s5lhtrw3lk2uswk0',
                                    'firstName': 'Name',
                                    'lastName': 'Name',
                                    'applicantId': '314-14-31-421-3',
                                    'workflowRunId': '314-14-31-421-3',
                                    'nftMints': [
                                        { 'tier': 2, 'count': 5 },
                                    ],
                                },
                                {
                                    'cudosAddress': 'cudos1wpzqe0jkyz3xc7dywtqnu2rd4gdys6a6npx2pk',
                                    'firstName': 'Name',
                                    'lastName': 'Name',
                                    'applicantId': '314-14-31-421-3',
                                    'workflowRunId': '314-14-31-421-3',
                                    'nftMints': [
                                        { 'tier': 1, 'count': 52 },
                                    ],
                                },
                            ],
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
                                                await mintPrivateSaleNftsModalStore.parseMintDataEntity(json);
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

            <AnimationContainer className = { 'Stage Preview FlexColumn' } active = { mintPrivateSaleNftsModalStore.isStagePreview() } >
                { mintPrivateSaleNftsModalStore.isStagePreview() === true && (
                    <>
                        {mintPrivateSaleNftsModalStore.addressMintDataEntities.map((addressMintDataEntity: AddressMintDataEntity, i: number) => (
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
                        ))}

                        {walletStore.isConnected() === true && walletStore.address === CHAIN_DETAILS.MINTING_SERVICE_ADDRESS ? (
                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                <Button onClick={onClickSubmitForSell}>Mint NFTs</Button>
                            </Actions>
                        ) : (
                            <div className = { 'Bold ColorError060 WrongWalletInfo' }>Connect OnDemandMintingService's wallet with address: {CHAIN_DETAILS.MINTING_SERVICE_ADDRESS}</div>
                        )}
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Processing FlexColumn' } active = { mintPrivateSaleNftsModalStore.isStageProcessing() } >
                {mintPrivateSaleNftsModalStore.isStageProcessing() === true && (
                    <>
                        <div className={'H2 Bold'}>Processing...</div>
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Success FlexColumn' } active = { mintPrivateSaleNftsModalStore.isStageSuccess() } >
                {mintPrivateSaleNftsModalStore.isStageSuccess() === true && (
                    <>
                        <Svg className={'BigSvg'} svg={CheckCircleIcon} size={SvgSize.CUSTOM}/>
                        <div className={'H2 Bold'}>Success!</div>
                        <div className={'H3 Info'}>Transaction was successfully executed.</div>
                        <a className={'FlexRow TransactionView H3'} href={mintPrivateSaleNftsModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                            Transaction details <Svg svg={LaunchIcon} />
                        </a>
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button onClick={mintPrivateSaleNftsModalStore.hide}>
                                Close Now
                            </Button>
                        </Actions>
                    </>
                ) }
            </AnimationContainer>

            <AnimationContainer className = { 'Stage Fail FlexColumn' } active = { mintPrivateSaleNftsModalStore.isStageFail() } >
                {mintPrivateSaleNftsModalStore.isStageFail() === true && (
                    <>
                        <Svg className={'BigSvg'} svg={ReportIcon} size={SvgSize.CUSTOM}/>
                        <div className={'H2 Bold'}>Error</div>
                        <div className={'H3 Info'}>Transaction was not successful.</div>
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button onClick={mintPrivateSaleNftsModalStore.hide} color = { ButtonColor.SCHEME_4 }>
                                Close
                            </Button>
                            <Button onClick={mintPrivateSaleNftsModalStore.onClickSubmitForSell}>
                                Try Again
                            </Button>
                        </Actions>
                    </>
                ) }
            </AnimationContainer>

        </ModalWindow>
    )
}

export default inject((stores) => stores)(observer(MintPrivateSaleNftsModal));
