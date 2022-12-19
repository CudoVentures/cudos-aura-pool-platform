import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react'
import numeral from 'numeral';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import S from '../../../../core/utilities/Main';
import SuperAdminMegaWalletPageStore from '../stores/SuperAdminMegaWalletPageStore';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import MegaWalletSettingsModalStore, { MegaWalletSettings } from '../stores/MegaWalletSettingsModalStore';
import MegaWalletTransferModalStore, { MegaWalletTransferType } from '../stores/MegaWalletTransferModalStore';

import MenuItem from '@mui/material/MenuItem/MenuItem';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';
import Svg from '../../../../core/presentation/components/Svg';
import Button, { ButtonColor, ButtonPadding } from '../../../../core/presentation/components/Button';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import Select from '../../../../core/presentation/components/Select';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import MegaWalletSettingsModal from '../components/MegaWalletSettingsModal';
import MegaWalletTransferModal from '../components/MegaWalletTransferModal';
import StyledLayout from '../../../../core/presentation/components/StyledLayout';
import RowLayout from '../../../../core/presentation/components/RowLayout';

// import BorderColorIcon from '@mui/icons-material/BorderColor';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import '../styles/page-super-admin-mega-wallet.css'
import MegaWalletBalance from '../components/MegaWalletBalance';
import MegaWalletBalanceStore from '../stores/MegaWalletBalanceStore';

type Props = {
    superAdminMegaWalletPageStore?: SuperAdminMegaWalletPageStore;
    megaWalletSettingsModalStore?: MegaWalletSettingsModalStore;
    megaWalletTransferModalStore?: MegaWalletTransferModalStore;
    megaWalletBalanceStore?: MegaWalletBalanceStore;
    cudosStore?: CudosStore;
    alertStore?: AlertStore;
    walletStore?: WalletStore;
}

