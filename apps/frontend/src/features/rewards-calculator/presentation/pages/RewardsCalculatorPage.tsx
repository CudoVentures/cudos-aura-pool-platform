import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import BigNumber from 'bignumber.js';

import S from '../../../../core/utilities/Main';
import ProjectUtils from '../../../../core/utilities/ProjectUtils';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button from '../../../../core/presentation/components/Button';
import PageFooter from '../../../../features/footer/presentation/components/PageFooter';
import PageHeader from '../../../header/presentation/components/PageHeader';
import BitcoinStore from '../../../bitcoin-data/presentation/stores/BitcoinStore';

import Input, { InputType } from '../../../../core/presentation/components/Input';
import RewardsCalculatorStore from '../stores/RewardsCalculatorStore';
import TextWithTooltip from '../../../../core/presentation/components/TextWithTooltip';
import { Slider, InputAdornment, MenuItem } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import PageLayoutComponent from '../../../../core/presentation/components/PageLayoutComponent';
import Select from '../../../../core/presentation/components/Select';
import Svg, { SvgSize } from '../../../../core/presentation/components/Svg';
import RowLayout from '../../../../core/presentation/components/RowLayout';
import StyledContainer, { ContainerBackground, ContainerPadding } from '../../../../core/presentation/components/StyledContainer';
import ColumnLayout from '../../../../core/presentation/components/ColumnLayout';

import SvgReplayIcon from '@mui/icons-material/Replay';
import SvgDriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import '../styles/page-rewards-calculator.css';

type Props = {
    bitcoinStore?: BitcoinStore;
    rewardsCalculatorStore?: RewardsCalculatorStore
}

