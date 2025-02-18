import os from "os";
import fs from "fs/promises";
import path from "path";
import extract from "extract-zip";

export async function processZipFile(zipFile: File) {
  const dirName = String(Date.now());
  const tempDir = path.join(os.tmpdir(), "expo", dirName);

  const buffer = Buffer.from(await zipFile.arrayBuffer());

  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, "file.zip");
  await fs.writeFile(filePath, buffer);

  await extract(filePath, {
    dir: tempDir,
  });

  await fs.rm(filePath);

  const filelist = await fs.readdir(tempDir, {
    withFileTypes: true,
    recursive: true,
  });

  return filelist
    .filter((f) => f.isFile())
    .map((f) => ({
      name: f.name,
      path: path.resolve(f.parentPath, f.name),
    }));
}
