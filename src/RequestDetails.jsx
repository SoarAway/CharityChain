import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import DonationCard from "./components/DonationCard";
import { contractABI } from "./abi";

const contractAddress = "0xB743744472c8061B7a9422e13f5c822216c9Df9c";

export default function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);

  // Initialize contract from MetaMask
  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask.");
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
      alert("Please enter a valid amount");
      return;
    }

    try {
      const tx = await contract.donate(requestId, {
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      alert("Donation successful!");
      window.location.reload();
    } catch (error) {
      console.error("Donation failed:", error);
      alert("Donation failed");
    }
  };

  if (loading) return <div className="text-center p-10 text-lg">Loading request...</div>;
  if (!request) return <div className="text-center p-10 text-red-500">Request not found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <DonationCard request={request} index={id} handleDonate={handleDonate} />
      <div className="mt-4 text-center">
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Copy Shareable Link
        </button>
      </div>
    </div>
  );
}
