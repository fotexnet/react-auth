export function hasExpired(timestamp: number): boolean {
  if(timestamp){
    // Get the current timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Compare the provided timestamp with the current timestamp
    return timestamp < currentTimestamp;
  }
  return false
}
