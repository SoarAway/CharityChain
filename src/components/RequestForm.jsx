import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedContent } from "@/components/ui/AnimatedContent"; 
import { FileUpload } from "@/components/ui/file-upload";

export const CreateRequestForm = ({
  newRequestTitle,
  newRequestDesc,
  newRequestAmount,
  cid,
  w3client,
  setNewRequestTitle,
  setNewRequestDesc,
  setNewRequestAmount,
  setCid,
  setIsCreatingPost,
  handleRequestFunds
}) => (
  <div className="create-post-overlay p-4 shadow flex justify-center items-center ">
    <AnimatedContent
      distance={150}
      direction="vertical"
      reverse={false}
      config={{ tension: 80, friction: 20 }}
      initialOpacity={0.2}
      animateOpacity
      scale={1.1}
      threshold={0.2}
    >
      <Card className="bg-black card max-w-md">
        <CardHeader>
          <CardTitle>Create new request</CardTitle>
          <CardDescription>
            <input
              type="text"
              placeholder="Title"
              value={newRequestTitle}
              onChange={(e) => setNewRequestTitle(e.target.value)}
              className="p-2 border rounded mr-2 mb-2 block w-full"
            />
            <FileUpload
              onChange={async (fileList) => {
                if (!w3client || fileList.length === 0) return;
                try {
                  const cid = await w3client.uploadFile(fileList[0]);
                  setCid(cid.toString());
                } catch (err) {
                  console.error("Upload failed:", err);
                  alert("Upload failed. Check console for details.");
                }
              }}
            />
            {cid && (
              <p className="text-white mt-2">
                Uploaded:{" "}
                <a href={`https://ipfs.io/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
                  {cid}
                </a>
              </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            placeholder="Description"
            value={newRequestDesc}
            onChange={(e) => setNewRequestDesc(e.target.value)}
            className="p-2 border rounded mr-2 mb-2 block w-full"
          />
          <input
            type="number"
            placeholder="Amount in ETH"
            value={newRequestAmount}
            onChange={(e) => setNewRequestAmount(e.target.value)}
            className="p-2 border rounded mr-2 mb-2 block w-full"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => setIsCreatingPost(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleRequestFunds}>
              Submit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </AnimatedContent>
  </div>
);