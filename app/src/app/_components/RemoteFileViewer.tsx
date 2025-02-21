import { get } from "lodash-es";
import React, { useMemo, useState } from "react";
import { Card, JSONView, LoadingView, useThrottleEvent } from "tushan";
import { useWatch } from "tushan/client/hooks/useWatch";

interface RemoteFileViewerProps {
  url: string;
}
export const RemoteFileViewer: React.FC<RemoteFileViewerProps> = React.memo(
  (props) => {
    const { url } = props;
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchContent = useThrottleEvent(async (url) => {
      setLoading(true);
      setError("");
      setContent("");

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(String(get(err, "message")));
      } finally {
        setLoading(false);
      }
    });

    useWatch([url], async () => {
      if (!url) {
        return;
      }

      fetchContent(url);
    });

    const json = useMemo(() => {
      try {
        return JSON.parse(content);
      } catch {
        return String(content);
      }
    }, [content]);

    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        {loading && <LoadingView />}
        {error && <div className="text-red-500">Error: {error}</div>}
        {content && (
          <Card>
            {typeof json === "object" ? (
              <JSONView data={json} />
            ) : (
              <pre className="whitespace-pre-wrap break-words">{json}</pre>
            )}
          </Card>
        )}
      </div>
    );
  },
);
RemoteFileViewer.displayName = "RemoteFileViewer";
