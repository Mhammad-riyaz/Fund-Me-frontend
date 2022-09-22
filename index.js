import { ethers } from "./ethers-5.2.esm.min.js"
import { abi, contractAddress } from "./cosntants.js"

const connectBtn = document.getElementById("connect")
const fundBtn = document.getElementById("fund")
const balanceBtn = document.getElementById("balance")
const withdrawBtn = document.getElementById("withdraw")
const status = document.getElementById("withdraw-status")
const label = document.getElementById("label")

connectBtn.onclick = connect
fundBtn.onclick = fund
balanceBtn.onclick = balance
withdrawBtn.onclick = withdraw

const contractAbi = abi
const cAddress = contractAddress
let connected = false
async function connect() {
    if (window.ethereum) {
        connected = true
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectBtn.innerHTML = "Connected"
    } else {
        console.log("Please install metamak wallet")
    }
}

async function fund() {
    const ethAmount = document.getElementById("input").value
    console.log(ethAmount)
    if (connected) {
        const provider = await new ethers.providers.Web3Provider(
            window.ethereum
        ) //--> gives the http url the provider
        const signer = provider.getSigner() //--> Returns the wallet that is connected to the provider
        const contract = new ethers.Contract(cAddress, contractAbi, signer)

        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done")
        } catch (error) {
            console.log(error)
        }
    } else {
        alert("Wallet not connected")
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    // provider.once(event_name,listener)
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (trnsactionReceipt) => {
            console.log(
                `Completed with ${trnsactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function balance() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    let balance = await provider.getBalance(cAddress)
    console.log(ethers.utils.formatEther(balance))
    label.innerHTML = `${balance / 1000000000000000000}`
}

async function withdraw() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(cAddress, contractAbi, signer)
    try {
        const transactionResponse = await contract.withdraw()
        await listenForTransactionMine(transactionResponse, provider)
        status.innerHTML = "Successfull"
    } catch (error) {
        console.log(error)
    }
}
