import React from 'react'
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionHorizontalPreview from './CollectionHorizontalPreview';

import '../styles/top-collections.css';

type Props = {
    cudosPriceChangeDisplay: string;
    cudosPriceUsd: number;
    topCollectionEntities: CollectionEntity[];
}

export default function TopCollections({ cudosPriceChangeDisplay, cudosPriceUsd, topCollectionEntities }: Props) {
    return (
        <div className={'TopCollections CollectionsGrid Grid GridColumns3'}>
            {topCollectionEntities.length === 0 && (<div className={'NoContent B1 SemiBold'}>There are currently no Top Collections</div>)}
            {topCollectionEntities.map((collectionEntity, index) => {
                return (
                    <CollectionHorizontalPreview
                        key={collectionEntity.id}
                        placeNumber={index + 1}
                        cudosPriceUsd={cudosPriceUsd}
                        cudosPriceChange={cudosPriceChangeDisplay}
                        collectionEntity={collectionEntity} />
                )
            })}
        </div>
    )
}
