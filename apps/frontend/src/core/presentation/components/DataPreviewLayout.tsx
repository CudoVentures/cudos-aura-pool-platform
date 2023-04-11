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

export enum DataRowsLayout {
    COLUMN = 'LayoutColumn',
    ROW = 'LayoutRow',
}

type DataPreview = {
    key: string; /* do not set it to React.ReactNode unless we remove it as a key from render function */
    value: React.ReactNode | string;
}

type Props = {
    className?: string;
    dataPreviews: DataPreview[];
    dataRowsLayout: DataRowsLayout;
    gap?: DataRowsGap;
    size?: DataRowsSize;
    styledContainerProps?: StyledContainerProps;
}

export function createDataPreview(key: string, value: React.ReactNode | string): DataPreview {
    return {
        key, value,
    }
}

export default function DataPreviewLayout({ className, dataPreviews, dataRowsLayout, gap, size, styledContainerProps, children }: React.PropsWithChildren < Props >) {

    function getRowDataPreviewLayoutClassName(): string {
        switch (dataRowsLayout) {
            case DataRowsLayout.COLUMN:
                return 'FlexColumn';
            case DataRowsLayout.ROW:
            default:
                return 'FlexRow';
        }
    }

    if (styledContainerProps.containerPadding === undefined) {
        styledContainerProps.containerPadding = ContainerPadding.PADDING_24;
    }

    return (
        <StyledContainer
            className = { `DataPreviewLayout ${gap} ${size} FlexColumn ${className}` }
            { ...styledContainerProps } >
            { dataPreviews.map((dataPreview: DataPreview) => {
                return (
                    <div key = { dataPreview.key } className = { `DataPreview ${getRowDataPreviewLayoutClassName()}` } >
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
    className: '',
    gap: DataRowsGap.GAP_10,
    dataRowsLayout: DataRowsLayout.ROW,
    size: DataRowsSize.LARGE,
    styledContainerProps: {},
}
