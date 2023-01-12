import React from 'react';
import StatusBadge, { Statuses } from '../../../core/presentation/components/StatusBadge';
import MiningFarmEntity, { MiningFarmStatus } from '../../entities/MiningFarmEntity';

type Props = {
    className?: string;
    miningFarmEntity: MiningFarmEntity;
}

export default function MiningFarmStatusBadge({ className, miningFarmEntity }: Props) {

    function getStatus() {
        switch (miningFarmEntity.status) {
            case MiningFarmStatus.QUEUED:
                return Statuses.QUEUED;
            case MiningFarmStatus.APPROVED:
                return Statuses.APPROVED;
            case MiningFarmStatus.REJECTED:
            default:
                return Statuses.REJECTED;
        }
    }

    return (
        <StatusBadge className = { className } status = { getStatus() } />
    )
}

MiningFarmStatusBadge.defaultProps = {
    className: '',
};
