// Functions initially from App.js

import { ethers } from 'ethers'
import {
    setProvider,
    setNetwork,
    setAccount 
    } from './reducers/provider'

import {
    setContracts,
    setSymbols,
    balancesLoaded    
    } from './reducers/tokens'

    import {
        setContract,
        sharesLoaded   
    } from './reducers/amm'

import TOKEN_ABI from '../abis/Token.json';
import AMM_ABI from '../abis/AMM.json';
import config from '../config.json';


export const loadProvider = (dispatch) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    dispatch(setProvider(provider))

    return provider
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch(setNetwork(chainId))
    
    return chainId
}

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    dispatch(setAccount(account)) // Hook for Redux

    return account
}

// -------------------------------------------------------------------------------------------
// LOAD CONTRACTS
export const loadTokens = async (provider, chainId, dispatch) => {
    const sobek = new ethers.Contract(config[chainId].sobek.address, TOKEN_ABI, provider)
    const usd = new ethers.Contract(config[chainId].usd.address, TOKEN_ABI, provider)

    dispatch(setContracts([sobek, usd]))
    dispatch(setSymbols([await sobek.symbol(), await usd.symbol()]))
}

export const loadAMM = async (provider, chainId, dispatch) => {
    const amm = new ethers.Contract(config[chainId].amm.address, AMM_ABI, provider)    

    dispatch(setContract([amm]))
    
    return amm
}


// -------------------------------------------------------------------------------------------
// LOAD BALANCES & SHARES
export const loadBalances = async (amm, tokens, account, dispatch) => {
    const balance1 = await tokens[0].balanceOf(account)
    const balance2 = await tokens[1].balanceOf(account)

    dispatch(balancesLoaded([
        ethers.utils.formatUnits(balance1.toString(), 'ether'),
        ethers.utils.formatUnits(balance2.toString(), 'ether')
    ]))

    const shares = await amm.shares(account) // ERROR - Uncaught (in promise) TypeError: amm.shares is not a function
                                            // at loadBalances (bundle.js:680:28)
                                            // at async connectHandler (bundle.js:283:5)
    dispatch(sharesLoaded(ethers.utils.formatUnits(shares.toString(), 'ether')))
}
