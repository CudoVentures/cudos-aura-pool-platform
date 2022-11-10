import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import BigNumber from 'bignumber.js';

import S from '../../../../core/utilities/Main';
import Actions, { ActionsHeight, ActionsLayout } from '../../../../core/presentation/components/Actions';
import Button, { ButtonPadding, ButtonType } from '../../../../core/presentation/components/Button';
import PageFooter from '../../../../features/footer/presentation/components/PageFooter';
import PageHeader from '../../../header/presentation/components/PageHeader';
import AppRoutes from '../../../app-routes/entities/AppRoutes';
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

import SvgReplayIcon from '@mui/icons-material/Replay';
import SvgDriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import '../styles/page-rewards-calculator-component.css';

type Props = {
    bitcoinStore?: BitcoinStore;
    rewardsCalculatorStore?: RewardsCalculatorStore
}

function RewardsCalculatorPage({ bitcoinStore, rewardsCalculatorStore }: Props) {

    const navigate = useNavigate();
    const bitcoinPriceChange = rewardsCalculatorStore.bitcoinStore.getBitcoinPriceChangeInUsd();

    const [networkDifficultyEditEnabled, setNetworkDifficultyEditEnabled] = useState(false);

    useEffect(() => {
        async function run() {
            await bitcoinStore.init();
            await rewardsCalculatorStore.init();
        }
        run();
    }, []);

    function onClickExploreNftAndBuy() {
        navigate(AppRoutes.EXPLORE_NFTS);
    }

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

            <div className={'PageContent AppContent'} >
                <div className={'RewardsCalculator'}>
                    <div className={'FlexRow RewardsCalculatorHeading'}>
                        <div className={'H2'}>Calculate Your Potential Rewards</div>
                        <Actions height = { ActionsHeight.HEIGHT_48 }>
                            <Button
                                onClick={onClickExploreNftAndBuy}
                                padding={ButtonPadding.PADDING_24}
                                type={ButtonType.ROUNDED}>
                                Explore NFTs & Buy
                            </Button>
                        </Actions>
                    </div>
                    <div className={'H3 RewardsCalculatorSubHeading'}>Here we have some description text that leads the user to properly calculate the rewards</div>
                    <div className={'Grid GridColumns2 LayoutContainer'}>
                        <div className={'FlexSingleCenter MiningFarmForm BorderContainer'}>
                            <div className = { 'FlexColumn MiningFarmFormWidth' } >
                                <Select
                                    label = {
                                        <TextWithTooltip
                                            text={'Select Mining Farm'}
                                            tooltipText={'info'}
                                        />
                                    }
                                    onChange={rewardsCalculatorStore.onChangeMiningFarm}
                                    value={rewardsCalculatorStore.selectedMiningFarmEntity !== null ? rewardsCalculatorStore.selectedMiningFarmEntity.id : S.Strings.NOT_EXISTS}>
                                    { rewardsCalculatorStore.miningFarmsEntities.map((miningFarmEntity) => {
                                        return (
                                            <MenuItem key = { miningFarmEntity.id } value = { miningFarmEntity.id } > { miningFarmEntity.name } </MenuItem>
                                        )
                                    }) }
                                </Select>
                                <Input
                                    label = {
                                        <TextWithTooltip
                                            text={'Hash Rate'}
                                            tooltipText={'info'}
                                        />
                                    }
                                    disabled = { rewardsCalculatorStore.hasSelectedMiningFarm() === false }
                                    inputType={InputType.POSITIVE_INTEGER}
                                    value = { rewardsCalculatorStore.hashPowerInThInputValue }
                                    onChange = { rewardsCalculatorStore.onChangeHashPowerInInput }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end" >TH</InputAdornment>
                                        ),
                                    }} />
                                <Slider defaultValue={50}
                                    aria-label="Default"
                                    disabled = { rewardsCalculatorStore.hasSelectedMiningFarm() === false }
                                    sx={{
                                        color: '#000',
                                        '& .MuiSlider-thumb': {
                                            color: '#fff',
                                        },
                                    }}
                                    valueLabelDisplay="auto"
                                    value={parseFloat(rewardsCalculatorStore.hashPowerInThInputValue)}
                                    onChange={rewardsCalculatorStore.onChangeHashPowerInThSlider}
                                    min={0}
                                    max={rewardsCalculatorStore.selectedMiningFarmEntity?.hashPowerInTh ?? 1}/>
                                <div className={'FlexRow NetworkDifficulty'}>
                                    <Input
                                        label = {
                                            <TextWithTooltip
                                                text={'Network Difficulty'}
                                                tooltipText={'info'} />
                                        }
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
                            </div>
                        </div>
                        <div className={'DataContainer FlexColumn'}>
                            <div className={'BtcPriceContainer FlexColumn BorderContainer'}>
                                <div className={'FlexRow'}>
                                    <div className={'H2 BtcPrice'}>{bitcoinStore.formatBtcInUsd(new BigNumber(1))}</div>
                                    <div className={'PriceChange FlexRow'}>
                                        <div className={'PriceText'}>{bitcoinStore.formatBitcoinPriceChangeInPercentage()}</div>
                                        {bitcoinPriceChange >= 0
                                            ? <Svg svg={ArrowOutwardIcon}/>
                                            : <Svg svg={SouthEastIcon}/>
                                        }
                                    </div>
                                </div>
                                <div className={'SubHeading'}>Current Bitcoin Price</div>
                            </div>
                            <div className={'FarmDataContainer FlexColumn BorderContainer'}>
                                <div className={'DataRow FlexRow'}>
                                    <TextWithTooltip
                                        className={'DataRowHeading'}
                                        text={'Cost'}
                                        tooltipText={'Cudo’s pool commission + Farm’s maintenance fee'} />
                                    <div className={'DataRowValue'}>{rewardsCalculatorStore.formatCost()}</div>
                                </div>
                                <div className={'DataRow FlexRow'}>
                                    <TextWithTooltip
                                        className={'DataRowHeading'}
                                        text={'Block Reward'}
                                        tooltipText={'info'} />
                                    <div className={'DataRowValue'}>{bitcoinStore.getBlockReward()}</div>
                                </div>
                            </div>
                            <div className={'RewardsEstimateContainer FlexColumn'}>
                                <div className={'RewardsEstimateHeading'}>Your Monthly Rewards</div>
                                <div className={'FlexRow'}>
                                    <div className={'H2 RewardsInBtc'}>{rewardsCalculatorStore.formatNetRewardPerMonth()}</div>
                                    <div className={'FlexColumn'}>
                                        <div className={'MonthlyRewardUsd'}>{bitcoinStore.formatBtcInUsd(rewardsCalculatorStore.calculateNetRewardPetMonth())}</div>
                                        <div className={'Discretion'}>Based on Today’s BTC Price</div>
                                    </div>
                                </div>
                            </div>
                            <div className = { 'Disclaimer' } > *This forecast is indicative </div>
                        </div>
                    </div>
                </div>
            </div>

            <PageFooter />

        </PageLayoutComponent>
    )
}

export default inject((stores) => stores)(observer(RewardsCalculatorPage));
