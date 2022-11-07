import React from 'react'
import CollectionEntity from '../../entities/CollectionEntity';
import CollectionHorizontalPreview from './CollectionHorizontalPreview';
import CollectionDetailsEntity from '../../entities/CollectionDetailsEntity';

import '../styles/top-collections.css';

type Props = {
    cudosPriceChangeDisplay: string;
    cudosPriceUsd: number;
    topCollectionEntities: CollectionEntity[];
    collectionDetailsMap: Map < string, CollectionDetailsEntity >;
}

export default function TopCollections({ cudosPriceChangeDisplay, cudosPriceUsd, topCollectionEntities, collectionDetailsMap }: Props) {
    return (
        <div className={'TopCollections CollectionsGrid Grid GridColumns3'}>
            {topCollectionEntities.length === 0 && (<div className={'NoContent B1 SemiBold'}>There are currently no Top Collections</div>)}
            {topCollectionEntities.map((collectionEntity, index) => {
                const collectionDetailsEntity = collectionDetailsMap.get(collectionEntity.id) ?? new CollectionDetailsEntity();
                return (
                    <CollectionHorizontalPreview
                        key={collectionEntity.id}
                        placeNumber={index + 1}
                        cudosPriceUsd={cudosPriceUsd}
                        cudosPriceChange={cudosPriceChangeDisplay}
                        collectionEntity={collectionEntity}
                        collectionDetailsEntity={collectionDetailsEntity} />
                )
            })}
        </div>
    )
}
