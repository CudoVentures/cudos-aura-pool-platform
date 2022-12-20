import React from 'react';

import ProjectUtils from '../../../../core/utilities/ProjectUtils';

import '../styles/profile-header.css';

type Props = {
    className?: string;
    coverPictureUrl: string;
    profilePictureUrl: string;
}

export default function ProfileHeader({ className, coverPictureUrl, profilePictureUrl }: Props) {
    return (
        <div className={`ProfileHeader CoverPicture ImgCoverNode ${className}`} style={ProjectUtils.makeBgImgStyle(coverPictureUrl)} >
            <div className={'ProfilePicture ImgCoverNode'} style = { ProjectUtils.makeBgImgStyle(profilePictureUrl)} />
        </div>
    )
}

ProfileHeader.defaultProps = {
    className: '',
}
