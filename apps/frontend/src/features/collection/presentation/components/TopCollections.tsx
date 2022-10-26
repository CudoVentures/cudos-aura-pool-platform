import React from 'react'
import CollectionEntity from '../../entities/CollectionEntity';
import MarketplaceStore from '../stores/MarketplaceStore';
import S from '../../../../core/utilities/Main';
import CollectionHorizontalPreview from './CollectionHorizontalPreview';

import '../styles/top-collections.css';

type Props = {
    selectedTopCollectionPeriod: number;
    cudosPriceChangeDisplay: string;
    cudosPriceUsd: number;
    topCollectionEntities: CollectionEntity[];
    changeTopCollectionPeriod: (index: number) => void;
}

export default function TopCollections({ selectedTopCollectionPeriod, cudosPriceChangeDisplay, cudosPriceUsd, topCollectionEntities, changeTopCollectionPeriod }: Props) {
    return (
        <div className={'TopCollectionsList'}>
            <div className={'HeadingRow Grid GridColumns3'}>
                <div className={'H2 Bold'}>Top Collections</div>
                <div className={'FlexRow PeriodButtonsRowHolder'}>
                    <div className={'PeriodButtonsRow FlexRow'}>
                        {MarketplaceStore.TOP_COLLECTION_PERIODS.map((period, index) => <div
                            key={index}
                            className={`PeriodButton Clickable B3 Semibold ${S.CSS.getActiveClassName(selectedTopCollectionPeriod === index)}`}
                            onClick={() => changeTopCollectionPeriod(index)}
                        >
                            {period}
                        </div>)}
                    </div>
                </div>
                <div className={'PlaceHolder'}></div>
            </div>
            <div className={'CollectionsGrid Grid GridColumns3'}>
                {topCollectionEntities.length === 0 && (<div className={'NoContent B1 SemiBold'}>There are currently no Top Collections</div>)}
                {topCollectionEntities.map((collectionEntity, index) => {
                    return <CollectionHorizontalPreview
                        key={collectionEntity.id}
                        placeNumber={index + 1}
                        cudosPriceUsd={cudosPriceUsd}
                        cudosPriceChange={cudosPriceChangeDisplay}
                        collectionEntity={collectionEntity}
                    />
                })}
            </div>
        </div>
    )
}
