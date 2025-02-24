import { api } from "@/trpc/react";
import React from "react";
import {
  Alert,
  Button,
  Form,
  ReferenceFieldEdit,
  useEventWithLoading,
  useRefreshList,
} from "tushan";
import { useAdminStore } from "../useAdminStore";
import { toast } from "sonner";
import { closeModal } from "../AdminGlobalModal";

interface Props {
  deploymentId: string;
  runtimeVersion: string;
}
export const PromoteDeploymentModal: React.FC<Props> = React.memo((props) => {
  const { deploymentId, runtimeVersion } = props;
  const promoteMutation = api.deployment.promote.useMutation();
  const projectId = useAdminStore((state) => state.projectId);
  const refreshDeploymentList = useRefreshList("deployment");
  const refreshActiveList = useRefreshList("active");
  const trpcUtils = api.useUtils();

  const [handleSubmit, isLoading] = useEventWithLoading(async (values) => {
    if (!values.channel) {
      toast.error("Channel is necessary.");
      return;
    }

    await promoteMutation.mutateAsync({
      projectId,
      channelId: values.channel,
      runtimeVersion,
      deploymentId,
    });

    trpcUtils.deployment.activeDeployment.invalidate({
      projectId,
      runtimeVersion,
    });
    refreshDeploymentList();
    refreshActiveList();
    closeModal();
  });

  return (
    <div className="pt-4">
      <Alert
        className="mb-4"
        content="Promote will make user which in target will apply this deployment"
      />

      <Form layout="vertical" disabled={isLoading} onSubmit={handleSubmit}>
        <Form.Item label="Deployment Id">
          <div>{props.deploymentId}</div>
        </Form.Item>
        <Form.Item label="Runtime Version">
          <div>{props.runtimeVersion}</div>
        </Form.Item>
        <Form.Item label="Channel" field="channelId">
          {/* @ts-ignore */}
          <ReferenceFieldEdit
            options={{ reference: "channel", displayField: "name" }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" disabled={isLoading} htmlType="submit" long>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
});
PromoteDeploymentModal.displayName = "PromoteDeploymentModal";
