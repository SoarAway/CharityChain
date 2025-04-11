import { ethers } from "ethers";
import { BackgroundGradient } from "@/components/ui/background-gradient";

export const DonationCard = ({ r, i, handleDonate }) => {
  const ProgressPercentage = ({ receivedAmount, requestedAmount }) => {
    if (receivedAmount === 0 || requestedAmount === 0) return 0;
    const percentage = (receivedAmount / requestedAmount) * 100;
    return " " + percentage.toFixed(2) + "%";
  };

  return (
    <div key={i}>
      <BackgroundGradient className="rounded-[22px] h-[360px] sm:p-6 bg-white dark:bg-zinc-900 flex flex-col justify-between ">
        <span>
          <strong className="text-4xl">{r.title}</strong> -{" "}
          {ethers.utils.formatEther(r.requestedAmount)} ETH
        </span>
        <div>
          <img
            src={`https://ipfs.io/ipfs/${r.cid}`}
            alt={r.title}
            className="w-full h-40 object-cover rounded mb-2"
          />
          <progress
            className="h-3 rounded bg-gray-200 dark:bg-gray-700"
            value={r.receivedAmount}
            max={r.requestedAmount}
          ></progress>
          <ProgressPercentage
            receivedAmount={ethers.utils.formatEther(r.receivedAmount)}
            requestedAmount={ethers.utils.formatEther(r.requestedAmount)}
          />
        </div>
        <div>
          <p className="text-sm text-white line-clamp-2 overflow-y-auto">
            {r.description}
          </p>
        </div>
        <div>
          <input
            type="number"
            placeholder="Donate ETH"
            id={`donate-${i}`}
            className="p-1 border rounded w-54 mt-2"
          />
          <button
            onClick={() => handleDonate(i, document.getElementById(`donate-${i}`).value)}
            className="ml-1 px-4 py-1 bg-purple-700 text-white rounded"
          >
            Donate
          </button>
        </div>
      </BackgroundGradient>
    </div>
  );
};