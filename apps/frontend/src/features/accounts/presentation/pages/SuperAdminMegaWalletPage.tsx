import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react'

import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent'
import PageSuperAdminHeader from '../../../header/presentation/components/PageSuperAdminHeader'
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import '../styles/page-super-admin-mega-wallet.css'
import Svg from '../../../../core/presentation/components/Svg';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import Button, { ButtonColor, ButtonPadding } from '../../../../core/presentation/components/Button';
import SuperAdminMegaWalletPageStore from '../stores/SuperAdminMegaWalletPageStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import StyledContainer from '../../../../core/presentation/components/StyledContainer';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import Select from '../../../../core/presentation/components/Select';
import S from '../../../../core/utilities/Main';
import MenuItem from '@mui/material/MenuItem/MenuItem';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import LoadingIndicator from '../../../../core/presentation/components/LoadingIndicator';
import CudosStore from '../../../cudos-data/presentation/stores/CudosStore';
import WalletStore from '../../../ledger/presentation/stores/WalletStore';
import BigNumber from 'bignumber.js';
import AlertStore from '../../../../core/presentation/stores/AlertStore';
import MegaWalletSettingsModal from '../components/MegaWalletSettingsModal';
import MegaWalletSettingsModalStore, { MegaWalletSettings } from '../stores/MegaWalletSettingsModalStore';
import MegaWalletTransferModalStore, { MegaWalletTransferType } from '../stores/MegaWalletTransferModalStore';
import MegaWalletTransferModal from '../components/MegaWalletTransferModal';

type Props = {
    superAdminMegaWalletPageStore?: SuperAdminMegaWalletPageStore;
    megaWalletSettingsModalStore?: MegaWalletSettingsModalStore;
    megaWalletTransferModalStore?: MegaWalletTransferModalStore;
    cudosStore?: CudosStore;
    alertStore?: AlertStore;
    walletStore?: WalletStore;
}

type RoyaltyBoxProps = {
    heading: string;
    amount: number;
    buttonText: string;
    onClickChange: () => void;
}

