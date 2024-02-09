// import * as FileSystem from 'expo-file-system';

// // // Deletes whole giphy directory with all its content
// // export async function deleteAllGifs() {
// //     console.log('Deleting all GIF files…');
// //     await FileSystem.deleteAsync(gifDir);
// //   }

// async function ensureDirExists(path: string) {
//   const fileInfo = await FileSystem.getInfoAsync(path);
//   if (!fileInfo.exists) {
//     console.log("Gif directory doesn't exist, creating…");
//     await FileSystem.makeDirectoryAsync(path, { intermediates: true });
//   }
// }

// export const downloadDeck = async () => {
//   try {
//     const filename = 'dummy.pdf';
//     //  await ensureDirExists(filename);
//     const result = await FileSystem.downloadAsync(
//       'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
//       FileSystem.documentDirectory + filename
//     );

//     // Log the download result
//     console.log(result);

//     // Save the downloaded file
//     await saveFile(result.uri, filename, result.headers['content-type']);
//     console.log('saved file');
//   } catch (error) {
//     console.log(error);
//   }
// };

// const saveFile = async (uri: string, filename: string, mimetype: string) => {
//   const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  
//   if (permissions.granted) {
//     const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

//     await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
//       .then(async (uri) => {
//         await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
//       })
//       .catch((e) => console.log(e));
//   } else {
//     console.log('permission not granted');
//     return false;
//   }

//   return true;
// };

// export const getDeck = () => {};

// export const updateCompletionStatus = () => {};
