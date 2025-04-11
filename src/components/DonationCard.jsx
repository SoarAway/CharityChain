import { ethers } from "ethers";
import { Progress } from "@/components/ui/progress";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export default function DonationCard({ request, index, handleDonate, showShare = false }) {
  const progress = request.requestedAmount.gt(0)
    ? request.receivedAmount.mul(100).div(request.requestedAmount).toNumber()
    : 0;

  const handleShare = () => {
    const link = `${window.location.origin}/request/${index}`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  return (
<Card>
      <CardHeader>
      <h3 className="text-4xl font-bold">{request.title}</h3>
      <span className="text-lg">{ethers.utils.formatEther(request.requestedAmount)} ETH</span>
      </CardHeader>
      <CardContent>
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
        <div><p className="text-sm text-white line-clamp-2 overflow-y-auto">{request.description}</p></div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300">
        {request.description}
      </p>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="ETH Amount"
          id={`donate-${index}`}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() =>
            handleDonate(index, document.getElementById(`donate-${index}`).value)
          }
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Donate
        </button>
      </div>

      {showShare && (
        <div className="text-center mt-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Copy Shareable Link
          </button>
        </div>
      )}
      </CardContent>
    </Card>
  );
}
