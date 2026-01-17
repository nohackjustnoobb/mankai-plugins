async function getImage(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, {
    headers: { referer: "http://www.dm5.com/dm5api/" },
  });

  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);

  return new Promise((resolve) => {
    reader.onloadend = () => {
      const dataUrl = reader.result as string;

      resolve(dataUrl.split(",")[1]);
    };
  });
}

export default getImage;
