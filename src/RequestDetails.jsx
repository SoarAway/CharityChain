import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import DonationCard from "./components/DonationCard";
import { contractABI } from "./abi";
import Aurora from "@/components/ui/Aurora";
import Alert from "./components/Alert"

const contractAddress = "0xB743744472c8061B7a9422e13f5c822216c9Df9c";

export default function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailedDialog, setShowFailedDialog] = useState(false);
  const [showMetaMaskError, setShowMetaMaskError] = useState(false);
  const [showInvalidAmountError, setShowInvalidAmountError] = useState(false);
  const navigate = useNavigate();

  // Initialize contract from MetaMask
  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          setShowMetaMaskError(true);
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    };

    init();
  }, []);

  // Fetch the request details from contract
  useEffect(() => {
    const fetchRequest = async () => {
      if (!contract) return;

      try {
        const allRequests = await contract.getRequests();
        const singleRequest = allRequests[id];

        if (!singleRequest) {
          throw new Error("Request not found.");
        }

        setRequest(singleRequest);
      } catch (err) {
        console.error("Error fetching request:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [contract, id]);

  // Donate function
  const handleDonate = async (requestId, amount) => {
    if (!amount || isNaN(amount)) {
      setShowInvalidAmountError(true);
      return;
    }
  
    try {
      const tx = await contract.donate(requestId, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Donation failed:", error);
      setShowFailedDialog(true);
    }
  };
  

  if (loading) return <div className="text-center p-10 text-lg">Loading request...</div>;
  if (!request) return <div className="text-center p-10 text-red-500">Request not found.</div>;

  return (
    <div>
      <Aurora
        colorStops={["#2962FF", "#9633FF", "#FF94B4"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-5xl font-bold mb-4 text-white text-center cursor-pointer" onClick={() => navigate("/")}>
        Charity Chain
      </h1>
        <DonationCard request={request} index={id} handleDonate={handleDonate} showShare={true} />
    </div>
      <Alert
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          title="Transaction is successful!"
          description="Page is reloading."
        />
      <Alert
          open={showFailedDialog}
          onClose={() => setShowFailedDialog(false)}
          title="Transaction failed!"
          description="Something went wrong. Please try again."
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
    </div>


  );
}
