import { api } from "@/trpc/react";
import React from "react";
import { Button, Card, Input, Typography, useEvent } from "tushan";
import { IconCopy, IconRefresh } from "tushan/icon";
import copy from "copy-to-clipboard";
import { toast } from "sonner";

export const ApikeyPage: React.FC = React.memo(() => {
  const { data: apikey } = api.user.getApiKey.useQuery();
  const updateApikeyMutation = api.user.updateApiKey.useMutation();
  const trpcUtils = api.useUtils();

  const handleCopy = useEvent(() => {
    copy(apikey ?? "");
    toast("Copied!");
  });

  const handleRegenerate = useEvent(async () => {
    const newApikey = await updateApikeyMutation.mutateAsync();
    trpcUtils.user.getApiKey.setData(undefined, newApikey);
    toast("Regenerated!");
  });

  const command = `ecus init --apikey ${apikey}`;

  return (
    <Card>
      <Typography.Title heading={5} className="mb-2">
        Your api key is:
      </Typography.Title>
      <div>
        <Input style={{ width: 550 }} disabled={true} value={apikey ?? ""} />
        <Button icon={<IconCopy />} onClick={handleCopy} />
        <Button icon={<IconRefresh />} onClick={handleRegenerate} />
      </div>

      <div className="pt-4">
        <div>use this command to login.</div>
        <Typography.Text copyable={{ text: command }} code={true}>
          {command}
        </Typography.Text>
      </div>
    </Card>
  );
});
ApikeyPage.displayName = "ApikeyPage";
