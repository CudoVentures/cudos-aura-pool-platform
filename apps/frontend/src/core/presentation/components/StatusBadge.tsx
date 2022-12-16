import React from 'react';

import Svg from './Svg';

import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SvgMiningFarmStatusReview from '../../../public/assets/vectors/status-review.svg';
import SvgMiningFarmStatusApproved from '../../../public/assets/vectors/status-approved.svg';
import '../styles/status-badge.css';

export const enum Statuses {
    APPROVED = 1,
    REJECTED = 2,
    QUEUED = 3,
}

type Props = {
    className?: string;
    status: Statuses;
}

export default function StatusBadge({ className, status }: Props) {

    function getCssClass() {
        switch (status) {
            case Statuses.APPROVED:
                return 'ApprovedBadge';
            case Statuses.REJECTED:
                return 'RejectedBadge';
            case Statuses.QUEUED:
            default:
                return 'QueuedBadge';
        }
    }

    function renderLabel() {
        switch (status) {
            case Statuses.APPROVED:
                return 'Verified';
            case Statuses.REJECTED:
                return 'Rejected';
            case Statuses.QUEUED:
            default:
                return 'Under review';
        }
    }

    function getSvg() {
        switch (status) {
            case Statuses.APPROVED:
                return SvgMiningFarmStatusApproved;
            case Statuses.REJECTED:
                return HighlightOffIcon;
            case Statuses.QUEUED:
            default:
                return SvgMiningFarmStatusReview;
        }
    }

    return (
        <div className = { `StatusBadge FlexRow Bold ${getCssClass()} ${className}` } >
            <Svg svg = { getSvg() } />
            { renderLabel() }
        </div>
    )
}

StatusBadge.defaultProps = {
    className: '',
};
