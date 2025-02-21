import React from "react";
import {
  Button,
  Card,
  Form,
  Upload,
  useEventWithLoading,
  useNavigate,
} from "tushan";
import { useAdminStore } from "../useAdminStore";
import { get } from "lodash-es";
import { toast } from "sonner";

const FormItem = Form.Item;

export const DeploymentCreate: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);
  const navigate = useNavigate();
  const [handleSubmit, isLoading] = useEventWithLoading(
    async (args: unknown) => {
      const file = get(args, ["bundle", 0, "originFile"]);

      if (!(file instanceof File)) {
        toast.warning("Please upload file");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/${projectId}/upload`, {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(JSON.stringify(json));
        throw new Error(JSON.stringify(json));
      }

      toast.success("Upload success");

      navigate("/deployment");
    },
  );

  return (
    <Card>
      <Form style={{ width: 600 }} autoComplete="off" onSubmit={handleSubmit}>
        <FormItem label="Bundle" field="bundle" triggerPropName="fileList">
          <Upload
            drag
            multiple
            disabled={isLoading}
            directory={false}
            autoUpload={false}
            limit={1}
            accept="application/zip"
            tip="Only zip bundle can be uploaded"
          />
        </FormItem>
        <FormItem wrapperCol={{ offset: 5 }}>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Submit
          </Button>
        </FormItem>
      </Form>
    </Card>
  );
});
DeploymentCreate.displayName = "DeploymentCreate";
