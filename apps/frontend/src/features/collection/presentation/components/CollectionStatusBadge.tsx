import React from 'react';
import StatusBadge, { Statuses } from '../../../../core/presentation/components/StatusBadge';
import CollectionEntity, { CollectionStatus } from '../../entities/CollectionEntity';

type Props = {
    className?: string;
    collectionEntity: CollectionEntity;
}

export default function CollectionStatusBadge({ className, collectionEntity }: Props) {

    function getStatus() {
        switch (collectionEntity.status) {
            case CollectionStatus.QUEUED:
                return Statuses.QUEUED;
            case CollectionStatus.APPROVED:
                return Statuses.APPROVED;
            case CollectionStatus.REJECTED:
            default:
                return Statuses.REJECTED;
        }
    }

    return (
        <StatusBadge className = { className } status = { getStatus() } />
    )
}

CollectionStatusBadge.defaultProps = {
    className: '',
};
