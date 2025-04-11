import { ethers } from "ethers";
import { Progress } from "@/components/ui/progress";
import ShareIcon from '@/assets/share.svg?react';
import SpotlightCard from "@/components/ui/SpotlightCard";
import {Input} from "@/components/ui/Input";
import {Card,CardContent,CardHeader} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function DonationCard({ request, index, handleDonate, showShare = false }) {
  const progress = request.requestedAmount.gt(0)
    ? request.receivedAmount.mul(100).div(request.requestedAmount).toNumber()
    : 0;

  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);

  const handleShare = () => {
    const link = `${window.location.origin}/request/${index}`;
    navigator.clipboard.writeText(link);
    setShowDialog(true); // show the alert dialog
  };

  return (
    <SpotlightCard>
    <Card className='donation-card'>
      <CardHeader className='donation-header' onClick={() => navigate(`/request/${index}`)}>
        <div>
          <h3 className="text-4xl font-bold">{request.title}</h3>
          <span className="text-lg">{ethers.utils.formatEther(request.requestedAmount)} ETH</span>
        </div>
        {showShare && (
            <ShareIcon 
              onClick={handleShare}
              className="h-10 w-10 cursor-pointer hover:text-blue-500 transition-colors"
              role="button"
              aria-label="Share"
            />
      )}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-[#141212]">
          <AlertDialogHeader>
            <AlertDialogTitle>Link Copied!</AlertDialogTitle>
            <AlertDialogDescription>
              You can now share the donation request with others.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2" onClick={() => navigate(`/request/${index}`)}>
          <img
            src={`https://ipfs.io/ipfs/${request.cid}`}
            alt={request.title}
            className="w-full h-40 object-cover rounded"
          />
        </div>
        <div className='mt-3 mb-3 progressBar' onClick={() => navigate(`/request/${index}`)}>
          <Progress value={progress} />
          <div className= 'text-muted-foreground text-right'>{progress} %</div>
        </div>

      <div className="descriptionBox mb-4 text-sm text-gray-600 dark:text-gray-300" onClick={() => navigate(`/request/${index}`)}>
        {request.description}
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="ETH Amount"
          id={`donate-${index}`}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() =>
            handleDonate(index, document.getElementById(`donate-${index}`).value)
          }
          className="px-4 py-2 text-white rounded"
        >
          Donate
        </button>
      </div>
      </CardContent>
    </Card>
    </SpotlightCard>

  );
}
