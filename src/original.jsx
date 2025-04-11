// CharityApp.jsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI } from "./abi";
import TextField from "@mui/material/TextField";
import { Button } from "@/components/ui/button";
import CountUp from './CountUp.jsx'
import GradientText from './GradientText'
import './style.css';
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedContent } from './AnimatedContent'
import { FileUpload } from "@/components/ui/file-upload";
import { create } from '@web3-storage/w3up-client'

const contractAddress = "0xB743744472c8061B7a9422e13f5c822216c9Df9c";

const CharityApp = () => {
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

  useEffect(() => {
    const initStorage = async () => {
      try {
        const client = await create();
        console.log("created");
  
        await client.login('dltyx04@gmail.com');
        console.log("logged in");
  
        await client.setCurrentSpace('did:key:z6Mki3waZWEyyz1TjmE33CbhkYX4ouVs7LjmYSHxmBYZ4roy');
        console.log("space selected");
  
        setW3Client(client);
      } catch (err) {
        console.error("Web3.Storage init failed:", err);
      }
    };
  
    initStorage();
  }, []);
  

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = web3Provider.getSigner();
        const userAddress = await signer.getAddress();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);

        setAccount(userAddress);
        setProvider(web3Provider);
        setContract(contractInstance);
      } else {
        alert("Please install Metamask extension.");
      }
    };

    init();
  }, []);

  function goToHome(){
    setIsLandingPage(false);
    sessionStorage.setItem("isLanding", "false");
  }

  useEffect(() => {
    const fetchData = async () => {
      if (contract) {
        const data = await contract.getRequests();
        setRequests(data);
        const total = await contract.totalDonated();
        setTotalDonated(ethers.utils.formatEther(total));
      }
    };

    fetchData();
  }, [contract]);

  const handleDonate = async (id, amountEth) => {
    if (!amountEth || parseFloat(amountEth) <= 0) {
      alert("Donation must be greater than 0");
      return;
    }
    const tx = await contract.donate(id, {
      value: ethers.utils.parseEther(amountEth),
    });
    await tx.wait();
    window.location.reload();
  };

  const handleRequestFunds = async () => {
    if (!newRequestAmount || !newRequestDesc || !cid) {
      alert("Please provide amount, description, and upload a file.");
      return;
    }

    try {
      const tx = await contract.requestFunds(
        ethers.utils.parseEther(newRequestAmount),
        cid,
        newRequestTitle,
        newRequestDesc
      );      
      await tx.wait();
      setNewRequestAmount("");
      setNewRequestDesc("");
      setCid(null);
      setIsCreatingPost(false);
      window.location.reload();
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Transaction failed. Please check console for details.");
    }
  };

  function ProgressPercentage({receivedAmount, requestedAmount}){
    if (receivedAmount === 0 || requestedAmount === 0){
      return 0;
    }
    const percentage = (receivedAmount/requestedAmount)*100;
    return (" " + percentage.toFixed(2) + "%")
  }

  function List() {
    const filteredData = requests.filter((data) => {
      if (inputText === '') return data;
      return data.description.toLowerCase().includes(inputText);
    });

    return (
      <div className="flex flex-wrap justify-center px-6 py-6 card-grid">
        {filteredData.map((r, i) => (
          <div key={i}>
            <BackgroundGradient className="rounded-[22px] h-[360px] sm:p-6 bg-white dark:bg-zinc-900 flex flex-col justify-between ">
              <span><strong className="text-4xl">{r.title}</strong> - {ethers.utils.formatEther(r.requestedAmount)} ETH</span>
              <div>
              <img 
                  src={`https://ipfs.io/ipfs/${r.cid}`} 
                  alt={r.title} 
                  className="w-full h-40 object-cover rounded mb-2"
              />
                <progress className="h-3 rounded bg-gray-200 dark:bg-gray-700" value={r.receivedAmount} max={r.requestedAmount}></progress>
                <ProgressPercentage receivedAmount={ethers.utils.formatEther(r.receivedAmount)} requestedAmount={ethers.utils.formatEther(r.requestedAmount)}/>
              </div>
              <div><p className="text-sm text-white line-clamp-2 overflow-y-auto">{r.description}</p></div>
              <div>
                <input type="number" placeholder="Donate ETH" id={`donate-${i}`} className="p-1 border rounded w-54 mt-2" />
                <button onClick={() => handleDonate(i, document.getElementById(`donate-${i}`).value)} className="ml-1 px-4 py-1 bg-purple-700 text-white rounded">Donate</button>
              </div>
            </BackgroundGradient>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {isLandingPage ? (
        <div className="relative w-screen h-screen overflow-hidden">
          <div className="w-screen h-screen">
            <div className="relative flex h-screen w-full items-center justify-center bg-white dark:bg-black">
              <div className={cn("absolute inset-0 z-0", "[background-size:40px_40px]", "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]", "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]")}/>
              <div onClick={goToHome} className="relative z-10 flex flex-col items-center space-y-4">
                <GradientText colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]} animationSpeed={5} showBorder={false} onClick={() => setIsLandingPage(false)}>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1 text-6xl md:text-8xl font-bold">
                      <CountUp from={0} to={totalDonated * 1000000} separator="," direction="up" duration={1} className="count-up-text" />
                      <span> Gwei funded</span>
                    </div> 
                  </div>
                </GradientText>
                <Button variant="outline" className="mt-10" onClick={goToHome}>Donate now</Button>              
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-white text-center">Charity Chain</h1>
            <TextField id="outlined-basic" variant="outlined" fullWidth label="Search" onChange={(e) => setInputText(e.target.value.toLowerCase())} className="mb-4" sx={{"& .MuiOutlinedInput-root": { color: "white", "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#BF77F6" }, "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": { borderColor: "#F6CEFC" } }, "& .MuiInputLabel-outlined": { color: "white", "&.Mui-focused": { color: "#F6CEFC" } }}} />
          </div>
          <List />
          <Button onClick={() => setIsCreatingPost(true)} variant="outline" size="icon" className="absolute bottom-10 right-10 bg-black text-white transition-colors duration-200 hover:bg-white hover:text-black hover:outline-1 hover:outline-black">+</Button>
          {isCreatingPost && (
            <div className="create-post-overlay p-4 shadow flex justify-center items-center ">
              <AnimatedContent distance={150} direction="vertical" reverse={false} config={{ tension: 80, friction: 20 }} initialOpacity={0.2} animateOpacity scale={1.1} threshold={0.2}> 
                <Card className="bg-black card max-w-md">
                  <CardHeader>
                    <CardTitle>Create new request</CardTitle>
                    <CardDescription>
                      <input type="text" placeholder="Title" value={newRequestTitle} onChange={(e) => setNewRequestTitle(e.target.value)} className="p-2 border rounded mr-2 mb-2 block w-full" />
                      <FileUpload onChange={async (fileList) => {
                        if (!w3client || fileList.length === 0) return;
                        try {
                          const cid = await w3client.uploadFile(fileList[0]);
                          setCid(cid.toString());
                        } catch (err) {
                          console.error("Upload failed:", err);
                          alert("Upload failed. Check console for details.");
                        }
                      }} />
                      {cid && <p className="text-white mt-2">Uploaded: <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">{cid}</a></p>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <input type="text" placeholder="Description" value={newRequestDesc} onChange={(e) => setNewRequestDesc(e.target.value)} className="p-2 border rounded mr-2 mb-2 block w-full" />
                    <input type="number" placeholder="Amount in ETH" value={newRequestAmount} onChange={(e) => setNewRequestAmount(e.target.value)} className="p-2 border rounded mr-2 mb-2 block w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={() => setIsCreatingPost(false)}>Cancel</Button>
                      <Button variant="outline" onClick={handleRequestFunds}>Submit</Button>
                    </div>
                  </CardFooter>
                </Card>
              </AnimatedContent>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CharityApp;
