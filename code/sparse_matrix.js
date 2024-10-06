const fs = require("fs");

class SparseMatrix {
  constructor(rowsOrFilePath, cols = null) {
    this.elements = new Map();

    if (typeof rowsOrFilePath === "string") {
      this.loadFromFile(rowsOrFilePath); // Load matrix from file
    } else {
      this.rows = rowsOrFilePath; // Initialize empty matrix
      this.cols = cols;
    }
  }

  loadFromFile(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const lines = fileContent.trim().split("\n");

      // Parse rows and columns
      const rowsMatch = lines[0].match(/rows=(\d+)/);
      const colsMatch = lines[1].match(/cols=(\d+)/);

      if (!rowsMatch || !colsMatch) {
        throw new Error("Invalid file format: rows or cols not found");
      }

      this.rows = parseInt(rowsMatch[1]);
      this.cols = parseInt(colsMatch[1]);

      // Parse matrix elements
      for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        const match = line.match(/\((\d+),\s*(\d+),\s*(-?\d+)\)/);

        if (!match) {
          throw new Error(
            "Invalid file format: matrix element not properly formatted"
          );
        }

        const [, row, col, value] = match;

        const rowIndex = parseInt(row);
        const colIndex = parseInt(col);
        const val = parseInt(value);

        if (
          rowIndex >= 0 &&
          rowIndex < this.rows &&
          colIndex >= 0 &&
          colIndex < this.cols
        ) {
          this.setElement(rowIndex, colIndex, val);
        } else {
          console.warn(
            `Index (${rowIndex}, ${colIndex}) out of matrix bounds.`
          );
        }
      }
    } catch (error) {
      throw new Error(`Error reading file: ${error.message}`);
    }
  }

  getElement(row, col) {
    const key = `${row},${col}`;
    return this.elements.get(key) || 0;
  }

  setElement(row, col, value) {
    if (value !== 0) {
      this.elements.set(`${row},${col}`, value);
    } else {
      this.elements.delete(`${row},${col}`);
    }
  }

  add(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Matrix dimensions do not match for addition");
    }

    const result = new SparseMatrix(this.rows, this.cols);

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const sum = this.getElement(row, col) + other.getElement(row, col);
        if (sum !== 0) {
          result.setElement(row, col, sum);
        }
      }
    }

    return result;
  }

  subtract(other) {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error("Matrix dimensions do not match for subtraction");
    }

    const result = new SparseMatrix(this.rows, this.cols);

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const diff = this.getElement(row, col) - other.getElement(row, col);
        if (diff !== 0) {
          result.setElement(row, col, diff);
        }
      }
    }

    return result;
  }

  multiply(other) {
    if (this.cols !== other.rows) {
      throw new Error(
        "Matrix dimensions are not compatible for multiplication"
      );
    }

    const result = new SparseMatrix(this.rows, other.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.getElement(i, k) * other.getElement(k, j);
        }
        if (sum !== 0) {
          result.setElement(i, j, sum);
        }
      }
    }

    return result;
  }

  toString() {
    let result = `Rows: ${this.rows}, Columns: ${this.cols}\n`;
    for (const [key, value] of this.elements) {
      const [row, col] = key.split(",");
      result += `(${row}, ${col}, ${value})\n`;
    }
    return result;
  }

  writeToFile(filePath) {
    try {
      fs.writeFileSync(filePath, this.toString(), "utf8");
      console.log(`Output matrix has been written to ${filePath}`);
    } catch (error) {
      throw new Error(`Error writing file: ${error.message}`);
    }
  }
}

// Example:
const matrix1 = new SparseMatrix("../sample_inputs/easy_sample_02_1.txt");
const matrix2 = new SparseMatrix("../sample_inputs/easy_sample_02_2.txt");

const additionResult = matrix1.add(matrix2);
additionResult.writeToFile("../output/addition_result.txt");

const subtractionResult = matrix1.subtract(matrix2);
subtractionResult.writeToFile("../output/substraction_result.txt");
