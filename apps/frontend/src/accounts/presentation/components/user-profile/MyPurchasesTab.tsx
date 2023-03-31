import React from 'react';
import { inject, observer } from 'mobx-react';

import UserProfilePageStore from '../../stores/UserProfilePageStore';

import StyledContainer, { ContainerPadding } from '../../../../core/presentation/components/StyledContainer';

import '../../styles/my-purchases-tab.css';
import Table, { createTableCell, createTableCellString, createTableRow } from '../../../../core/presentation/components/Table';
import { ALIGN_LEFT } from '../../../../core/presentation/components/TableDesktop';
import PurchaseTransactionEntity, { PurchaseTransactionStatus } from '../../../../nft/entities/PurchaseTransactionEntity';
import { CHAIN_DETAILS, getEthChainEtherscanLink } from '../../../../core/utilities/Constants';
import Svg from '../../../../core/presentation/components/Svg';
import CheckForPresaleRefundsModalStore from '../../stores/CheckForPresaleRefundsModalStore';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayCircleFilledRoundedIcon from '@mui/icons-material/ReplayCircleFilledRounded';

type Props = {
    userProfilePageStore?: UserProfilePageStore
    checkForPresaleRefundsModalStore?: CheckForPresaleRefundsModalStore;
}

function MyPurchasesTab({ userProfilePageStore, checkForPresaleRefundsModalStore }: Props) {
    function getLegend() {
        return ['txHash', 'Time', 'Status'];
    }

    function getWidths() {
        return ['50%', '30%', '20%'];
    }

    function getAligns() {
        return [ALIGN_LEFT, ALIGN_LEFT, ALIGN_LEFT];
    }

    function getStatusSvg(purchaseTransactionEntity: PurchaseTransactionEntity) {
        switch (purchaseTransactionEntity.status) {
            case PurchaseTransactionStatus.PENDING:
                return InfoIcon;
            case PurchaseTransactionStatus.SUCCESS:
                return CheckCircleIcon;
            case PurchaseTransactionStatus.REFUNDED:
                return ReplayCircleFilledRoundedIcon;
            default:
                return null;
        }
    }

    function getExplorerUrl(purchaseTransactionEntity: PurchaseTransactionEntity): string {
        if (purchaseTransactionEntity.isEthTransaction() === true) {
            return `${getEthChainEtherscanLink()}/tx/${purchaseTransactionEntity.txhash}`;
        }

        return `${CHAIN_DETAILS.EXPLORER_URL}/transactions/${purchaseTransactionEntity.txhash}`;
    }

    function renderCollectionsRows() {
        return userProfilePageStore.purchaseTransactionEntities.map((purchaseTransactionEntity: PurchaseTransactionEntity) => {
            const tableCells = [
                createTableCell((
                    <a className={'Bold Dots TxHashCell'} href= { getExplorerUrl(purchaseTransactionEntity) } target='_blank' rel="noreferrer">{purchaseTransactionEntity.txhash}</a>
                )),
                createTableCellString(purchaseTransactionEntity.getTimeFormatted()),
                createTableCell(
                    <div className={`PurchaseStatusCell FlexRow ${purchaseTransactionEntity.getStatusString()}`}>
                        { purchaseTransactionEntity.isStatusRefunded() === true && purchaseTransactionEntity.isEthTransaction() === true ? (
                            <div
                                className={'PurchaseStatusCell FlexRow'}
                                onClick={() => checkForPresaleRefundsModalStore.showSignal()} >
                                <Svg svg={getStatusSvg(purchaseTransactionEntity)} />
                                Check for refunds
                            </div>
                        ) : (
                            <>
                                <Svg svg={getStatusSvg(purchaseTransactionEntity)} />
                                {purchaseTransactionEntity.getStatusString()}
                            </>
                        ) }
                    </div>,
                ),
            ]

            return createTableRow(
                tableCells,
            );
        });
    }

    return (
        <StyledContainer className={'MyPurchasesTab FlexColumn'} containerPadding={ContainerPadding.PADDING_24}>
            <div className={'FlexRow TableHeader'}>
                <div className={'H3 Bold'}>Purchases</div>
            </div>
            {userProfilePageStore.purchaseTransactionEntities !== null && (
                <Table
                    className={'PurchaseTransactionsTable'}
                    legend={getLegend()}
                    widths={getWidths()}
                    aligns={getAligns()}
                    tableState={userProfilePageStore.purchasesTableState}
                    rows={renderCollectionsRows()} />
            )}
            {userProfilePageStore.purchaseTransactionEntities === null && (<div className={'Loading'} />)}
        </StyledContainer>)
}

export default inject((stores) => stores)(observer(MyPurchasesTab));