function SuperAdminMegaWalletPage({ superAdminMegaWalletPageStore, megaWalletTransferModalStore, megaWalletSettingsModalStore, cudosStore, walletStore, alertStore }: Props) {
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
        megaWalletTransferModalStore.showSignal(superAdminEntity, MegaWalletTransferType.DEPOSIT);

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

        megaWalletTransferModalStore.showSignal(superAdminEntity, MegaWalletTransferType.TRANSFER);
    }

    const onClickChangeAddress = () => {
        megaWalletSettingsModalStore.showSignal(superAdminEntity, MegaWalletSettings.ADRESS);
    }

    const onClickChangeGlobalRoyalties = () => {
        megaWalletSettingsModalStore.showSignal(superAdminEntity, MegaWalletSettings.GLOBAL_ROYALTIES);
    }

    function onClickChangeGlobalFees() {
        megaWalletSettingsModalStore.showSignal(superAdminEntity, MegaWalletSettings.GLOBAL_FEES);
    }

    function onClickChangeResaleFees() {
        megaWalletSettingsModalStore.showSignal(superAdminEntity, MegaWalletSettings.RESALE_FEES);

    }

    function onClickChangeFirstSaleFees() {
        megaWalletSettingsModalStore.showSignal(superAdminEntity, MegaWalletSettings.FIRST_SALE_FEE);

    }

    function RoyaltyBoxContainer({ heading, amount, buttonText, onClickChange }: RoyaltyBoxProps) {
        return (
            <StyledContainer className={'RoyaltyBox FlexColumn'}>
                <div className={'B1 SemiBold RoyaltyName'}>{heading}</div>
                <div className={'FlexColumn InnerColumn'}>
                    <div className={'FlexRow RoyaltyAmountRow'}>
                        <div className={'H1 ExtraBold'}>{amount}</div>
                        <div className={'H2 SemiBold'}>%</div>
                    </div>
                    <Actions
                        layout={ActionsLayout.LAYOUT_COLUMN_FULL}
                        height={ActionsHeight.HEIGHT_32}
                    >
                        <Button
                            onClick={onClickChange}
                            color={ButtonColor.SCHEME_4}
                        >{buttonText}</Button>
                    </Actions>
                </div>
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
            <ColumnLayout className={'PageContent AppContent'} >
                <div className={'H1 ExtraBold'}>Mega Wallet</div>
                <div className={'Grid GridColumns2 MainBoxContainer'}>
                    <StyledContainer className={'FlexColumn WalletPreview'}>
                        <div className={'FlexRow AddressLine'}>
                            <div className={'FlexRow IconAddressHolder'}>
                                <div className={'ProfilePicture '} style={ProjectUtils.makeBgImgStyle('https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png')}/>
                                <div className={'Address B2 Bold'}>{accountSessionStore.superAdminEntity.cudosRoyalteesAddress}</div>
                                <Svg svg={ContentCopyIcon} className={'Clickable'} onClick={() => ProjectUtils.copyText(accountSessionStore.superAdminEntity.cudosRoyalteesAddress)}/>
                            </div>
                            <Svg svg={BorderColorIcon} className={'Clickable EditAddressButton'} onClick={onClickChangeAddress}/>
                        </div>
                        <div className={'FlexColumn PriceColumn'}>
                            <div className={'FlexRow AmountInCudos'}>
                                <div className={'H2 ExtraBold'}>{`${ProjectUtils.formatBalanceInCudosInt(superAdminMegaWalletPageStore.getSuperAdminBalance())}.${ProjectUtils.formatBalanceInCudosFraction(superAdminMegaWalletPageStore.getSuperAdminBalance())}`}</div>
                                <div className={'H3 SemiBold AmountDenom'}>CUDOS</div>
                            </div>
                            <div className={'H3 SemiBold AmountDollars'}>${cudosStore.convertAcudosInUsdAsString(superAdminMegaWalletPageStore.getSuperAdminBalance().multipliedBy((new BigNumber(10)).pow(18)))}</div>
                        </div>
                        <div className={'Grid GridColumns2 ActionsRow'}>
                            <Button
                                color={ButtonColor.SCHEME_4}
                                padding={ButtonPadding.PADDING_48}
                                onClick={onClickDeposit}
                            >Deposit</Button>

                            <Button
                                color={ButtonColor.SCHEME_1}
                                padding={ButtonPadding.PADDING_48}
                                onClick={onClickTransfer}
                            >Transfer</Button>
                        </div>
                    </StyledContainer>
                    <div className={'Grid GridColumns2 RoyaltyBoxesLayout'}>
                        <RoyaltyBoxContainer
                            heading={'Global Royalties'}
                            amount={superAdminEntity.globalCudosRoyaltiesPercent}
                            buttonText={'Change Global Royalties'}
                            onClickChange={onClickChangeGlobalRoyalties}
                        />
                        <RoyaltyBoxContainer
                            heading={'Global Fees'}
                            amount={superAdminEntity.globalCudosFeesPercent}
                            buttonText={'Change Global Fees'}
                            onClickChange={onClickChangeGlobalFees}
                        />
                        <RoyaltyBoxContainer
                            heading={'Resale Fees'}
                            amount={superAdminEntity.resaleCudosRoyaltiesPercent}
                            buttonText={'Change Resale Fees'}
                            onClickChange={onClickChangeResaleFees}
                        />
                        <RoyaltyBoxContainer
                            heading={'Royalty Fee upon first sale of NFT'}
                            amount={superAdminEntity.firstSaleCudosRoyaltiesPercent}
                            buttonText={'Change Royalty Fees'}
                            onClickChange={onClickChangeFirstSaleFees}
                        />
                    </div>
                </div>
                <StyledContainer>
                    <div className={'TableHeader FlexRow'}>
                        <div className={'H3 ExtraBolc'}>MegaWallet Activity</div>
                        <Select
                            className={'TableSort'}
                            onChange={superAdminMegaWalletPageStore.onChangeTableFilter}
                            value={superAdminMegaWalletPageStore.walletEventType.eventType}
                        >
                            <MenuItem value = { S.NOT_EXISTS }> All Event Types </MenuItem>
                        </Select>
                    </div>
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
                </StyledContainer>
            </ColumnLayout>

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(SuperAdminMegaWalletPage));
