import React from 'react'
import { observer } from 'mobx-react';

import S from '../../../core/utilities/Main';
import GridViewState, { GRID_SETTING } from '../stores/GridViewState';

import LoadingIndicator from '../../../core/presentation/components/LoadingIndicator';
import SingleRowTable from '../../../core/presentation/components/SingleRowTable';
import Svg, { SvgSize } from '../../../core/presentation/components/Svg';
import { ALIGN_CENTER } from './TableDesktop';

import GridViewIcon from '@mui/icons-material/GridView';
import GridOnIcon from '@mui/icons-material/GridOn';
import '../styles/grid-view.css';

type Props = {
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
    sidebarContent?: React.ReactNode;
    gridViewState: GridViewState;
    defaultContent?: React.ReactNode;
    className?: string;
}

function GridView({ className, gridViewState, defaultContent, children, headerLeft, headerRight, sidebarContent }: React.PropsWithChildren < Props >) {

    return (
        <div className={`GridView ${className}`}>

            <div className={'GridHeader FlexRow FlexGrow'}>
                <div className={'HeaderLeft FlexRow'}>
                    {headerLeft}
                    {gridViewState.getItemCount() !== 0 && (
                        <div className={'TotalItems B2 SemiBold'}>
                            {gridViewState.getItemCount()} Items
                        </div>
                    )}
                </div>
                <div className={'HeaderRight FlexRow'}>
                    {headerRight}
                    {gridViewState.getItemCount() !== 0 && (

                        <div className={'GridLayoutButtons FlexRow'}>
                            <Svg svg={GridViewIcon}
                                size={SvgSize.CUSTOM}
                                className={`Clickable SvgBox ${S.CSS.getActiveClassName(gridViewState.checkIsGridSettingSelected(GRID_SETTING.LOOSE))}`}
                                onClick={() => gridViewState.setGridSettingAndPreviewCount(GRID_SETTING.LOOSE)}
                            />
                            <Svg svg={GridOnIcon}
                                size={SvgSize.CUSTOM}
                                className={`Clickable SvgBox ${S.CSS.getActiveClassName(gridViewState.checkIsGridSettingSelected(GRID_SETTING.DENSE))}`}
                                onClick={() => gridViewState.setGridSettingAndPreviewCount(GRID_SETTING.DENSE)}
                            />
                        </div>)}
                </div>
            </div>
            <div className={'FlexRow GridViewContent'}>
                <div className={`SideBar Transition ActiveVisibilityHidden ${S.CSS.getActiveClassName(sidebarContent !== null)}`}>
                    {sidebarContent}
                </div>
                <div className={'GridViewContentItself'}>
                    { gridViewState.isFetching === true && (
                        <LoadingIndicator margin={'16px'}/>
                    ) }

                    { gridViewState.isFetching === false && (
                        <>
                            { defaultContent !== null ? (
                                <div className={'DefaultContent FlexRow'}>{defaultContent}</div>
                            ) : (
                                <SingleRowTable
                                    legend={['']}
                                    widths={['100%']}
                                    aligns={[ALIGN_CENTER]}
                                    tableState={gridViewState.tableState}
                                    content={<div className={`PreviewsGrid Grid ${gridViewState.getGridSettingClass()}`}>{children}</div>} />
                            ) }
                        </>
                    ) }
                </div>
            </div>
        </div>
    )
}

GridView.defaultProps = {
    defaultContent: null,
    className: '',
    sidebarContent: null,
    headerLeft: null,
    headerRight: null,
}

export default observer(GridView);
