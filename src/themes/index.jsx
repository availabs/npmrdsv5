import catalyst from './catalyst/theme'
import mny from './mny/theme'
import React from 'react'
import { Link } from 'react-router'

export const Logo = () => {
	
	// console.log('logo', color, size)
	return (
		<Link to="/" className={` flex flex-col items-center justify-center`}>
			<div className='flex items-center '>
				<img 
					src={`/nys_logo_blue.svg`} 
					className='w-full h-12 justify-between' 
					alt='New York State Logo' 
				/>
				<div className={`font-['Oswald'] font-[500]`}> TransportNY </div>
			</div>	
		</Link>
		
	)
}



export default {
	catalyst,
	mny,
	default: {
	    navOptions: {
	      logo: <Logo />,
	    }
	}
}