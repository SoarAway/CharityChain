import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI } from "./abi";
import TextField from "@mui/material/TextField";
import { Button } from "@/components/ui/button";
import { create } from '@web3-storage/w3up-client';
import LandingPage from "./components/LandingPage";
import DonationCard from "./components/DonationCard";
import RequestForm from "./components/RequestForm";
import Aurora from "@/components/ui/Aurora";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RequestDetails from "./RequestDetails"
import TrueFocus from '@/components/ui/TrueFocus';
import Alert from "./components/Alert"

const contractAddress = "0xB743744472c8061B7a9422e13f5c822216c9Df9c";

const CharityApp = () => {
  // State management
  const [isLandingPage, setIsLandingPage] = useState(() => {
    const value = sessionStorage.getItem("isLanding");
    return value === null ? true : value === "true";
  });
  const [requests, setRequests] = useState([]);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalDonated, setTotalDonated] = useState(0);
  const [newRequestAmount, setNewRequestAmount] = useState("");
  const [newRequestDesc, setNewRequestDesc] = useState("");
  const [newRequestTitle, setNewRequestTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [cid, setCid] = useState(null);
  const [w3client, setW3Client] = useState(null);
  const [showMetaMaskError, setShowMetaMaskError] = useState(false);
  const [showInvalidAmountError, setShowInvalidAmountError] = useState(false);
  const [showMissingFieldError, setShowMissingFieldError] = useState(false);
  const [showTransactionFailedError, setShowTransactionFailedError] = useState(false);
  const [showInsufficientFundsError, setShowInsufficientFundsError] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Web3.Storage initialization
  useEffect(() => {
    const initStorage = async () => {
      try {
        const client = await create();
        await client.login('dltyx04@gmail.com');
        await client.setCurrentSpace('did:key:z6Mki3waZWEyyz1TjmE33CbhkYX4ouVs7LjmYSHxmBYZ4roy');
        setW3Client(client);
      } catch (err) {
        console.error("Web3.Storage init failed:", err);
      }
    };
    initStorage();
  }, []);

  // Ethereum initialization
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = web3Provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        
        setAccount(await signer.getAddress());
        setProvider(web3Provider);
        setContract(contractInstance);
      } else {
        setShowMetaMaskError(true);
      }
    };
    init();
  }, []);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (contract) {
        setRequests(await contract.getRequests());
        setTotalDonated(ethers.utils.formatEther(await contract.totalDonated()));
      }
    };
    fetchData();
  }, [contract]);

  // Core functionality
  const handleDonate = async (id, amountEth) => {
    if (!amountEth || parseFloat(amountEth) <= 0) {
      return setShowInvalidAmountError(true);
    }
  
    const amountInWei = ethers.utils.parseEther(amountEth);
  
    try {
      const balance = await provider.getBalance(account);
  
      if (balance.lt(amountInWei)) {
        return setShowInsufficientFundsError(true);
      }
  
      const tx = await contract.donate(id, { value: amountInWei });
      await tx.wait();
  
      setShowSuccessAlert(true);
  
      // Wait 2 seconds, then reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error("Transaction failed:", err);
      setShowTransactionFailedError(true);
    }
  }; 

  const handleRequestFunds = async () => {
    if (!newRequestAmount || !newRequestDesc || !cid) return setShowMissingFieldError(true);
    try {
      const tx = await contract.requestFunds(
        ethers.utils.parseEther(newRequestAmount),
        cid,
        newRequestTitle,
        newRequestDesc
      );
      await tx.wait();
      resetForm();
      window.location.reload();
    } catch (err) {
      console.error("Transaction failed:", err);
      setShowTransactionFailedError(true);
    }
  };

  const resetForm = () => {
    setNewRequestAmount("");
    setNewRequestDesc("");
    setNewRequestTitle("");
    setCid(null);
    setIsCreatingPost(false);
  };

  const goToHome = () => {
    setIsLandingPage(false);
    sessionStorage.setItem("isLanding", "false");
  };

  // Filtered requests
  return (
    <Router>
  <Routes>
    <Route
      path="/"
      element={
        isLandingPage ? (
          <LandingPage 
            totalDonated={totalDonated} 
            goToHome={goToHome}
          />
        ) : (
          <div className="relative min-h-screen">
            <Aurora
              colorStops={["#2962FF", "#9633FF", "#FF94B4"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
            {/* Search Header */}
            <div className=" max-w-xl mx-auto trueFocusText">
            <TrueFocus 
              sentence="Charity Chain"
              manualMode={false}
              blurAmount={5}
              borderColor="#FF94B4"
              animationDuration={2}
              pauseBetweenAnimations={1}
              />
              <div className="mt-5">
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                onChange={(e) => setInputText(e.target.value.toLowerCase())}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "white",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8B5CF6",
                    },
                    "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8B5CF6",
                    }
                  },
                  "& .MuiInputLabel-outlined": {
                    color: "white",
                    "&.Mui-focused": { color: "#8B5CF6" }
                  }
                }}
              />
              </div>
            </div>
            <Alert
              open={showInsufficientFundsError}
              onClose={() => setShowInsufficientFundsError(false)}
              title="Insufficient Funds"
              description="You do not have enough ETH in your wallet to complete this transaction."
            />
            <Alert
              open={showSuccessAlert}
              onClose={() => setShowSuccessAlert(false)}
              title="Donation Successful!"
              description="Your donation has been sent. Thank you for your contribution!"
            />
            <Alert
              open={showMetaMaskError}
              onClose={() => setShowMetaMaskError(false)}
              title="MetaMask not found!"
              description="Please install Metamask extension."
            />
            <Alert
              open={showInvalidAmountError}
              onClose={() => setShowInvalidAmountError(false)}
              title="Invalid amount!"
              description="Please enter a value greater than 0."
            />
            <Alert
              open={showMissingFieldError}
              onClose={() => setShowMissingFieldError(false)}
              title="Missing required Fields!"
              description="Please fill in all the fields or wait for the picture to be uploaded."
              className="z-50"
            />
            <Alert
              open={showTransactionFailedError}
              onClose={() => setShowTransactionFailedError(false)}
              title="Transaction failed!"
              description="Something went wrong. Please try again."
            />
            {/* Donation Grid */}
            <div className="flex flex-wrap justify-center px-6 py-6 gap-4">
              {requests
                .map((r, i) => ({ request: r, index: i })) // preserve original index
                .filter(({ request }) => !request.fulfilled) // filter out fulfilled ones
                .filter(({ request }) => inputText ? request.title.toLowerCase().includes(inputText) : true) // search filter
                .map(({ request, index }) => (
                  <DonationCard
                    key={index}
                    request={request}
                    index={index}
                    handleDonate={handleDonate}
                    showShare={true}
                  />
              ))}
            </div>

            {/* Create Request Button */}
            <Button
              onClick={() => setIsCreatingPost(true)}
              variant="outline"
              className="fixed bottom-10 right-10 bg-purple-500 text-white hover:bg-purple-600 flex items-center overflow-hidden transition-all duration-300 ease-in-out w-12 hover:w-56 h-12 rounded-xl group px-4 justify-center hover:justify-start"
            >
              {/* Default state "+" */}
              <span className="text-xl group-hover:hidden">+</span>

              {/* Hover state SVG + Text */}
              <div className="hidden group-hover:flex items-center gap-2">
              <span className="text-xl">+</span>
                <span className="whitespace-nowrap">Request for donation</span>
              </div>
            </Button>


            {/* Request Form Modal */}
            {isCreatingPost && (
              <RequestForm
                newRequestTitle={newRequestTitle}
                newRequestDesc={newRequestDesc}
                newRequestAmount={newRequestAmount}
                cid={cid}
                w3client={w3client}
                setNewRequestTitle={setNewRequestTitle}
                setNewRequestDesc={setNewRequestDesc}
                setNewRequestAmount={setNewRequestAmount}
                setCid={setCid}
                onCancel={() => setIsCreatingPost(false)}
                onSubmit={handleRequestFunds}
              />
            )}
          </div>
        )
      }
    />
    <Route path="/request/:id" element={
      <RequestDetails 
      provider={provider} 
      account={account} 
      contract={contract} 
      />
    }
    />
  </Routes>
</Router>

  );
};

export default CharityApp;