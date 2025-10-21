// import { bucket } from "./gcsClient";

// export async function getSignedUrl(fileName: string) {
//   const file = bucket.file(fileName);

//   const [url] = await file.getSignedUrl({
//     version: "v4",
//     action: "read",
//     expires: Date.now() + 60 * 60 * 1000, // 1 hour
//   });

//   return url;
// }
