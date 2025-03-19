import got, { Options, Progress } from "got";
import cliProgress from "cli-progress";

export async function uploadWithProgress(
  url: string,
  requestOptions: Options & { isStream?: true },
): Promise<string> {
  const res = got.stream.put(url, requestOptions);

  const uploadBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic,
  );
  uploadBar.start(100, 0);

  const stopProgress = () => {
    uploadBar.stop();
    console.log("Upload stopped.");
  };

  res.on("uploadProgress", (progress: Progress) => {
    if (progress.total) {
      uploadBar.setTotal(progress.total);
      uploadBar.update(progress.transferred);
    } else {
      uploadBar.setTotal(100);
      uploadBar.update(progress.percent);
    }

    if (progress.percent >= 100) {
      stopProgress();
    }
  });

  const chunks: Buffer[] = [];
  res.on("data", (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    res.on("end", () => {
      stopProgress();
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
    res.on("error", (err) => {
      reject(err);
    });
  });
}
