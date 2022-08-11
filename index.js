// instead of writing our js in the html file, we are going to write it here and then import this file into the html

// in nodejs we use the require() keyword to import packages
// in front-end javascript you cant use require, we use import  --> this is raw javascript

import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js" // we have all of the information we need to be able to interact with our contract

// this is how we make the onclick change commented in the index.html file

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

// we are only going to use this way of implementing ethers in this lesson, in future lessons we will use nodejs

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected"
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

// fund function

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer) // ethers contract connected to our signer (our account)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding ${ethAmount}`)
  if (typeof window.ethereum !== "undefined") {
    // to send a txn we absolutely need:

    // provider / connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum) // finds metamask

    // signer / wallet / someone with some gas
    const signer = provider.getSigner() // this is going to return whatever wallet is connected to our provider (aka metamask)
    console.log(signer)
    // contract that we are interacting with
    // to get this contract we will need its ABI & address
    const contract = new ethers.Contract(contractAddress, abi, signer) // ethers contract connected to our signer (our account)
    try {
      const txnResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      // listen for a tx to be mined and wait
      await listenForTransactionMine(txnResponse, provider)
      console.log("Done!")
    } catch (error) {
      console.log("error")
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.utils.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  // we have to create a listener for the blockchain
  // listen for the txn to complete
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      )
      resolve() // this only executes once the function aboce has been completed
    })
  })
}
