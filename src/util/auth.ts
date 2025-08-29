export const getAuthToken = (): string => {
  const apiKey = import.meta.env.VITE_API_KEY as string;
  if (!apiKey) {
    throw new Error("API key is not defined in environment variables");
  }
  return apiKey;
};