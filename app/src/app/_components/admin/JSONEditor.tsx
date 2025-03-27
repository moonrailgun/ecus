import React, { useState } from "react";
import { JsonEditor } from "json-edit-react";
import { Button, useEvent } from "tushan";

interface JSONEditorProps {
  defaultValue: Record<string, unknown>;
  onConfirm?: (data: Record<string, unknown>) => void;
}
export const JSONEditor: React.FC<JSONEditorProps> = React.memo((props) => {
  const [data, setData] = useState(props.defaultValue);

  const handleConfirm = useEvent(() => {
    props.onConfirm?.(data);
  });

  const handleReset = useEvent(() => {
    setData(props.defaultValue);
  });

  return (
    <div>
      <JsonEditor
        data={data}
        onUpdate={({ newData }) => {
          setData(newData as Record<string, unknown>);
        }}
      />

      <div className="flex justify-end gap-1">
        <Button className="mt-2" onClick={handleReset}>
          Reset
        </Button>

        <Button className="mt-2" type="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
});
JSONEditor.displayName = "JSONEditor";
