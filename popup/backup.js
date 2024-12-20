function createCSVFromArray(array, fileName) {
    if (!Array.isArray(array) || array.length === 0) {
        throw new Error('Input should be a non-empty array of objects');
    }

    const headers = Object.keys(array[0]);
    const csvRows = array.map(obj => headers.map(header => obj[header]).join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Add BOM for UTF-8 encoding
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Example usage:
const data = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Jane', age: 25, city: 'Los Angeles' },
    { name: 'Mike', age: 35, city: 'Chicago' }
];

createCSVFromArray(data, 'output.csv');