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
        alert("Please install Metamask extension.");
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
    if (!amountEth || parseFloat(amountEth) <= 0) return alert("Invalid amount");
    const tx = await contract.donate(id, { value: ethers.utils.parseEther(amountEth) });
    await tx.wait();
    window.location.reload();
  };

  const handleRequestFunds = async () => {
    if (!newRequestAmount || !newRequestDesc || !cid) return alert("Missing required fields");
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
      alert("Transaction failed. Check console for details.");
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
              colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
              blend={0.5}
              amplitude={1.0}
              speed={0.5}
            />
            {/* Search Header */}
            <div className="p-4 max-w-xl mx-auto">
              <h1 className="text-2xl font-bold mb-4 text-white text-center">
                Charity Chain
              </h1>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                onChange={(e) => setInputText(e.target.value.toLowerCase())}
                sx={{
                  "& .MuiOutlinedInput-root": { 
                    color: "white",
                    "& fieldset": { borderColor: "white" },
                    "&:hover fieldset": { borderColor: "#F6CEFC" },
                    "&.Mui-focused fieldset": { borderColor: "#BF77F6" }
                  },
                  "& .MuiInputLabel-root": { color: "white","&.Mui-focused fieldset": { borderColor: "#BF77F6"}}
                }}
              />
            </div>

            {/* Donation Grid */}
            <div className="flex flex-wrap justify-center px-6 py-6 gap-4">
              {requests
                .map((r, i) => ({ request: r, index: i })) // preserve original index
                .filter(({ request }) => !request.fulfilled) // filter out fulfilled ones
                .filter(({ request }) => inputText ? request.description.toLowerCase().includes(inputText) : true) // search filter
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
              size="icon"
              className="fixed bottom-10 right-10 bg-black text-white hover:bg-white hover:text-black"
            >
              +
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
    <Route path="/request/:id" element={<RequestDetails />} />
  </Routes>
</Router>

  );
};

export default CharityApp;