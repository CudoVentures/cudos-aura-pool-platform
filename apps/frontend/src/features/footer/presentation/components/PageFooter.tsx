import Svg from '../../../../core/presentation/components/Svg';
import SvgAuraPoolLogoLight from '../../../../public/assets/vectors/aura-pool-logo-light.svg'
import SvgLinkedin from '../../../../public/assets/vectors/linkedin.svg';
import SvgTwitter from '../../../../public/assets/vectors/twitter.svg';
import SvgFacebook from '../../../../public/assets/vectors/facebook.svg';
import SvgMedium from '../../../../public/assets/vectors/medium.svg';
import SvgTelegram from '../../../../public/assets/vectors/telegram.svg';
import SvgDiscord from '../../../../public/assets/vectors/discord.svg';
import SvgSpotify from '../../../../public/assets/vectors/spotify.svg';
import SvgYoutube from '../../../../public/assets/vectors/youtube.svg';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY, WEBSITE, TELEGRAM, LINKEDIN, TWITTER, DISCORD, FACEBOOK, MEDIUM, SPOTIFY, YOUTUBE } from '../../../../core/utilities/Links';

import React from 'react'
import '../styles/page-footer.css'

export default function PageFooter() {
    return (
        <footer className='FooterContainer'>
            <div className={'PageFooter FlexRow FlexSplit'}>
                <Svg className={'SVG'} svg={SvgAuraPoolLogoLight} />
                <div className={'StartRightBlock FooterNav'}>
                    <div className={ 'LinksColumn' }>
                        <div className='H3'>Join Us</div>
                        <a href={LINKEDIN} target={'_blank'} rel={'noreferrer'} >LinkedIn</a>
                        <a href={TWITTER} target={'_blank'} rel={'noreferrer'} >Twitter</a>
                        <a href={MEDIUM} target={'_blank'} rel={'noreferrer'} >Medium</a>
                        <a href={FACEBOOK} target={'_blank'} rel={'noreferrer'} >Facebook</a>
                        <a href={TELEGRAM} target={'_blank'} rel={'noreferrer'} >Telegram</a>
                        <a href={DISCORD} target={'_blank'} rel={'noreferrer'} >Discord</a>
                        <a href={SPOTIFY} target={'_blank'} rel={'noreferrer'} >Spotify</a>
                        <a href={YOUTUBE} target={'_blank'} rel={'noreferrer'} >Youtube</a>
                    </div>
                    <div className={ 'LinksColumn' }>
                        <div className='H3'>Marketplace</div>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Explore</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Calculator</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >What is AuraPool</a>
                    </div>
                    <div className={ 'LinksColumn' }>
                        <div className='H3'>Link</div>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                        <a href={'#'} target={'_blank'} rel={'noreferrer'} >Documentation Link</a>
                    </div>
                </div>
            </div>
            <div className={'FooterNav FlexRow TermsContainer'} >
                <a href={TERMS_AND_CONDITIONS} >Terms &amp; Conditions</a>
                <a href={PRIVACY_POLICY} >Privacy Policy</a>
                <a href={WEBSITE} target={'_blank'} rel={'noreferrer'} >Cudos.org</a>
                <a>License &copy; 2018 - {new Date().getFullYear()}</a>
            </div>
        </footer>
    )
}
