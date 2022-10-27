import React from 'react';

import StyledContainer, { Props as StyledContainerProps, ContainerPadding } from './StyledContainer';

import '../styles/data-preview-layout.css';

export enum DataRowsGap {
    GAP_10 = 'Gap10',
    GAP_25 = 'Gap25',
}

export enum DataRowsSize {
    SMALL = 'SizeSmall',
    LARGE = 'SizeLarge',
}

type DataPreview = {
    key: string; /* do not set it to React.ReactNode unless we remove it as a key from render function */
    value: React.ReactNode | string;
}

type Props = {
    dataPreviews: DataPreview[];
    gap?: DataRowsGap;
    size?: DataRowsSize;
    styledContainerProps?: StyledContainerProps;
}

export function createDataPreview(key: string, value: React.ReactNode | string): DataPreview {
    return {
        key, value,
    }
}

export default function DataPreviewLayout({ dataPreviews, gap, size, styledContainerProps, children }: React.PropsWithChildren < Props >) {

    if (styledContainerProps.containerPadding === undefined) {
        styledContainerProps.containerPadding = ContainerPadding.PADDING_24;
    }

    return (
        <StyledContainer
            className = { `DataPreviewLayout ${gap} ${size} FlexColumn` }
            { ...styledContainerProps } >
            { dataPreviews.map((dataPreview: DataPreview) => {
                return (
                    <div key = { dataPreview.key } className = { 'DataPreview FlexRow' } >
                        <div className = { 'DataPreviewKey' } > { dataPreview.key } </div>
                        <div className = { 'DataPreviewValue Dots' } > { dataPreview.value } </div>
                    </div>
                )
            }) }
            {children}
        </StyledContainer>
    )

}

DataPreviewLayout.defaultProps = {
    gap: DataRowsGap.GAP_10,
    size: DataRowsSize.LARGE,
}
