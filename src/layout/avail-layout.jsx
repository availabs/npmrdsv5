import React from "react";
import { useTheme, TopNav, SideNav } from "~/modules/avl-components/src";
import AuthMenu from "~/pages/Auth/AuthMenu"
import {Logo} from '~/themes'

let marginSizes = {
	none: '',
	micro: 'mr-14',
	mini: 'mr-20',
	miniPad: 'mr-0',	
	compact: 'mr-44',
	full: 'mr-64'
}

let fixedSizes = {
	none: '',
	micro: 'w-14',
	mini: 'w-20',
	miniPad: 'w-0',
	compact: 'w-44',
	full: 'w-64'
}

const Layout = ({ children, menus, sideNav={}, topNav={}, Title }) => {
	const theme = useTheme()
	const sideNavOptions = {
		size: sideNav.size || 'none',
		color: sideNav.color || 'dark',
		menuItems: sideNav.menuItems || menus
	}

	const topNavOptions = {
		position: topNav?.position || 'block',
		size: topNav?.size || 'compact',
		menu: topNav?.menu || 'left',
		subMenuStyle: topNav?.subMenuStyle || 'row',
		menuItems: (topNav?.menuItems || []).filter(page => !page?.hideInNav),
		logo: topNav?.logo || (
			<div className='flex items-center justify-center h-12'>
				<div to="/" className={`${['none'].includes(sideNavOptions.size)  ? '' : 'md:hidden'}` }>
					<Logo sideNav={sideNavOptions}/>
				</div>
				{typeof Title === 'function' ? <Title /> : Title}
			</div>
		)
	}

	 //console.log('layout', topNav)
	
	return (
		<div className='flex' >
			{
				sideNavOptions.size === 'none' ? '' : (
					<div className={`hidden md:block ${marginSizes[sideNavOptions.size]}`}>
						<div className={`fixed h-screen ${fixedSizes[sideNavOptions.size]}`}>
							<SideNav 
								topMenu={<Logo sideNav={sideNavOptions}/>}
								themeOptions={sideNavOptions}
								menuItems={sideNavOptions.menuItems}
							/>
						</div>
					</div>
				)
			}
			<div className={`flex-1 flex items-start flex-col items-stretch min-h-screen w-full`}>
				{
					topNavOptions.size === 'none' ? '' : (<>
						<div className={`${
							topNavOptions?.position === 'fixed' ? 
								`sticky top-0 z-20 w-full ` 
								: ''
							}`}>
								<TopNav
									themeOptions={topNavOptions}
									// subMenuActivate={'onHover'}
									leftMenu={topNavOptions.logo}
									menuItems={topNavOptions.menuItems}
									rightMenu={<AuthMenu />}
									
								/>
						</div>
					</>)
				}
				<div id={'content'} className={`h-full flex-1 bg-slate-100`}>
					{children}
				</div>
			</div>
		</div>
	);
};

export default Layout;