function RewardsCalculatorPage({ bitcoinStore, rewardsCalculatorStore }: Props) {

    const bitcoinPriceChange = rewardsCalculatorStore.bitcoinStore.getBitcoinPriceChangeInUsd();

    const [networkDifficultyEditEnabled, setNetworkDifficultyEditEnabled] = useState(false);

    useEffect(() => {
        async function run() {
            await bitcoinStore.init();
            await rewardsCalculatorStore.init();
        }
        run();
    }, []);

    function onClickResetValues() {
        rewardsCalculatorStore.resetDefaults();
        setNetworkDifficultyEditEnabled(false);
    }

    function toggleDifficultyEdit() {
        setNetworkDifficultyEditEnabled(!networkDifficultyEditEnabled);
    }

    return (
        <PageLayoutComponent className = { 'PageRewardsCalculator' }>

            <PageHeader />

            <div className={'PageContent PageContentDefaultPadding AppContent'} >
                <RowLayout numColumns = { 2 } className={'LayoutContainer'}>
                    <StyledContainer className={'MiningFarmForm'}>
                        <ColumnLayout>
                            <div>
                                <div className={'H2 ColorNatural100 ExtraBold'}>Calculate Your Potential Rewards</div>
                                <div className={'B1 RewardsCalculatorSubHeading'}>Here we have some description text that leads the user to properly calculate the rewards</div>
                            </div>
                            <Select
                                label = { 'Select Mining Farm '}
                                onChange={rewardsCalculatorStore.onChangeMiningFarm}
                                value={rewardsCalculatorStore.selectedMiningFarmEntity !== null ? rewardsCalculatorStore.selectedMiningFarmEntity.id : S.Strings.NOT_EXISTS}>
                                { rewardsCalculatorStore.miningFarmsEntities.map((miningFarmEntity) => {
                                    return (
                                        <MenuItem key = { miningFarmEntity.id } value = { miningFarmEntity.id } > { miningFarmEntity.name } </MenuItem>
                                    )
                                }) }
                            </Select>
                            <Input
                                label = { 'Hash Rate' }
                                disabled = { rewardsCalculatorStore.hasSelectedMiningFarm() === false }
                                inputType={InputType.POSITIVE_INTEGER}
                                value = { rewardsCalculatorStore.hashPowerInThInputValue }
                                onChange = { rewardsCalculatorStore.onChangeHashPowerInInput }
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" >TH</InputAdornment>
                                    ),
                                }} />
                            <div>
                                <Slider
                                    aria-label="Default"
                                    disabled = { rewardsCalculatorStore.hasSelectedMiningFarm() === false }
                                    sx={{
                                        color: 'var(--color-primary-060)',
                                        '& .MuiSlider-thumb': {
                                            color: '#fff',
                                        },
                                    }}
                                    valueLabelDisplay="auto"
                                    value={parseFloat(rewardsCalculatorStore.hashPowerInThInputValue)}
                                    onChange={rewardsCalculatorStore.onChangeHashPowerInThSlider}
                                    min={0}
                                    max={rewardsCalculatorStore.selectedMiningFarmEntity?.hashPowerInTh ?? 1}/>
                                { rewardsCalculatorStore.selectedMiningFarmEntity !== null && (
                                    <div className = { 'B3 Bold FlexSplit' } >
                                        <div>0 TH/s</div>
                                        <div className = { 'StartRight' }>{rewardsCalculatorStore.selectedMiningFarmEntity?.hashPowerInTh ?? 1} TH/s</div>
                                    </div>
                                ) }
                            </div>
                            <div className={'FlexRow NetworkDifficulty'}>
                                <Input
                                    label = { 'Network Difficulty' }
                                    inputType={InputType.POSITIVE_INTEGER}
                                    readOnly={networkDifficultyEditEnabled === false}
                                    value={rewardsCalculatorStore.getNetworkDifficultyInputValue()}
                                    onChange = { rewardsCalculatorStore.onChangeNetworkDifficulty }
                                    gray = { networkDifficultyEditEnabled === false }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Svg className = { 'EnableEditButton' } size = { SvgSize.CUSTOM } svg={SvgDriveFileRenameOutlineIcon} onClick={toggleDifficultyEdit} />
                                            </InputAdornment>
                                        ),
                                    }} />
                            </div>
                            <Actions layout={ActionsLayout.LAYOUT_ROW_CENTER} height={ActionsHeight.HEIGHT_48}>
                                <Button
                                    disabled = { rewardsCalculatorStore.isDefault() }
                                    onClick={onClickResetValues}>
                                    <Svg size = { SvgSize.CUSTOM } svg={SvgReplayIcon} />
                                        Reset values
                                </Button>
                            </Actions>
                        </ColumnLayout>
                    </StyledContainer>
                    <ColumnLayout className={'DataContainer'}>
                        <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } className={'BtcPriceContainer'}>
                            <div className={'SubHeading Bold B1'}>Current Bitcoin Price</div>
                            <div className={'FlexRow'}>
                                <div className={'H2 Bold BtcPrice'}>{bitcoinStore.formatBtcInUsd(new BigNumber(1))}</div>
                                <div className={`${bitcoinPriceChange >= 0 ? 'PriceChangeUp' : 'PriceChangeDown'} PriceChange FlexRow`}>
                                    <div className={'PriceText'}>{bitcoinStore.formatBitcoinPriceChangeInPercentage()}</div>
                                    { bitcoinPriceChange >= 0 ? (
                                        <Svg svg={ArrowOutwardIcon}/>
                                    ) : (
                                        <Svg svg={SouthEastIcon}/>
                                    )
                                    }
                                </div>
                            </div>
                        </StyledContainer>
                        <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } className={'FarmDataContainer FlexColumn B1 SemiBold'}>
                            <div className={'DataRow FlexRow FlexSplit'}>
                                <TextWithTooltip
                                    className={'DataRowHeading'}
                                    text={'Maintenance Fee'}
                                    tooltipText={'The dollar amount per TH which will be subtracted from your BTC earnings for maintenance of farming machines.'} />
                                <div className={'DataRowValue StartRight'}>{bitcoinStore.formatBtcInUsd(rewardsCalculatorStore.getMaintenanceFeePerThInBtc())}/TH</div>
                            </div>
                            <div className={'DataRow FlexRow FlexSplit'}>
                                <TextWithTooltip
                                    className={'DataRowHeading'}
                                    text={'Pool Fee'}
                                    tooltipText={'The percentage from BTC payouts kept by Aura pool as Protocol fees.'} />
                                <div className={'DataRowValue StartRight'}>{(ProjectUtils.CUDOS_FEE_IN_PERCENT * 100).toFixed(0)} %</div>
                            </div>
                            <div className={'DataRow FlexRow FlexSplit'}>
                                <TextWithTooltip
                                    className={'DataRowHeading'}
                                    text={'Block Reward'}
                                    tooltipText={'The total BTC amount received by miners for each block mined on the network.'} />
                                <div className={'DataRowValue StartRight'}>{bitcoinStore.getBlockReward()}</div>
                            </div>
                        </StyledContainer>
                        <div className = { 'RewardsEstimateContainer' } >
                            <div className={'RewardsEstimateHeading H3 Bold'}>Your Monthly Rewards</div>
                            <StyledContainer containerPadding = { ContainerPadding.PADDING_24 } containerBackground = { ContainerBackground.NEUTRAL_100 }>
                                <div className={'H2 Bold RewardsInBtc'}>{rewardsCalculatorStore.calculateNetRewardPetMonth().toFixed(5)} <span className = { 'B1' }>BTC</span></div>
                                <div className={'H3 SemiBold MonthlyRewardUsd'}>{bitcoinStore.formatBtcInUsd(rewardsCalculatorStore.calculateNetRewardPetMonth())} USD</div>
                                <div className={'B3 SemiBold Discretion'}>Based on Today’s BTC Price</div>
                            </StyledContainer>
                        </div>
                        <div className = { 'B2 SemiBold Disclaimer' } > *This forecast is indicative </div>
                    </ColumnLayout>
                </RowLayout>
            </div>

            <PageFooter />

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(RewardsCalculatorPage));
