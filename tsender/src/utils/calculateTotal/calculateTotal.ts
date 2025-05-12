export function calculateTotal(input: string): number {
    if (!input) return 0;

    return input
    .split(/[\n,]+/) // Split on newlines or commas
    .map((str) => str.trim()) // Remove extra spaces
    .filter((str) => str !== "") // Remove empty entries
    .map(Number) // Convert to number
    .filter((num) => !isNaN(num)) // Filter out NaN
    .reduce((acc, num) => acc + num, 0); // Sum it all
}
