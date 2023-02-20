import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

const CONTRACT_ADDRESS = "0xDa68Ab92507e2048ee50d6C6E11810008A4E7215";

const TWITTER_HANDLE = 'bruno_fialho';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/animalsnft-3';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftMintedSoFar, setNftMintedSoFar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const checkIfWalletIsConnected = useCallback(async () => {
    const { ethereum } = window;

    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    const goerliChainId = "0x5"; 
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)

        setupEventListener()
    } else {
        console.log("No authorized account found")
    }
  }, []);

const connectWallet = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Get MetaMask!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    console.log("Connected", accounts[0]);
    setCurrentAccount(accounts[0]);

    setupEventListener() 
  } catch (error) {
    console.log(error)
  }
}

const setupEventListener = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });

      console.log("Setup event listener!")
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}

const getTotalNFTsMintedSoFar = async () => {
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      let nftCount = await connectedContract.getTotalNFTsMintedSoFar();

      if (nftCount > 0) {
        setNftMintedSoFar(nftCount);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

const askContractToMintNft = async () => {
  setIsLoading(true);
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      console.log("Going to pop wallet now to pay gas...")
      let nftTxn = await connectedContract.makeAnEpicNFT();

      console.log("Mining...please wait.")
      await nftTxn.wait();
      console.log(nftTxn);
      console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  } finally {
    getTotalNFTsMintedSoFar();
    setIsLoading(false);
  }
}

useEffect(() => {
  checkIfWalletIsConnected();
}, [checkIfWalletIsConnected])

useEffect(() => {
  getTotalNFTsMintedSoFar();
}, [])

const renderNotConnectedContainer = () => (
  <button onClick={connectWallet} className="cta-button connect-wallet-button">
    Connect to Wallet
  </button>
);

const renderMintUI = () => (
  <button 
    onClick={askContractToMintNft} 
    className="cta-button connect-wallet-button" 
    disabled={isLoading}
  >
    {isLoading ? 'Loading..' : "Mint NFT"}
  </button>
)

return (
  <div className="App">
    <div className="container">
      <div className="header-container">
        <p className="header gradient-text">My NFT Collection</p>
        <p className="sub-text">
          Each unique. Each beautiful. Discover your NFT today.
        </p>
        <p className="sub-text">🌊 View Collection on{" "}
          <a 
            className="link" 
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >
            OpenSea!
          </a>
        </p>
        <p className="sub-text">
          {`${nftMintedSoFar}/${TOTAL_MINT_COUNT} NFTs minted so far`}
        </p>
        {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
      </div>
      <div className="footer-container">
        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
        <a
          className="footer-text"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >{`built by @${TWITTER_HANDLE}`}</a>
      </div>
    </div>
  </div>
);
};

export default App;