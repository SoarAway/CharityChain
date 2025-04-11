import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/ui/AnimatedContent";
import { FileUpload } from "@/components/ui/file-upload";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function RequestForm({
  newRequestTitle,
  newRequestDesc,
  newRequestAmount,
  cid,
  w3client,
  setNewRequestTitle,
  setNewRequestDesc,
  setNewRequestAmount,
  setCid,
  onCancel,
  onSubmit
}) {

  const [uploading, setUploading] = useState(false);

  return (
    <div className="create-post-overlay fixed inset-0 bg-black/50 flex items-center justify-center">
      <AnimatedContent
        distance={150}
        direction="vertical"
        config={{ tension: 80, friction: 20 }}
      >
        <Card className="bg-black text-white w-full max-w-md">
          <CardHeader>
            <CardTitle>New Funding Request</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newRequestTitle}
              onChange={(e) => setNewRequestTitle(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800"
            />
            
            <FileUpload
              onChange={async (files) => {
                if (files.length > 0 && w3client) {
                  try {
                    setUploading(true); // Start animation
                    const cid = await w3client.uploadFile(files[0]);
                    setCid(cid.toString());
                  } catch (error) {
                    console.error("Upload failed:", error);
                    alert("File upload failed");
                  } finally {
                    setUploading(false); // Stop animation
                  }
                }
              }}
            />

            {uploading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <Loader2 className="animate-spin w-4 h-4" />
                Uploading file to IPFS...
              </div>
            )}
            
            {cid && (
              <p className="text-sm break-all">
                IPFS CID: <a href={`https://ipfs.io/ipfs/${cid}`} className="text-blue-400">{cid}</a>
              </p>
            )}
            
            <textarea
              placeholder="Description"
              value={newRequestDesc}
              onChange={(e) => setNewRequestDesc(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 h-24"
            />
            
            <input
              type="number"
              placeholder="ETH Amount"
              value={newRequestAmount}
              onChange={(e) => setNewRequestAmount(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800"
            />
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button variant="destructive" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={onSubmit}>
              Submit Request
            </Button>
          </CardFooter>
        </Card>
      </AnimatedContent>
    </div>
  );
}