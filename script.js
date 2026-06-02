// script.js
class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
    this.setupEventListeners();
  }

  // ────────────────────────────
  //  Reset everything
  // ────────────────────────────
  clear() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = null;
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  // ────────────────────────────
  //  Delete last character
  // ────────────────────────────
  delete() {
    if (this.shouldResetScreen) {
      this.currentOperand = "0";
      this.shouldResetScreen = false;
    }

    if (this.currentOperand.length === 1) {
      this.currentOperand = "0";
    } else if (this.currentOperand === "0") {
      return;
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  // ────────────────────────────
  //  Append a number
  // ────────────────────────────
  appendNumber(number) {
    if (this.shouldResetScreen) {
      this.currentOperand = "";
      this.shouldResetScreen = false;
    }

    // Prevent leading zeros like "007"
    if (this.currentOperand === "0" && number !== "0") {
      this.currentOperand = number;
    } else if (this.currentOperand === "0" && number === "0") {
      return;
    } else {
      // Limit input length
      if (this.currentOperand.replace(/[^0-9]/g, "").length >= 12) return;
      this.currentOperand += number;
    }
    this.updateDisplay();
  }

  // ────────────────────────────
  //  Append decimal point
  // ────────────────────────────
  appendDecimal() {
    if (this.shouldResetScreen) {
      this.currentOperand = "0";
      this.shouldResetScreen = false;
    }

    // Only one decimal per operand
    if (this.currentOperand.includes(".")) return;

    this.currentOperand += ".";
    this.updateDisplay();
  }

  // ────────────────────────────
  //  Handle operator selection
  // ────────────────────────────
  chooseOperation(operation) {
    const current = parseFloat(this.currentOperand);

    // If there's already a pending operation and user hasn't typed a new number,
    // just switch the operator
    if (this.operation !== null && this.shouldResetScreen) {
      this.operation = operation;
      this.previousOperand = `${this.formatNumber(this.previousOperandValue)} ${this.getOperationSymbol(operation)}`;
      this.updateDisplay();
      return;
    }

    if (this.operation !== null && !this.shouldResetScreen) {
      // Chain calculations
      const result = this.compute();
      this.currentOperand = result.toString();
      this.previousOperandValue = result;
    } else {
      this.previousOperandValue = current;
    }

    this.operation = operation;
    this.previousOperand = `${this.formatNumber(this.previousOperandValue)} ${this.getOperationSymbol(operation)}`;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  // ────────────────────────────
  //  Perform the calculation
  // ────────────────────────────
  compute() {
    const prev = this.previousOperandValue;
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return current;

    let result;
    switch (this.operation) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "×":
        result = prev * current;
        break;
      case "÷":
        if (current === 0) {
          return "Error";
        }
        result = prev / current;
        break;
      case "%":
        result = prev * (current / 100);
        break;
      default:
        return current;
    }

    // Handle floating-point precision
    result = Math.round(result * 1e10) / 1e10;

    // Limit result length
    const resultStr = result.toString();
    if (resultStr.replace(/[^0-9]/g, "").length > 12) {
      return parseFloat(result.toPrecision(10));
    }

    return result;
  }

  // ────────────────────────────
  //  Equals button pressed
  // ────────────────────────────
  handleEquals() {
    if (this.operation === null) return;
    if (this.shouldResetScreen) return;

    const result = this.compute();
    const prevOp = this.operation;
    const prevVal = parseFloat(this.currentOperand);

    this.previousOperand = `${this.formatNumber(this.previousOperandValue)} ${this.getOperationSymbol(prevOp)} ${this.formatNumber(prevVal)} =`;
    this.currentOperand = result.toString();
    this.operation = null;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  // ────────────────────────────
  //  Get display symbol
  // ────────────────────────────
  getOperationSymbol(op) {
    const symbols = { "+": "+", "-": "−", "×": "×", "÷": "÷", "%": "%" };
    return symbols[op] || op;
  }

  // ────────────────────────────
  //  Format number with commas
  // ────────────────────────────
  formatNumber(num) {
    if (num === "Error") return "Error";
    const parts = num.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  // ────────────────────────────
  //  Update the display
  // ────────────────────────────
  updateDisplay() {
    if (this.currentOperand === "Error") {
      this.currentOperandElement.textContent = "Error";
      this.previousOperandElement.textContent = "";
      // Auto-clear after error
      setTimeout(() => this.clear(), 1200);
      return;
    }

    let displayValue = this.currentOperand;

    // Format the current operand
    if (displayValue !== "0" && !displayValue.includes(".")) {
      // Don't format while typing decimal
    }
    const formatted = this.formatNumber(displayValue);

    // Adjust font size for long numbers
    const len = formatted.replace(/[,.-]/g, "").length;
    if (len > 10) {
      this.currentOperandElement.style.fontSize = "1.6rem";
    } else if (len > 7) {
      this.currentOperandElement.style.fontSize = "2rem";
    } else {
      this.currentOperandElement.style.fontSize = "2.6rem";
    }

    this.currentOperandElement.textContent = formatted;
    this.previousOperandElement.textContent = this.previousOperand;
  }

  // ────────────────────────────
  //  Set up button listeners
  // ────────────────────────────
  setupEventListeners() {
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        switch (action) {
          case "number":
            this.appendNumber(value);
            break;
          case "decimal":
            this.appendDecimal();
            break;
          case "operator":
            this.chooseOperation(value);
            break;
          case "equals":
            this.handleEquals();
            break;
          case "clear":
            this.clear();
            break;
          case "delete":
            this.delete();
            break;
          default:
            break;
        }
      });
    });

    // ── Keyboard support ──
    document.addEventListener("keydown", (e) => {
      const key = e.key;

      if (key >= "0" && key <= "9") {
        this.appendNumber(key);
      } else if (key === ".") {
        this.appendDecimal();
      } else if (key === "+") {
        this.chooseOperation("+");
      } else if (key === "-") {
        this.chooseOperation("-");
      } else if (key === "*") {
        this.chooseOperation("×");
      } else if (key === "/") {
        e.preventDefault(); // Prevent Firefox quick-find
        this.chooseOperation("÷");
      } else if (key === "%") {
        this.chooseOperation("%");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        this.handleEquals();
      } else if (key === "Escape" || key === "c" || key === "C") {
        this.clear();
      } else if (key === "Backspace") {
        this.delete();
      }
    });
  }
}

// ────────────────────────────
//  Initialize the calculator
// ────────────────────────────
const previousOperandElement = document.getElementById("previous-operand");
const currentOperandElement = document.getElementById("current-operand");

const calculator = new Calculator(
  previousOperandElement,
  currentOperandElement,
);
