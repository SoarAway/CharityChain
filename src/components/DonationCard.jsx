import { ethers } from "ethers";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export default function DonationCard({ request, index, handleDonate }) {
  const progress = request.requestedAmount.gt(0) 
    ? request.receivedAmount.mul(100).div(request.requestedAmount).toNumber()
    : 0;

  return (
    <BackgroundGradient className="rounded-[22px] h-[360px] sm:p-6 bg-white dark:bg-zinc-900 flex flex-col justify-between">
      <h3 className="text-4xl font-bold">{request.title}</h3>
      <span className="text-lg">{ethers.utils.formatEther(request.requestedAmount)} ETH</span>
      
      <div className="space-y-2">
        <img
          src={`https://ipfs.io/ipfs/${request.cid}`}
          alt={request.title}
          className="w-full h-40 object-cover rounded"
        />
        <div className="space-y-1">
          <progress 
            className="w-full h-3 rounded bg-gray-200 dark:bg-gray-700"
            value={progress}
            max="100"
          />
          <span className="text-sm">{progress.toFixed(2)}% Funded</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="ETH Amount"
          id={`donate-${index}`}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() => handleDonate(index, document.getElementById(`donate-${index}`).value)}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Donate
        </button>
      </div>
    </BackgroundGradient>
  );
}