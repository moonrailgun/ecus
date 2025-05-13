import os from "os";
import fs from "fs/promises";
import path from "path";
import extract from "extract-zip";

export async function processZipFile(zipFile: Buffer<ArrayBufferLike>) {
  const dirName = String(Date.now());
  const tempDir = path.join(os.tmpdir(), "expo", dirName);

  await fs.mkdir(tempDir, { recursive: true });

  const filePath = path.join(tempDir, "file.zip");
  await fs.writeFile(filePath, zipFile);

  await extract(filePath, {
    dir: tempDir,
  });

  await fs.rm(filePath); // remove zip file

  let unzipDir = tempDir;

  // open folder if its zip with folder
  const l = await fs.readdir(unzipDir, {
    withFileTypes: true,
  });
  if (l.length === 1 && l[0]?.isDirectory() === true) {
    unzipDir += "/" + l[0].name;
  }

  const filelist = await fs.readdir(unzipDir, {
    withFileTypes: true,
    recursive: true,
  });

  return filelist
    .filter((f) => f.isFile())
    .map((f) => {
      const p = path.resolve(f.parentPath, f.name);

      return {
        name: f.name,
        key: path.relative(unzipDir, p),
        path: p,
      };
    });
}
