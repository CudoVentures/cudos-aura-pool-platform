import React from 'react';
import { inject, observer } from 'mobx-react';

import ModalWindow from '../../../core/presentation/components/ModalWindow';
import Actions, { ActionsHeight, ActionsLayout } from '../../../core/presentation/components/Actions';
import Button from '../../../core/presentation/components/Button';
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
                        <Actions layout={ActionsLayout.LAYOUT_ROW_LEFT} height={ActionsHeight.HEIGHT_48}>
                            <Button>
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
                                        'multi': true,
                                        onReadFileAsBase64: action((base64File, responseData, files: any[], i: number) => {
                                            try {
                                                const preface = 'data:application/json;base64,';
                                                const file = base64File.replace(preface, '')
                                                const json = JSON.parse(atob(file));
                                                mintPrivateSaleNftsModalStore.parseMintDataEntity(json);
                                            } catch (e) {
                                                alertStore.show('Invalid JSON file.');
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
                        {mintPrivateSaleNftsModalStore.addressMintDataEntities.map((adressMintDataEntity: AddressMintDataEntity, i: number) => (
                            <div key={i} className={'FlexColumn'}>
                                <div className={'FlexRow AddressLine'}>
                                    <div className={'AddressField'}>{adressMintDataEntity.cudosAddress}</div>
                                    <div className={'FlexColumn MintsData'}>
                                        {adressMintDataEntity.nftMints.map((nftMintEntitty, j) => (
                                            <div key={`${j}_tier`}>
                                                <div className={'FlexRow NftMintField'}>
                                                    <div className={'NftTier'}>Tier: {nftMintEntitty.tier}</div>
                                                    <div className={'NftCount'}>Count: {nftMintEntitty.count}</div>
                                                </div>
                                                <div className={'HorizontalSeparator'}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className={'HorizontalSeparator'}/>
                            </div>
                        ))}
                        {(walletStore.isConnected() === false || walletStore.address !== CHAIN_DETAILS.MINTING_SERVICE_ADDRESS) && (
                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                <Button disabled={true}>Connect collection owner wallet</Button>
                            </Actions>
                        )}
                        {walletStore.isConnected() === true && walletStore.address === CHAIN_DETAILS.MINTING_SERVICE_ADDRESS && (
                            <Actions height={ActionsHeight.HEIGHT_48} layout={ActionsLayout.LAYOUT_COLUMN_FULL}>
                                <Button onClick={onClickSubmitForSell}>Submit for sell</Button>
                            </Actions>
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
                        <div className={'FlexRow TransactionView H3'}>
                            <a className={'Clickable'} href={mintPrivateSaleNftsModalStore.getTxLink()} target={'_blank'} rel={'noreferrer'}>
                            Transaction details
                                <Svg svg={LaunchIcon} />
                            </a>
                        </div>
                        <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                            <Button
                                onClick={mintPrivateSaleNftsModalStore.hide}>
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
                            <Button onClick={mintPrivateSaleNftsModalStore.hide}>
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
