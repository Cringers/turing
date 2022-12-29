// Modulus which works correctly for negative values
export const mod = (n, m) => ((n % m) + m) % m;

// Create a deep copy of any type
export const deepCopy = (input) => JSON.parse(JSON.stringify(input));

// Create a new empty Point[][] filled with undefined
export const createBlankGrid = (dimension) => Array(dimension).fill(undefined).map(() => Array(dimension).fill(undefined));