function SuperAdminMegaWalletPage({ superAdminMegaWalletPageStore, megaWalletTransferModalStore, megaWalletBalanceStore, megaWalletSettingsModalStore, cudosStore, walletStore, alertStore }: Props) {
    const { walletEventsEntities, accountSessionStore } = superAdminMegaWalletPageStore;
    const { superAdminEntity } = accountSessionStore;

    useEffect(() => {
        superAdminMegaWalletPageStore.init();
        cudosStore.init();
    }, []);

    function onClickDeposit() {
        if (!walletStore.isConnected()) {
            alertStore.show('Please connect your wallet.');
            return;
        }
        megaWalletTransferModalStore.showSignal(superAdminEntity, MegaWalletTransferType.DEPOSIT, () => {
            megaWalletBalanceStore.fetchWalletBalance();
        });
    }

    function onClickTransfer() {
        if (!walletStore.isConnected()) {
            alertStore.show('Please connect your wallet.');
            return;
        }

        if (walletStore.address !== superAdminEntity.cudosRoyalteesAddress) {
            alertStore.show('The wallet you have connected is different than the super admin one.');
            return;
        }

        megaWalletTransferModalStore.showSignal(superAdminEntity, MegaWalletTransferType.TRANSFER, () => {
            megaWalletBalanceStore.fetchWalletBalance();
        });
    }

    // const onClickChangeAddress = () => {
    //     megaWalletSettingsModalStore.showSignal(MegaWalletSettings.ADRESS);
    // }

    const onClickChangeGlobalRoyalties = () => {
        megaWalletSettingsModalStore.showSignal(MegaWalletSettings.GLOBAL_ROYALTIES);
    }

    function onClickChangeGlobalFees() {
        megaWalletSettingsModalStore.showSignal(MegaWalletSettings.GLOBAL_FEES);
    }

    function onClickChangeResaleFees() {
        megaWalletSettingsModalStore.showSignal(MegaWalletSettings.RESALE_FEES);

    }

    function onClickChangeFirstSaleFees() {
        megaWalletSettingsModalStore.showSignal(MegaWalletSettings.FIRST_SALE_FEE);

    }

    function renderBoxContainer(heading, amount, buttonText, onClickChange) {
        return (
            <StyledContainer className={'RoyaltyBox FlexColumn'} containerPadding = { ContainerPadding.PADDING_24 } >
                <div className={'B1 SemiBold ColorNeutral070'}>{heading}</div>
                <div className={'H2 ExtraBold RoyaltyBoxAmount'} > { amount } <span className = { 'B1 SemiBold ColorNeutral060' }>%</span></div>
                <Actions height={ActionsHeight.HEIGHT_32} >
                    <Button
                        onClick={onClickChange}
                        color={ButtonColor.SCHEME_4}>
                        {buttonText}
                    </Button>
                </Actions>
            </StyledContainer>
        )
    }

    // TODO: real values
    function renderWalletActivityTableRows() {
        return walletEventsEntities.map((walletEventEntity) => {
            const rowCells = [
                createTableCellString(walletEventEntity.formatType()),
                createTableCell(
                    <div className={'FlexRow EventItemPreviewCell'}>
                        <div className={'EventItemPicture'} style={ProjectUtils.makeBgImgStyle('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png')}/>
                        <div className={'EventItemNmae'}>12345</div>
                    </div>,
                ),
                createTableCell(
                    <div className={'FlexColumn EventPtice'}>
                        <div className={'B2 Bold EventPriceCudos'}>69.96 CUDOS</div>
                        <div className={'B3 SemiBold EventPriceDollars'}>$123.45</div>
                    </div>,
                ),
                createTableCell(<div className={'B3 SemiBold EventFromAddress'}>{ProjectUtils.shortenAddressString(walletEventEntity.fromAddress, 15)}</div>),
                createTableCellString(walletEventEntity.formatTimeSince()),
            ];

            return createTableRow(rowCells);
        })
    }

    return (
        <PageLayoutComponent
            className = { 'PageSuperAdminMegaWallet' }
            modals = { (
                <>
                    <MegaWalletSettingsModal />
                    <MegaWalletTransferModal />
                </>
            ) } >

            <PageSuperAdminHeader />
            <ColumnLayout className={'PageContent PageContentDefaultPadding AppContent'} >
                <div className={'H2 ExtraBold'}>Mega Wallet</div>
                <RowLayout className = { 'MainBoxContainer' } numColumns = { 2 } gap = { 16 } >
                    <StyledContainer className={'FlexColumn WalletPreview'}>
                        <div className={'FlexRow AddressLine'}>
                            <div className={'FlexRow IconAddressHolder'}>
                                <div className={'ProfilePicture ImgContainNode'} style={ProjectUtils.makeBgImgStyle('/assets/img/profile-wallet.png')}/>
                                <div className={'B2 Bold'}>{accountSessionStore.superAdminEntity.cudosRoyalteesAddress}</div>
                                <Svg svg={ContentCopyIcon} className={'Clickable'} onClick={() => ProjectUtils.copyText(accountSessionStore.superAdminEntity.cudosRoyalteesAddress)}/>
                            </div>
                            {/* <Svg svg={BorderColorIcon} className={'Clickable EditAddressButton'} onClick={onClickChangeAddress}/> */}
                        </div>
                        <div className = { 'HorizontalSeparator' } />
                        {/* <div>
                            <div className={'FlexRow AmountInCudos'}>
                                <div className={'H2 ExtraBold'}>{superAdminMegaWalletPageStore.formatSuperAdminBalance()}</div>
                                <div className={'H3 SemiBold ColorNeutral060'}>CUDOS</div>
                            </div>
                            <div className={'H3 SemiBold AmountDollars'}>{cudosStore.formatConvertedAcudosInUsd(superAdminMegaWalletPageStore.getSuperAdminBalanceInAcudos())}</div>
                        </div> */}
                        <MegaWalletBalance />
                        <Actions className = { 'ActionsRow' } layout = { ActionsLayout.LAYOUT_ROW_FULL } >
                            <Button
                                color={ButtonColor.SCHEME_4}
                                padding={ButtonPadding.PADDING_48}
                                onClick={onClickDeposit}>
                                Deposit
                            </Button>
                            <Button
                                color={ButtonColor.SCHEME_1}
                                padding={ButtonPadding.PADDING_48}
                                onClick={onClickTransfer}>
                                Transfer
                            </Button>
                        </Actions>
                    </StyledContainer>
                    <RowLayout className={'RoyaltyBoxesLayout'} numColumns = { 2 } gap = { 16 }>
                        { renderBoxContainer('Global Royalties', superAdminEntity.globalCudosRoyaltiesPercent, 'Change Global Royalties', onClickChangeGlobalRoyalties) }
                        { renderBoxContainer('Global Fees', superAdminEntity.globalCudosFeesPercent, 'Change Global Fees', onClickChangeGlobalFees) }
                        { renderBoxContainer('Resale Fees', superAdminEntity.resaleCudosRoyaltiesPercent, 'Change Resale Fees', onClickChangeResaleFees) }
                        { renderBoxContainer('Royalty Fee upon first sale of NFT', superAdminEntity.firstSaleCudosRoyaltiesPercent, 'Change Royalty Fees', onClickChangeFirstSaleFees) }
                    </RowLayout>
                </RowLayout>
                <StyledLayout
                    title = { 'MegaWallet Activity' }
                    headerRight = {
                        <Select
                            className={'TableSort'}
                            onChange={superAdminMegaWalletPageStore.onChangeTableFilter}
                            value={superAdminMegaWalletPageStore.walletEventType.eventType} >
                            <MenuItem value = { S.NOT_EXISTS }> All Event Types </MenuItem>
                        </Select>
                    } >
                    { walletEventsEntities === null ? (
                        <LoadingIndicator />
                    ) : (
                        <Table
                            className={'WalletEventTable'}
                            legend={['Activity Type', 'Item', 'Price', 'From', 'Time']}
                            widths={['15%', '30%', '30%', '15%', '10%']}
                            aligns={[ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT]}
                            tableState={superAdminMegaWalletPageStore.walletEventTableState}
                            rows={renderWalletActivityTableRows()} />
                    )}
                </StyledLayout>
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMegaWalletPage));
